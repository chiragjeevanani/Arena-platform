const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const CourtSlot = require('../models/CourtSlot');
const Arena = require('../models/Arena');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const User = require('../models/User');
const Referral = require('../models/Referral');
const ReferralSettings = require('../models/ReferralSettings');
const { getOrCreateWallet } = require('../services/walletService');
const { computeDiscount, amountsMatch } = require('../services/pricing');
const { createNotification } = require('../services/notificationService');
const { markPaymentTerminalFailure } = require('../services/paymentFinalizationService');
const { buildCourtSlotConflictQuery } = require('../utils/bookingQuery');
const { evaluatePricing } = require('../services/pricingEngine');

function parseBackendSlotStartDateTime(dateInput, timeSlot) {
  if (!dateInput || !timeSlot || typeof timeSlot !== 'string') return null;
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  const str = timeSlot.trim();
  let hour = null;
  let minute = 0;
  const m12 = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    minute = parseInt(m12[2], 10);
    const ap = m12[3].toUpperCase();
    if (ap === 'PM' && h !== 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    hour = h;
  } else {
    const m24 = str.match(/^(\d{1,2}):(\d{2})/);
    if (m24) {
      hour = parseInt(m24[1], 10);
      minute = parseInt(m24[2], 10);
    }
  }
  if (hour === null) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, minute, 0, 0);
}

function isBackendBookingInPast(dateInput, timeSlot) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const bookingDate = new Date(dateInput);
  if (Number.isNaN(bookingDate.getTime())) return true;
  const bookingDayStart = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate()).getTime();

  if (bookingDayStart < todayStart) {
    return true; // Past date
  }

  if (bookingDayStart === todayStart) {
    const slotStart = parseBackendSlotStartDateTime(dateInput, timeSlot);
    if (slotStart && slotStart.getTime() <= now.getTime()) {
      return true; // Past time slot on today
    }
  }
  return false;
}

