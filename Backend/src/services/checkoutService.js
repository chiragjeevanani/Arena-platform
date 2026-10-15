/**
 * Court checkout: one or more slots (any courts / dates) priced and booked together, so an
 * order-level coupon can apply to the whole order.
 *
 * Price per line: pricing engine (peak / weekend / holiday) → member discount. The coupon then
 * applies to the order total and is split across the lines in proportion to their price.
 * Bookings are created all-or-nothing; the wallet (if used) is taken line by line.
 */
const crypto = require('crypto');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Arena = require('../models/Arena');
const Payment = require('../models/Payment');
const ReferralSettings = require('../models/ReferralSettings');
const { evaluatePricing } = require('./pricingEngine');
const { computeDiscount, roundMoney } = require('./pricing');
const { isValidYmd, isSlotInPast, checkSlotBookable } = require('./slotAvailability');
const { resolveCoupon, splitDiscount } = require('./couponService');
const { getOrCreateWallet, deductFromWallet, refundBookingWallet } = require('./walletService');
const { onBookingConfirmed } = require('./bookingConfirmationService');
const { markPaymentTerminalFailure } = require('./paymentFinalizationService');

const MAX_LINES = 20; // matches the per-payment booking limit

function lineError(index, line, message, status = 400) {
  const err = new Error(message);
  err.status = status;
  err.lineIndex = index;
  err.line = line;
  return err;
}

/** Validates and prices every line. Throws (with lineIndex) on the first bad line. */
async function priceLines(userId, rawLines) {
  if (!Array.isArray(rawLines) || rawLines.length === 0) {
    const err = new Error('Add at least one slot');
    err.status = 400;
    throw err;
  }
  if (rawLines.length > MAX_LINES) {
    const err = new Error(`You can book up to ${MAX_LINES} slots at once`);
    err.status = 400;
    throw err;
  }

  const seen = new Set();
  const priced = [];
  const arenaCache = new Map();
  for (let i = 0; i < rawLines.length; i += 1) {
    const raw = rawLines[i] || {};
    const arenaId = String(raw.arenaId || '');
    const courtId = String(raw.courtId || '');
    const date = typeof raw.date === 'string' ? raw.date.trim() : '';
    const timeSlot = typeof raw.timeSlot === 'string' ? raw.timeSlot.trim() : '';
    const line = { arenaId, courtId, date, timeSlot };

    if (!mongoose.isValidObjectId(arenaId) || !mongoose.isValidObjectId(courtId)) {
      throw lineError(i, line, 'Invalid arena or court');
    }
    if (!isValidYmd(date) || !timeSlot) throw lineError(i, line, 'Invalid date or time slot');
    if (isSlotInPast(date, timeSlot)) throw lineError(i, line, 'This slot time has already passed');
    const key = `${courtId}|${date}|${timeSlot}`;
    if (seen.has(key)) throw lineError(i, line, 'The same slot is in your order twice');
    seen.add(key);

    const court = await Court.findById(courtId);
    if (!court || String(court.arenaId) !== arenaId) throw lineError(i, line, 'Court not found', 404);
    let arena = arenaCache.get(arenaId);
    if (!arena) {
      arena = await Arena.findById(arenaId);
      arenaCache.set(arenaId, arena);
    }
    if (!arena || !arena.isPublished) throw lineError(i, line, 'Arena not found', 404);

    const bookable = await checkSlotBookable({ court, dateStr: date, timeSlot });
    if (!bookable.ok) throw lineError(i, line, bookable.error, bookable.status);

    const engineRes = evaluatePricing({ arena, court, date, timeSlot, slot: bookable.courtSlot });
    const member = await computeDiscount(userId, arenaId, engineRes.price, 'booking');
    priced.push({
      ...line,
      arena,
      court,
      engineRes,
      basePrice: engineRes.price,
      memberDiscount: member.discountAmount || 0,
      memberDiscountPercent: member.discountPercent || 0,
      afterMember: member.finalAmount,
    });
  }
  return priced;
}

/** Full price breakdown for a set of lines + optional coupon (no side effects). */
async function quoteCheckout({ userId, lines, couponCode }) {
  const priced = await priceLines(userId, lines);
  const subtotal = roundMoney(priced.reduce((s, l) => s + l.basePrice, 0));
  const memberDiscount = roundMoney(priced.reduce((s, l) => s + l.memberDiscount, 0));
  const afterMember = roundMoney(priced.reduce((s, l) => s + l.afterMember, 0));

  let coupon = null;
  let couponDiscount = 0;
  if (couponCode) {
    const res = await resolveCoupon(couponCode, afterMember, userId);
    coupon = res.coupon;
    couponDiscount = res.discount;
  }
  const shares = splitDiscount(priced.map((l) => l.afterMember), couponDiscount);
  priced.forEach((l, i) => {
    l.couponDiscount = shares[i];
    l.finalAmount = roundMoney(Math.max(0, l.afterMember - shares[i]));
  });

  return {
    priced,
    coupon,
    summary: {
      subtotal,
      memberDiscount,
      couponCode: coupon ? coupon.code : null,
      couponDescription: coupon ? coupon.description || '' : '',
      couponDiscount,
      total: roundMoney(priced.reduce((s, l) => s + l.finalAmount, 0)),
      lines: priced.map((l) => ({
        arenaId: l.arenaId,
        courtId: l.courtId,
        date: l.date,
        timeSlot: l.timeSlot,
        price: l.basePrice,
        pricingType: l.engineRes.pricing.type,
        memberDiscount: l.memberDiscount,
        couponDiscount: l.couponDiscount,
        finalAmount: l.finalAmount,
      })),
    },
  };
}

