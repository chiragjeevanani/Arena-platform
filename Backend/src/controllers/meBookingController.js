const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const CourtSlot = require('../models/CourtSlot');
const Arena = require('../models/Arena');
const Payment = require('../models/Payment');
const ReferralSettings = require('../models/ReferralSettings');
const { getOrCreateWallet, deductFromWallet, refundBookingWallet } = require('../services/walletService');
const { computeDiscount, amountsMatch, roundMoney } = require('../services/pricing');
const { createNotification } = require('../services/notificationService');
const { markPaymentTerminalFailure } = require('../services/paymentFinalizationService');
const { onBookingConfirmed } = require('../services/bookingConfirmationService');
const { cancellationQuote, refundPaidBooking } = require('../services/refundService');
const { quoteCheckout, createCheckout } = require('../services/checkoutService');
const { findOwnResumableBooking } = require('../utils/bookingQuery');
const { evaluatePricing } = require('../services/pricingEngine');
const {
  isValidYmd,
  dayOfWeekOf,
  isSlotInPast,
  checkSlotBookable,
} = require('../services/slotAvailability');

function buildPricingResponse(engineRes, memberPricing) {
  return {
    baseAmount: engineRes.pricing.basePrice,
    discountPercent: memberPricing.discountPercent,
    discountAmount: memberPricing.discountAmount,
    finalAmount: memberPricing.finalAmount,
    pricingType: engineRes.pricing.type,
    peakSurcharge: engineRes.pricing.peakSurcharge,
    normalPrice: engineRes.pricing.basePrice,
    finalPrice: engineRes.pricing.finalPrice,
    membershipPlanIds: memberPricing.membershipPlanIds || [],
  };
}

async function createMyBooking(req, res) {
  const { arenaId, courtId, amount, paymentMethod } = req.body;
  const date = typeof req.body.date === 'string' ? req.body.date.trim() : '';
  const timeSlot = typeof req.body.timeSlot === 'string' ? req.body.timeSlot.trim() : '';

  if (!arenaId || !courtId || !date || !timeSlot) {
    return res.status(400).json({ error: 'arenaId, courtId, date, and timeSlot are required' });
  }

  // Strict YYYY-MM-DD: the slot-uniqueness index keys on the raw date string, so
  // "2026-1-5" and "2026-01-05" must never both be accepted.
  if (!isValidYmd(date)) {
    return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
  }

  if (isSlotInPast(date, timeSlot)) {
    return res.status(400).json({ error: 'Cannot book past dates or expired time slots' });
  }

  if (!mongoose.isValidObjectId(arenaId) || !mongoose.isValidObjectId(courtId)) {
    return res.status(400).json({ error: 'Invalid arena or court id' });
  }

  const court = await Court.findById(courtId);
  if (!court) {
    return res.status(404).json({ error: 'Court not found' });
  }

  if (court.arenaId.toString() !== String(arenaId)) {
    return res.status(400).json({ error: 'Court does not belong to this arena' });
  }

  const arena = await Arena.findById(arenaId);
  if (!arena || !arena.isPublished) {
    return res.status(404).json({ error: 'Arena not found' });
  }

  const userId = req.auth.sub;

  // Same rules as the public availability API: the slot must be offered to the public,
  // not blocked, not held by a slot membership, and not already paid for by someone.
  // (An unpaid 'pending' checkout never blocks others.)
  const bookable = await checkSlotBookable({ court, dateStr: date, timeSlot });
  if (!bookable.ok) {
    return res.status(bookable.status).json({ error: bookable.error });
  }
  const courtSlot = bookable.courtSlot;

  // Pricing engine is the authoritative price (peak hours, weekends, holidays...),
  // with any member discount applied on top.
  const engineRes = evaluatePricing({ arena, court, date, timeSlot, slot: courtSlot });
  const memberPricing = await computeDiscount(userId, arenaId, engineRes.price, 'booking');
  const pricing = buildPricingResponse(engineRes, memberPricing);

  // Resume the user's own unfinished checkout for this slot instead of creating a duplicate.
  const ownPendingBooking = await Booking.findOne(findOwnResumableBooking({ userId, courtId, date, timeSlot }));
  if (ownPendingBooking) {
    return res.status(200).json({
      booking: Booking.toPublic(ownPendingBooking, {
        arenaName: arena.name,
        courtName: court.name,
      }),
      pricing,
    });
  }

  const finalAmount = memberPricing.finalAmount;
  if (!amountsMatch(amount, finalAmount)) {
    return res.status(400).json({
      error: 'Amount does not match server pricing',
      pricing,
    });
  }

  const useWallet = req.body.useWallet === true || paymentMethod === 'wallet';

  let walletDebitAmount = 0;
  if (useWallet) {
    const settings = await ReferralSettings.getSettings();
    if (settings.walletUsageEnabled) {
      const wallet = await getOrCreateWallet(userId);
      if (paymentMethod === 'wallet' && wallet.balance < finalAmount) {
        return res.status(400).json({ error: 'Insufficient wallet balance', pricing });
      }
      walletDebitAmount = roundMoney(Math.min(wallet.balance, finalAmount));
    } else if (paymentMethod === 'wallet') {
      return res.status(400).json({ error: 'Wallet payments are currently disabled', pricing });
    }
  }

  const fullyWalletPaid = walletDebitAmount > 0 && walletDebitAmount >= finalAmount;
  const method = fullyWalletPaid ? 'wallet' : (walletDebitAmount > 0 ? 'partial_wallet' : 'online');

  let booking;
  try {
    booking = await Booking.create({
      userId,
      arenaId,
      courtId,
      date,
      timeSlot,
      amount: finalAmount,
      paymentMethod: method,
      paymentStatus: fullyWalletPaid ? 'paid' : 'pending',
      status: fullyWalletPaid ? 'confirmed' : 'pending',
      walletUsed: walletDebitAmount,
      paidAmount: roundMoney(finalAmount - walletDebitAmount),

      // Audit pricing snapshot — always matches what customer saw
      normalPrice: engineRes.pricing.basePrice,
      basePrice: engineRes.pricing.basePrice,
      peakPrice: engineRes.pricing.type === 'peak' ? engineRes.pricing.finalPrice : 0,
      peakSurcharge: engineRes.pricing.peakSurcharge,
      finalPrice: engineRes.pricing.finalPrice,
      pricingType: engineRes.pricing.type,
      pricingRuleId: engineRes.pricing.ruleId,
      pricingRuleName: engineRes.pricing.ruleName,
      priceCalculatedAt: new Date(),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'This time slot is already booked' });
    }
    throw err;
  }

  if (walletDebitAmount > 0) {
    try {
      await deductFromWallet(userId, walletDebitAmount, 'booking_payment', {
        bookingId: booking._id.toString(),
        arenaId: String(arenaId),
        courtId: String(courtId),
      });
    } catch (err) {
      // Balance changed since we read it — undo the booking rather than give it away.
      await Booking.deleteOne({ _id: booking._id });
      if (err.status === 400) {
        return res.status(400).json({ error: 'Insufficient wallet balance', pricing });
      }
      throw err;
    }
  }

  if (booking.status === 'confirmed') {
    await onBookingConfirmed(booking);
  }

  return res.status(201).json({
    booking: Booking.toPublic(booking, {
      arenaName: arena.name,
      courtName: court.name,
    }),
    pricing,
  });
}

