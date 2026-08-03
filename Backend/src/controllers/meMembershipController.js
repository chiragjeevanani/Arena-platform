const mongoose = require('mongoose');
const MembershipPlan = require('../models/MembershipPlan');
const UserMembership = require('../models/UserMembership');
const Arena = require('../models/Arena');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const CourtSlot = require('../models/CourtSlot');
const Booking = require('../models/Booking');
const PointsWallet = require('../models/PointsWallet');
const PointsTransaction = require('../models/PointsTransaction');
const PointsDiscountConfig = require('../models/PointsDiscountConfig');
const { getOrCreateWallet } = require('../services/walletService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_MAP = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function getOccurrenceDates(startDate, endDate, targetDayOfWeek) {
  const targetDay = DAY_MAP[targetDayOfWeek];
  if (targetDay === undefined) return [];
  const dates = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  while (cursor <= end) {
    if (cursor.getDay() === targetDay) {
      dates.push(cursor.toISOString().slice(0, 10));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

async function getOrCreatePointsWallet(userId) {
  let wallet = await PointsWallet.findOne({ userId });
  if (!wallet) wallet = await PointsWallet.create({ userId, points: 0 });
  return wallet;
}

// ─── List My Memberships ──────────────────────────────────────────────────────

async function listMyMemberships(req, res) {
  const userId = req.auth.sub;
  const list = await UserMembership.find({ userId }).sort({ expiresAt: -1 }).lean();

  const plans = await MembershipPlan.find({
    _id: { $in: list.map((m) => m.membershipPlanId) },
  }).lean();
  const planById = new Map(plans.map((p) => [p._id.toString(), p]));

  const out = list.map((m) => {
    const plan = planById.get(String(m.membershipPlanId));
    return UserMembership.toPublic(m, {
      planName: plan?.name || '',
      discountPercent: plan?.discountPercent ?? 0,
      slotBased: plan?.slotBased || false,
      category: plan?.category || 'non-premium',
      description: plan?.description || '',
    });
  });

  return res.json({ memberships: out });
}

// ─── Purchase Membership ──────────────────────────────────────────────────────

async function purchaseMembership(req, res) {
  const userId = req.auth.sub;
  const { planId, bookedSlots, usePoints = false, startDate } = req.body;

  if (!planId || !mongoose.isValidObjectId(planId)) {
    return res.status(400).json({ error: 'Valid planId is required' });
  }

  const plan = await MembershipPlan.findOne({ _id: planId, isActive: true });
  if (!plan) {
    return res.status(404).json({ error: 'Membership plan not found' });
  }

  // ── Non-slot-based (existing flow) ──────────────────────────────────────────
  if (!plan.slotBased) {
    if (!plan.isGlobal) {
      const arena = await Arena.findById(plan.arenaId);
      if (!arena) return res.status(404).json({ error: 'Arena not found' });
    }

    const wallet = await getOrCreateWallet(userId);
    const price = Number(plan.price);

    const updatedWallet = await Wallet.findOneAndUpdate(
      { _id: wallet._id, balance: { $gte: price } },
      { $inc: { balance: -price } },
      { new: true }
    );

    if (!updatedWallet) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    await WalletTransaction.create({
      walletId: wallet._id,
      userId,
      type: 'debit',
      amount: price,
      reason: 'membership_purchase',
      balanceAfter: updatedWallet.balance,
      meta: { membershipPlanId: plan._id.toString(), arenaId: plan.arenaId ? plan.arenaId.toString() : null },
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + Number(plan.durationDays) * 86400000);

    const membership = await UserMembership.create({
      userId,
      membershipPlanId: plan._id,
      arenaId: plan.isGlobal ? null : plan.arenaId,
      startsAt: now,
      expiresAt,
      status: 'active',
      amountPaid: price,
    });

    return res.status(201).json({
      membership: UserMembership.toPublic(membership, {
        planName: plan.name,
        discountPercent: plan.discountPercent,
      }),
      wallet: Wallet.toPublic(updatedWallet),
    });
  }

  // ── Slot-based flow ──────────────────────────────────────────────────────────

  if (!Array.isArray(bookedSlots) || bookedSlots.length === 0) {
    return res.status(400).json({ error: 'bookedSlots array is required for slot-based plans' });
  }

  // Validate plan has an arena
  const arena = await Arena.findById(plan.arenaId).lean();
  if (!arena) return res.status(404).json({ error: 'Arena not found' });

  const now = new Date();
  const membershipStart = startDate ? new Date(startDate) : now;
  if (membershipStart < now) {
    return res.status(400).json({ error: 'startDate cannot be in the past' });
  }
  const expiresAt = new Date(membershipStart.getTime() + Number(plan.durationDays) * 86400000);
  const startStr = membershipStart.toISOString().slice(0, 10);
  const endStr = expiresAt.toISOString().slice(0, 10);

  // Validate each slot and check for conflicts
  const resolvedSlots = [];
  for (const slotEntry of bookedSlots) {
    const { courtSlotId } = slotEntry;
    if (!mongoose.isValidObjectId(courtSlotId)) {
      return res.status(400).json({ error: `Invalid courtSlotId: ${courtSlotId}` });
    }

    const courtSlot = await CourtSlot.findById(courtSlotId).lean();
    if (!courtSlot) {
      return res.status(404).json({ error: `CourtSlot not found: ${courtSlotId}` });
    }
    if (courtSlot.arenaId.toString() !== plan.arenaId.toString()) {
      return res.status(400).json({ error: `CourtSlot ${courtSlotId} does not belong to the plan's arena` });
    }

    const occurrences = getOccurrenceDates(startStr, endStr, courtSlot.dayOfWeek);

    const holdMinutes = Number(process.env.BOOKING_PAYMENT_HOLD_MINUTES) || 15;
    const holdCutoff = new Date(Date.now() - holdMinutes * 60 * 1000);

    // Check regular bookings
    const bookedConflict = await Booking.findOne({
      courtId: courtSlot.courtId,
      timeSlot: courtSlot.timeSlot,
      date: { $in: occurrences },
      $or: [
        { status: 'confirmed' },
        { status: 'rescheduled' },
        {
          status: 'pending',
          paymentStatus: 'pending',
          createdAt: { $gte: holdCutoff },
        },
      ],
    }).lean();

    if (bookedConflict) {
      return res.status(409).json({
        error: `Slot ${courtSlot.timeSlot} on ${courtSlot.dayOfWeek}s is already booked on ${bookedConflict.date}`,
        conflictDate: bookedConflict.date,
        courtSlotId,
      });
    }

    // Check overlapping slot memberships
    const membershipConflict = await UserMembership.findOne({
      status: 'active',
      'bookedSlots.courtSlotId': new mongoose.Types.ObjectId(courtSlotId),
      startsAt: { $lte: expiresAt },
      expiresAt: { $gte: membershipStart },
    }).lean();

    if (membershipConflict) {
      return res.status(409).json({
        error: `Slot ${courtSlot.timeSlot} on ${courtSlot.dayOfWeek}s is already reserved under another membership in this period`,
        courtSlotId,
      });
    }

    resolvedSlots.push({
      courtSlotId: courtSlot._id,
      courtId: courtSlot.courtId,
      arenaId: courtSlot.arenaId,
    });
  }

  // Calculate price
  const numSlots = resolvedSlots.length;
  const basePrice = plan.price + plan.pricePerSlot * (numSlots - 1);
  let finalPrice = basePrice;
  let pointsDebited = 0;
  let discountPercent = 0;

  // Apply points discount
  if (usePoints) {
    const [pointsWallet, discountConfig] = await Promise.all([
      getOrCreatePointsWallet(userId),
      PointsDiscountConfig.findOne({ arenaId: null }).lean(),
    ]);

    discountPercent = PointsDiscountConfig.computeDiscount(discountConfig, pointsWallet.points);
    if (discountPercent > 0) {
      const discountAmount = Math.floor((basePrice * discountPercent) / 100);
      finalPrice = basePrice - discountAmount;

      // Find required points for this tier
      const sorted = (discountConfig.tiers || []).sort((a, b) => b.pointsRequired - a.pointsRequired);
      const matched = sorted.find((t) => pointsWallet.points >= t.pointsRequired);
      pointsDebited = matched?.pointsRequired || 0;

      // Debit points
      const updatedPointsWallet = await PointsWallet.findOneAndUpdate(
        { _id: pointsWallet._id, points: { $gte: pointsDebited } },
        { $inc: { points: -pointsDebited } },
        { new: true }
      );
      if (!updatedPointsWallet) {
        return res.status(400).json({ error: 'Insufficient points balance' });
      }

      await PointsTransaction.create({
        userId,
        type: 'debit',
        points: pointsDebited,
        reason: 'membership_discount_applied',
        balanceAfter: updatedPointsWallet.points,
        meta: { membershipPlanId: plan._id.toString(), discountPercent, discountAmount },
      });
    }
  }

  // Debit wallet
  const wallet = await getOrCreateWallet(userId);
  const updatedWallet = await Wallet.findOneAndUpdate(
    { _id: wallet._id, balance: { $gte: finalPrice } },
    { $inc: { balance: -finalPrice } },
    { new: true }
  );

  if (!updatedWallet) {
    // Refund any debited points if wallet fails
    if (pointsDebited > 0) {
      await PointsWallet.findOneAndUpdate({ userId }, { $inc: { points: pointsDebited } });
    }
    return res.status(400).json({ error: 'Insufficient wallet balance' });
  }

  await WalletTransaction.create({
    walletId: wallet._id,
    userId,
    type: 'debit',
    amount: finalPrice,
    reason: 'membership_slot_purchase',
    balanceAfter: updatedWallet.balance,
    meta: {
      membershipPlanId: plan._id.toString(),
      arenaId: plan.arenaId.toString(),
      numSlots,
      basePrice,
      discountPercent,
      pointsUsed: pointsDebited,
    },
  });

  const membership = await UserMembership.create({
    userId,
    membershipPlanId: plan._id,
    arenaId: plan.arenaId,
    startsAt: membershipStart,
    expiresAt,
    status: 'active',
    bookedSlots: resolvedSlots,
    amountPaid: finalPrice,
    pointsUsed: pointsDebited,
    bonusPointsEarned: 0,
  });

  return res.status(201).json({
    membership: UserMembership.toPublic(membership, {
      planName: plan.name,
      discountPercent: plan.discountPercent,
    }),
    pricing: { basePrice, discountPercent, finalPrice, pointsUsed: pointsDebited },
    wallet: Wallet.toPublic(updatedWallet),
  });
}

module.exports = { listMyMemberships, purchaseMembership };