async function createMyBooking(req, res) {
  const { arenaId, courtId, date, timeSlot, amount, paymentMethod } = req.body;

  if (!arenaId || !courtId || !date || !timeSlot) {
    return res.status(400).json({ error: 'arenaId, courtId, date, and timeSlot are required' });
  }

  if (isBackendBookingInPast(date, timeSlot)) {
    return res.status(400).json({ error: 'Cannot book past dates or expired time slots' });
  }

  if (!mongoose.isValidObjectId(arenaId) || !mongoose.isValidObjectId(courtId)) {
    return res.status(400).json({ error: 'Invalid arena or court id' });
  }

  const court = await Court.findById(courtId);
  if (!court) {
    return res.status(404).json({ error: 'Court not found' });
  }

  if (court.arenaId.toString() !== arenaId) {
    return res.status(400).json({ error: 'Court does not belong to this arena' });
  }

  const arena = await Arena.findById(arenaId);
  if (!arena || !arena.isPublished) {
    return res.status(404).json({ error: 'Arena not found' });
  }

  const userId = req.auth.sub;

  const existingBooking = await Booking.findOne(buildCourtSlotConflictQuery({ courtId, date, timeSlot }));
  if (existingBooking) {
    if (existingBooking.userId.toString() === userId && existingBooking.paymentStatus === 'pending') {
      // Look up CourtSlot for correct pricing on re-use
      const existingCourtSlot = await CourtSlot.findOne({
        courtId: String(courtId),
        arenaId: String(arenaId),
        timeSlot: String(timeSlot).trim(),
      }).lean();
      const engineResExisting = evaluatePricing({ arena, court, date, timeSlot, slot: existingCourtSlot });
      const pricingExisting = await computeDiscount(userId, arenaId, engineResExisting.price, 'booking');
      return res.status(200).json({
        booking: Booking.toPublic(existingBooking, {
          arenaName: arena.name,
          courtName: court.name,
        }),
        pricing: {
          baseAmount: engineResExisting.pricing.basePrice,
          discountPercent: pricingExisting.discountPercent,
          discountAmount: pricingExisting.discountAmount,
          finalAmount: pricingExisting.finalAmount,
          pricingType: engineResExisting.pricing.type,
          peakSurcharge: engineResExisting.pricing.peakSurcharge,
          normalPrice: engineResExisting.pricing.basePrice,
          finalPrice: engineResExisting.pricing.finalPrice,
          membershipPlanIds: pricingExisting.membershipPlanIds || [],
        },
      });
    } else {
      return res.status(409).json({ error: 'This time slot is already booked' });
    }
  }

  // Fetch the CourtSlot document for this specific time slot to get accurate startTime for pricing engine
  const courtSlot = await CourtSlot.findOne({
    courtId: String(courtId),
    arenaId: String(arenaId),
    timeSlot: String(timeSlot).trim(),
  }).lean();

  // Use pricingEngine as the authoritative price source (respects peak hours, weekends, etc.)
  const engineRes = evaluatePricing({ arena, court, date, timeSlot, slot: courtSlot });

  // Apply member discount (if any) on top of engine-computed price
  const memberPricing = await computeDiscount(userId, arenaId, engineRes.price, 'booking');

  const serverFinalAmount = memberPricing.finalAmount;

  const pricing = {
    baseAmount: engineRes.pricing.basePrice,
    discountPercent: memberPricing.discountPercent,
    discountAmount: memberPricing.discountAmount,
    finalAmount: serverFinalAmount,
    pricingType: engineRes.pricing.type,
    peakSurcharge: engineRes.pricing.peakSurcharge,
    normalPrice: engineRes.pricing.basePrice,
    finalPrice: engineRes.pricing.finalPrice,
    membershipPlanIds: memberPricing.membershipPlanIds || [],
  };

  if (!amountsMatch(amount, serverFinalAmount)) {
    return res.status(400).json({
      error: 'Amount does not match server pricing',
      pricing,
    });
  }

  const finalAmount = serverFinalAmount;
  const useWallet = req.body.useWallet === true || paymentMethod === 'wallet';

  let walletDebit = null;
  let walletDebitAmount = 0;

  if (useWallet) {
    const settings = await ReferralSettings.getSettings();
    if (settings.walletUsageEnabled) {
      const wallet = await getOrCreateWallet(userId);
      walletDebitAmount = Math.min(wallet.balance, finalAmount);

      if (paymentMethod === 'wallet' && wallet.balance < finalAmount) {
        return res.status(400).json({ error: 'Insufficient wallet balance', pricing });
      }

      if (walletDebitAmount > 0) {
        const updated = await Wallet.findOneAndUpdate(
          { _id: wallet._id, balance: { $gte: walletDebitAmount } },
          { $inc: { balance: -walletDebitAmount } },
          { new: true }
        );
        if (!updated) {
          return res.status(400).json({ error: 'Insufficient wallet balance', pricing });
        }
        walletDebit = { walletId: wallet._id, amount: walletDebitAmount, balanceAfter: updated.balance };
      }
    }
  }

  try {
    const method = walletDebitAmount === finalAmount ? 'wallet' : (walletDebitAmount > 0 ? 'partial_wallet' : (paymentMethod || 'online'));
    const payStatus = walletDebitAmount === finalAmount ? 'paid' : 'pending';

    const booking = await Booking.create({
      userId,
      arenaId,
      courtId,
      date: String(date).trim(),
      timeSlot: String(timeSlot).trim(),
      amount: finalAmount,
      paymentMethod: method,
      paymentStatus: payStatus,
      status: payStatus === 'paid' ? 'confirmed' : 'pending',
      walletUsed: walletDebitAmount,
      paidAmount: finalAmount - walletDebitAmount,

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

    if (walletDebit) {
      await WalletTransaction.create({
        walletId: walletDebit.walletId,
        userId,
        type: 'debit',
        amount: walletDebit.amount,
        reason: 'booking_payment',
        balanceAfter: walletDebit.balanceAfter,
        meta: {
          bookingId: booking._id.toString(),
          arenaId: String(arenaId),
          courtId: String(courtId),
        },
      });
    }

    // Check if this is the referred user's first successful booking for referral payout
    const isFirstBooking = (await Booking.countDocuments({
      userId,
      status: 'confirmed',
      _id: { $ne: booking._id },
    })) === 0;

    if (isFirstBooking) {
      const referral = await Referral.findOne({
        referredUserId: userId,
        status: 'pending',
        expiryDate: { $gt: new Date() },
      });

      if (referral) {
        // Mark referral as completed
        referral.status = 'completed';
        referral.bookingId = booking._id;
        await referral.save();

        // Credit Referrer
        const referrerWallet = await getOrCreateWallet(referral.referrerId);
        const referrerWalletUpdated = await Wallet.findByIdAndUpdate(
          referrerWallet._id,
          { $inc: { balance: referral.rewardAmountReferrer } },
          { new: true }
        );
        await WalletTransaction.create({
          walletId: referrerWallet._id,
          userId: referral.referrerId,
          type: 'credit',
          amount: referral.rewardAmountReferrer,
          reason: 'referral_reward',
          balanceAfter: referrerWalletUpdated.balance,
          meta: {
            bookingId: booking._id.toString(),
            referredUserId: userId,
          },
        });

        // Credit Referred User
        const referredWallet = await getOrCreateWallet(userId);
        const referredWalletUpdated = await Wallet.findByIdAndUpdate(
          referredWallet._id,
          { $inc: { balance: referral.rewardAmountReferred } },
          { new: true }
        );
        await WalletTransaction.create({
          walletId: referredWallet._id,
          userId,
          type: 'credit',
          amount: referral.rewardAmountReferred,
          reason: 'welcome_reward',
          balanceAfter: referredWalletUpdated.balance,
          meta: {
            bookingId: booking._id.toString(),
          },
        });

        // Notifications
        const user = await User.findById(userId).lean();
        const referrerUser = await User.findById(referral.referrerId).lean();
        if (referrerUser) {
          await createNotification(
            referral.referrerId,
            'Referral Reward Credited!',
            `Congratulations! You earned ₹${referral.rewardAmountReferrer} wallet credit as your referred friend ${user?.name || 'a friend'} made their first booking.`,
            'success',
            { bookingId: booking._id.toString() }
          );
        }

        await createNotification(
          userId,
          'Welcome Reward Credited!',
          `Welcome to Arena! You've received ₹${referral.rewardAmountReferred} welcome wallet credit for signing up with a referral code.`,
          'success',
          { bookingId: booking._id.toString() }
        );
      }
    }

    await createNotification(
      userId,
      'Booking Confirmed',
      `Your booking at ${arena.name} on ${date} at ${timeSlot} is confirmed.`,
      'success',
      { bookingId: booking._id.toString() }
    );

    return res.status(201).json({
      booking: Booking.toPublic(booking, {
        arenaName: arena.name,
        courtName: court.name,
      }),
      pricing,
    });
  } catch (err) {
    if (err.code === 11000) {
      if (walletDebit) {
        await Wallet.findByIdAndUpdate(walletDebit.walletId, { $inc: { balance: walletDebit.amount } });
        const refunded = await Wallet.findById(walletDebit.walletId);
        await WalletTransaction.create({
          walletId: walletDebit.walletId,
          userId,
          type: 'credit',
          amount: walletDebit.amount,
          reason: 'refund',
          balanceAfter: refunded.balance,
          meta: { reason: 'booking_slot_conflict' },
        });
      }
      return res.status(409).json({ error: 'This time slot is already booked' });
    }
    throw err;
  }
}

async function listMyBookings(req, res) {
  const list = await Booking.find({ userId: req.auth.sub })
    .sort({ date: -1, createdAt: -1 })
    .lean();

  const out = (await Promise.all(
    list.map(async (b) => {
      const [arena, court] = await Promise.all([
        Arena.findById(b.arenaId).lean(),
        Court.findById(b.courtId).lean(),
      ]);
      if (!arena || !court) return null;
      return Booking.toPublic(b, {
        arenaName: arena?.name || '',
        courtName: court?.name || '',
      });
    })
  )).filter(Boolean);

  return res.json({ bookings: out });
}

async function cancelMyBooking(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid booking id' });
  }

  const booking = await Booking.findOne({
    _id: id,
    userId: req.auth.sub,
  });
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ error: 'Booking is already cancelled' });
  }

  const isWalletPaid = booking.paymentMethod === 'wallet' && booking.paymentStatus === 'paid';
  const isPartialWallet = booking.walletUsed > 0;
  const refundAmount = isWalletPaid ? booking.amount : (isPartialWallet ? booking.walletUsed : 0);

  booking.status = 'cancelled';
  booking.paymentStatus = isWalletPaid ? 'refunded' : 'cancelled';
  await booking.save();

  // Cancel associated open payment if any
  const Payment = require('../models/Payment');
  const openPayment = await Payment.findOne({
    'meta.bookingId': booking._id.toString(),
    status: { $in: ['created', 'initiated', 'pending'] },
  });
  if (openPayment) {
    await markPaymentTerminalFailure(openPayment._id, {
      status: 'cancelled',
      failureReason: 'Booking cancelled by user',
    });
  }

  if (refundAmount > 0) {
    const wallet = await getOrCreateWallet(req.auth.sub);
    const updated = await Wallet.findByIdAndUpdate(
      wallet._id,
      { $inc: { balance: refundAmount } },
      { new: true }
    );
    await WalletTransaction.create({
      walletId: wallet._id,
      userId: req.auth.sub,
      type: 'credit',
      amount: refundAmount,
      reason: 'refund',
      balanceAfter: updated.balance,
      meta: {
        bookingId: booking._id.toString(),
        reason: 'booking_cancel',
      },
    });
  }

  const arena = await Arena.findById(booking.arenaId).lean();
  const court = await Court.findById(booking.courtId).lean();

  await createNotification(
    req.auth.sub,
    'Booking Cancelled',
    `Your booking at ${arena?.name || 'Arena'} for ${booking.date} has been cancelled.`,
    'info',
    { bookingId: booking._id.toString() }
  );

  return res.json({
    booking: Booking.toPublic(booking, {
      arenaName: arena?.name || '',
      courtName: court?.name || '',
    }),
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
  if (courtId && date && timeSlot) {
    const court = await Court.findById(courtId).lean();
    const courtSlot = court ? await CourtSlot.findOne({ courtId: String(courtId), arenaId: String(arenaId), timeSlot: String(timeSlot).trim() }).lean() : null;
    const engineRes = evaluatePricing({ arena, court, date, timeSlot, slot: courtSlot });
    const memberPricing = await computeDiscount(req.auth.sub, arenaId, engineRes.price, 'booking');
    return res.json({
      pricing: {
        baseAmount: engineRes.pricing.basePrice,
        discountPercent: memberPricing.discountPercent,
        discountAmount: memberPricing.discountAmount,
        finalAmount: memberPricing.finalAmount,
        pricingType: engineRes.pricing.type,
        peakSurcharge: engineRes.pricing.peakSurcharge,
        normalPrice: engineRes.pricing.basePrice,
        finalPrice: engineRes.pricing.finalPrice,
        membershipPlanIds: memberPricing.membershipPlanIds || [],
      }
    });
  }

  // Fallback: base rate + member discount only
  const { computeCourtBookingPrice } = require('../services/pricing');
  const pricing = await computeCourtBookingPrice(req.auth.sub, arena, 'booking');
  return res.json({ pricing });
}

module.exports = { createMyBooking, listMyBookings, cancelMyBooking, computeBookingPricing };