async function listMyBookings(req, res) {
  const list = await Booking.find({ userId: req.auth.sub })
    .sort({ date: -1, createdAt: -1 })
    .lean();

  const arenaIds = [...new Set(list.map((b) => String(b.arenaId)))];
  const courtIds = [...new Set(list.map((b) => String(b.courtId)))];
  const [arenas, courts] = await Promise.all([
    Arena.find({ _id: { $in: arenaIds } }).select('name').lean(),
    Court.find({ _id: { $in: courtIds } }).select('name').lean(),
  ]);
  const arenaById = new Map(arenas.map((a) => [String(a._id), a]));
  const courtById = new Map(courts.map((c) => [String(c._id), c]));

  const out = list
    .map((b) => {
      const arena = arenaById.get(String(b.arenaId));
      const court = courtById.get(String(b.courtId));
      if (!arena || !court) return null;
      return Booking.toPublic(b, {
        arenaName: arena.name || '',
        courtName: court.name || '',
      });
    })
    .filter(Boolean);

  return res.json({ bookings: out });
}

/** GET /me/bookings/:id/cancel-quote — what cancelling now would refund (shown before confirming). */
async function getCancelQuote(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid booking id' });
  }
  const booking = await Booking.findOne({ _id: id, userId: req.auth.sub }).lean();
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  const cancellable = !['cancelled', 'completed'].includes(booking.status)
    && (booking.status === 'pending' || !isSlotInPast(booking.date, booking.timeSlot));
  return res.json({ cancellable, ...cancellationQuote(booking) });
}