/**
 * The user's own unpaid bookings for these slots belong to an abandoned earlier checkout:
 * release them (cancel their open payment, return wallet money) before booking again.
 */
async function releaseOwnPending(userId, priced) {
  for (const l of priced) {
    const stale = await Booking.find({
      userId, courtId: l.courtId, date: l.date, timeSlot: l.timeSlot, status: 'pending', paymentStatus: 'pending',
    });
    for (const b of stale) {
      const open = await Payment.findOne({
        $or: [{ 'meta.bookingId': String(b._id) }, { 'meta.bookingIds': String(b._id) }],
        status: { $in: ['created', 'initiated', 'pending'] },
      });
      if (open) {
        await markPaymentTerminalFailure(open._id, { status: 'cancelled', failureReason: 'Replaced by a new checkout' });
      }
      const cancelled = await Booking.findOneAndUpdate(
        { _id: b._id, status: 'pending' },
        { $set: { status: 'cancelled', paymentStatus: 'cancelled', cancelledAt: new Date(), cancelledBy: 'customer' } },
        { new: true }
      );
      if (cancelled) await refundBookingWallet(cancelled, 'replaced_by_new_checkout');
    }
  }
}

/** Creates the bookings for a checkout. Returns { bookings, summary, due }. */
async function createCheckout({ userId, lines, couponCode, useWallet }) {
  const { priced, coupon, summary } = await quoteCheckout({ userId, lines, couponCode });
  await releaseOwnPending(userId, priced);

  // Wallet: take what's available, line by line.
  let walletLeft = 0;
  if (useWallet) {
    const settings = await ReferralSettings.getSettings();
    if (settings.walletUsageEnabled) {
      walletLeft = roundMoney((await getOrCreateWallet(userId)).balance);
    }
  }
  const checkoutId = crypto.randomUUID();
  const created = [];
  try {
    for (const l of priced) {
      const walletUsed = roundMoney(Math.min(walletLeft, l.finalAmount));
      walletLeft = roundMoney(walletLeft - walletUsed);
      const fullyWallet = walletUsed > 0 && walletUsed >= l.finalAmount;
      const free = l.finalAmount === 0;
      const p = l.engineRes.pricing;
      const booking = await Booking.create({
        userId,
        arenaId: l.arenaId,
        courtId: l.courtId,
        date: l.date,
        timeSlot: l.timeSlot,
        amount: l.finalAmount,
        paymentMethod: free ? 'coupon' : fullyWallet ? 'wallet' : walletUsed > 0 ? 'partial_wallet' : 'online',
        paymentStatus: fullyWallet || free ? 'paid' : 'pending',
        status: fullyWallet || free ? 'confirmed' : 'pending',
        walletUsed,
        paidAmount: roundMoney(l.finalAmount - walletUsed),
        checkoutId,
        couponId: coupon ? coupon._id : null,
        couponCode: coupon ? coupon.code : '',
        couponDiscount: l.couponDiscount || 0,
        normalPrice: p.basePrice,
        basePrice: p.basePrice,
        peakPrice: p.type === 'peak' ? p.finalPrice : 0,
        peakSurcharge: p.peakSurcharge,
        finalPrice: p.finalPrice,
        pricingType: p.type,
        pricingRuleId: p.ruleId,
        pricingRuleName: p.ruleName,
        priceCalculatedAt: new Date(),
      });
      created.push(booking);
      if (walletUsed > 0) {
        await deductFromWallet(userId, walletUsed, 'booking_payment', {
          bookingId: booking._id.toString(),
          checkoutId,
          arenaId: l.arenaId,
          courtId: l.courtId,
        });
      }
    }
  } catch (err) {
    // All-or-nothing: undo every booking (and wallet debit) made for this checkout.
    for (const b of created) {
      await refundBookingWallet(b, 'checkout_failed');
      await Booking.deleteOne({ _id: b._id });
    }
    if (err.code === 11000) {
      const idx = created.length;
      throw lineError(idx, priced[idx], 'This time slot was just booked by someone else', 409);
    }
    if (err.status === 400 && /wallet/i.test(err.message)) {
      const e = new Error('Your wallet balance changed — please try again');
      e.status = 409;
      throw e;
    }
    throw err;
  }

  // Bookings paid in full (wallet / 100% coupon) are confirmed now.
  for (const b of created) {
    if (b.status === 'confirmed') {
      await onBookingConfirmed(b);
    }
  }

  const due = roundMoney(created.filter((b) => b.paymentStatus !== 'paid').reduce((s, b) => s + b.paidAmount, 0));
  return {
    checkoutId,
    bookings: created.map((b) => {
      const l = priced.find((x) => x.courtId === String(b.courtId) && x.date === b.date && x.timeSlot === b.timeSlot);
      return Booking.toPublic(b, { arenaName: l?.arena?.name || '', courtName: l?.court?.name || '' });
    }),
    summary: { ...summary, walletUsed: roundMoney(created.reduce((s, b) => s + b.walletUsed, 0)), due },
  };
}

module.exports = { quoteCheckout, createCheckout };