async function cancelMyBooking(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid booking id' });
  }

  const existing = await Booking.findOne({ _id: id, userId: req.auth.sub }).lean();
  if (!existing) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  if (existing.status === 'cancelled') {
    return res.status(400).json({ error: 'Booking is already cancelled' });
  }
  if (existing.status === 'completed') {
    return res.status(400).json({ error: 'A completed booking cannot be cancelled' });
  }
  if (existing.status !== 'pending' && isSlotInPast(existing.date, existing.timeSlot)) {
    return res.status(400).json({ error: 'This booking has already started and can no longer be cancelled' });
  }

  const quote = cancellationQuote(existing);

  // Atomic status flip: two concurrent cancel requests can't both refund.
  // A paid booking cancelled inside the refund window keeps paymentStatus 'paid' (fee forfeited).
  const booking = await Booking.findOneAndUpdate(
    { _id: id, userId: req.auth.sub, status: existing.status },
    {
      $set: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: 'customer',
        ...(quote.paid ? {} : { paymentStatus: 'cancelled' }),
        ...(quote.paid && !quote.eligible ? { refundMethod: 'none', refundedAmount: 0 } : {}),
      },
    },
    { new: true }
  );
  if (!booking) {
    return res.status(409).json({ error: 'Booking was updated by another request — please refresh' });
  }

  // Cancel the associated open payment (and, for a cart checkout, its sibling bookings).
  const openPayment = await Payment.findOne({
    $or: [{ 'meta.bookingId': booking._id.toString() }, { 'meta.bookingIds': booking._id.toString() }],
    status: { $in: ['created', 'initiated', 'pending'] },
  });
  if (openPayment) {
    await markPaymentTerminalFailure(openPayment._id, {
      status: 'cancelled',
      failureReason: 'Booking cancelled by user',
    });
  }

  let refundedAmount = 0;
  let result = booking;
  if (!quote.paid) {
    // Unpaid checkout: return whatever the wallet put in (idempotent).
    refundedAmount = await refundBookingWallet(booking, 'booking_cancel');
  } else if (quote.eligible) {
    // Paid and cancelled in time: full refund as wallet credit.
    const out = await refundPaidBooking(booking._id, { method: 'wallet', by: 'customer', reason: 'booking_cancel' });
    refundedAmount = out.refundedAmount;
    result = out.booking;
  }

  const [arena, court] = await Promise.all([
    Arena.findById(booking.arenaId).lean(),
    Court.findById(booking.courtId).lean(),
  ]);

  const refundNote = refundedAmount > 0
    ? ` OMR ${refundedAmount.toFixed(3)} has been credited to your Arena Wallet.`
    : (quote.paid ? ` As it was cancelled less than ${quote.policyHours} hours before the slot, the booking fee is not refundable.` : '');
  await createNotification(
    req.auth.sub,
    'Booking Cancelled',
    `Your booking at ${arena?.name || 'Arena'} for ${booking.date} has been cancelled.${refundNote}`,
    'info',
    { bookingId: booking._id.toString() }
  );

  return res.json({
    booking: Booking.toPublic(result, {
      arenaName: arena?.name || '',
      courtName: court?.name || '',
    }),
    refund: { amount: refundedAmount, method: refundedAmount > 0 ? 'wallet' : 'none', policyHours: quote.policyHours },
  });
}

async function computeBookingPricing(req, res) {
  const { arenaId, courtId, date, timeSlot } = req.body;
  if (!arenaId || !mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Invalid arenaId' });
  }
  const arena = await Arena.findById(arenaId);
  if (!arena) return res.status(404).json({ error: 'Arena not found' });

  // Use pricingEngine if slot details provided, otherwise fall back to base rate
  if (courtId && mongoose.isValidObjectId(courtId) && isValidYmd(date) && timeSlot) {
    const court = await Court.findById(courtId).lean();
    const courtSlot = court
      ? await CourtSlot.findOne({
        courtId: String(courtId),
        arenaId: String(arenaId),
        dayOfWeek: dayOfWeekOf(date),
        timeSlot: String(timeSlot).trim(),
      }).lean()
      : null;
    const engineRes = evaluatePricing({ arena, court, date, timeSlot, slot: courtSlot });
    const memberPricing = await computeDiscount(req.auth.sub, arenaId, engineRes.price, 'booking');
    return res.json({ pricing: buildPricingResponse(engineRes, memberPricing) });
  }

  // Fallback: base rate + member discount only
  const { computeCourtBookingPrice } = require('../services/pricing');
  const pricing = await computeCourtBookingPrice(req.auth.sub, arena, 'booking');
  return res.json({ pricing });
}

function sendCheckoutError(res, err) {
  if (!err.status) throw err;
  return res.status(err.status).json({
    error: err.message,
    ...(err.lineIndex !== undefined ? { lineIndex: err.lineIndex, line: err.line } : {}),
  });
}

/**
 * POST /me/bookings/checkout/quote  { lines: [{ arenaId, courtId, date, timeSlot }], couponCode? }
 * Exact server price for an order (member discount + coupon), no side effects.
 */
async function quoteMyCheckout(req, res) {
  try {
    const { summary } = await quoteCheckout({ userId: req.auth.sub, lines: req.body?.lines, couponCode: req.body?.couponCode });
    return res.json({ quote: summary });
  } catch (err) {
    return sendCheckoutError(res, err);
  }
}

/**
 * POST /me/bookings/checkout  { lines, couponCode?, useWallet? }
 * Books every slot in one go (all-or-nothing). The app then pays summary.due for the
 * returned unpaid bookings with one gateway payment.
 */
async function checkoutMyBookings(req, res) {
  try {
    const out = await createCheckout({
      userId: req.auth.sub,
      lines: req.body?.lines,
      couponCode: req.body?.couponCode,
      useWallet: req.body?.useWallet === true,
    });
    return res.status(201).json(out);
  } catch (err) {
    return sendCheckoutError(res, err);
  }
}

module.exports = { createMyBooking, listMyBookings, cancelMyBooking, getCancelQuote, computeBookingPricing, quoteMyCheckout, checkoutMyBookings };
