const mongoose = require('mongoose');
const CourtSlot = require('../models/CourtSlot');
const Court = require('../models/Court');
const Arena = require('../models/Arena');
const Booking = require('../models/Booking');
const UserMembership = require('../models/UserMembership');
const MembershipPlan = require('../models/MembershipPlan');
const SlotFreeRequest = require('../models/SlotFreeRequest');
const PointsWallet = require('../models/PointsWallet');
const PointsTransaction = require('../models/PointsTransaction');
const PointsDiscountConfig = require('../models/PointsDiscountConfig');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const { getOrCreateWallet } = require('../services/walletService');
const { createNotification } = require('../services/notificationService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_MAP = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/**
 * Returns all "YYYY-MM-DD" dates between startDate and endDate (inclusive)
 * whose day-of-week matches targetDayOfWeek (e.g. "Mon").
 */
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

/**
 * Get or create a PointsWallet for a user.
 */
async function getOrCreatePointsWallet(userId) {
  let wallet = await PointsWallet.findOne({ userId });
  if (!wallet) {
    wallet = await PointsWallet.create({ userId, points: 0 });
  }
  return wallet;
}

// ─── Check Slot Availability ──────────────────────────────────────────────────

/**
 * POST /me/slot-memberships/check-availability
 * Body: { courtSlotIds: [id, ...], startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD" }
 * Returns: { available: true } or { available: false, conflicts: [...] }
 */
async function checkSlotAvailability(req, res) {
  const { courtSlotIds, startDate, endDate } = req.body;

  if (!Array.isArray(courtSlotIds) || courtSlotIds.length === 0) {
    return res.status(400).json({ error: 'courtSlotIds array is required' });
  }
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required' });
  }

  const conflicts = [];

  for (const slotId of courtSlotIds) {
    if (!mongoose.isValidObjectId(slotId)) {
      return res.status(400).json({ error: `Invalid courtSlotId: ${slotId}` });
    }

    const courtSlot = await CourtSlot.findById(slotId).lean();
    if (!courtSlot) {
      return res.status(404).json({ error: `CourtSlot not found: ${slotId}` });
    }

    const occurrences = getOccurrenceDates(startDate, endDate, courtSlot.dayOfWeek);

    // 1. Check regular bookings
    const bookedDates = await Booking.find({
      courtId: courtSlot.courtId,
      timeSlot: courtSlot.timeSlot,
      date: { $in: occurrences },
      status: { $in: ['confirmed', 'pending', 'rescheduled'] },
    })
      .select('date')
      .lean();

    // 2. Check other active slot memberships that include this slot
    const membershipConflicts = await UserMembership.find({
      status: 'active',
      'bookedSlots.courtSlotId': new mongoose.Types.ObjectId(slotId),
      startsAt: { $lte: new Date(endDate) },
      expiresAt: { $gte: new Date(startDate) },
    })
      .select('startsAt expiresAt')
      .lean();

    const membershipConflictDates = [];
    for (const mem of membershipConflicts) {
      const overlapStart = new Date(Math.max(new Date(startDate), mem.startsAt));
      const overlapEnd = new Date(Math.min(new Date(endDate), mem.expiresAt));
      const overlapDates = getOccurrenceDates(
        overlapStart.toISOString().slice(0, 10),
        overlapEnd.toISOString().slice(0, 10),
        courtSlot.dayOfWeek
      );
      membershipConflictDates.push(...overlapDates);
    }

    const allConflictDates = [
      ...new Set([
        ...bookedDates.map((b) => b.date),
        ...membershipConflictDates,
      ]),
    ].sort();

    if (allConflictDates.length > 0) {
      conflicts.push({
        courtSlotId: slotId,
        timeSlot: courtSlot.timeSlot,
        dayOfWeek: courtSlot.dayOfWeek,
        conflictingDates: allConflictDates,
      });
    }
  }

  if (conflicts.length > 0) {
    return res.status(409).json({
      available: false,
      conflicts,
      message: 'One or more slots have booking conflicts in the selected period',
    });
  }

  return res.json({ available: true, conflicts: [] });
}

// ─── Preview Pricing ──────────────────────────────────────────────────────────

/**
 * POST /me/slot-memberships/preview-pricing
 * Body: { planId, numSlots, usePoints }
 */
async function previewSlotMembershipPricing(req, res) {
  const { planId, numSlots = 1, usePoints = false } = req.body;
  const userId = req.auth.sub;

  if (!planId || !mongoose.isValidObjectId(planId)) {
    return res.status(400).json({ error: 'Valid planId is required' });
  }

  const plan = await MembershipPlan.findOne({ _id: planId, isActive: true, slotBased: true }).lean();
  if (!plan) return res.status(404).json({ error: 'Slot-based membership plan not found' });

  const slots = Math.max(1, Number(numSlots));
  const basePrice = plan.price + plan.pricePerSlot * (slots - 1);

  let discountPercent = 0;
  let pointsRequired = 0;
  let discountAmount = 0;

  if (usePoints) {
    const [pointsWallet, discountConfig] = await Promise.all([
      getOrCreatePointsWallet(userId),
      PointsDiscountConfig.findOne({ arenaId: null }).lean(),
    ]);

    discountPercent = PointsDiscountConfig.computeDiscount(discountConfig, pointsWallet.points);
    discountAmount = Math.floor((basePrice * discountPercent) / 100);

    // Find the matched tier to show required points
    if (discountConfig && discountPercent > 0) {
      const sorted = (discountConfig.tiers || []).sort((a, b) => b.pointsRequired - a.pointsRequired);
      const matched = sorted.find((t) => pointsWallet.points >= t.pointsRequired);
      pointsRequired = matched?.pointsRequired || 0;
    }
  }

  const finalAmount = basePrice - discountAmount;

  return res.json({
    plan: { id: plan._id.toString(), name: plan.name, durationDays: plan.durationDays },
    numSlots: slots,
    basePrice,
    discountPercent,
    discountAmount,
    finalAmount,
    pointsRequired,
  });
}

// ─── Get My Slot Memberships ──────────────────────────────────────────────────

async function getMySlotMemberships(req, res) {
  const userId = req.auth.sub;

  const memberships = await UserMembership.find({ userId, 'bookedSlots.0': { $exists: true } })
    .sort({ expiresAt: -1 })
    .lean();

  const planIds = [...new Set(memberships.map((m) => String(m.membershipPlanId)))];
  const plans = await MembershipPlan.find({ _id: { $in: planIds } }).lean();
  const planById = new Map(plans.map((p) => [p._id.toString(), p]));

  const courtSlotIds = [
    ...new Set(
      memberships.flatMap((m) => m.bookedSlots.map((s) => String(s.courtSlotId)))
    ),
  ];
  const courtSlots = await CourtSlot.find({ _id: { $in: courtSlotIds } }).lean();
  const courtSlotById = new Map(courtSlots.map((s) => [s._id.toString(), s]));

  const courtIds = [...new Set(memberships.flatMap((m) => m.bookedSlots.map((s) => String(s.courtId))))];
  const courts = await Court.find({ _id: { $in: courtIds } }).lean();
  const courtById = new Map(courts.map((c) => [c._id.toString(), c]));

  const out = memberships.map((m) => {
    const plan = planById.get(String(m.membershipPlanId));
    const bookedSlotsWithDetails = m.bookedSlots.map((s) => ({
      courtSlotId: String(s.courtSlotId),
      courtId: String(s.courtId),
      arenaId: String(s.arenaId),
      courtSlot: courtSlotById.get(String(s.courtSlotId)) || null,
      courtName: courtById.get(String(s.courtId))?.name || '',
    }));
    return UserMembership.toPublic(m, {
      planName: plan?.name || '',
      planDurationDays: plan?.durationDays || 0,
      bookedSlotsDetail: bookedSlotsWithDetails,
    });
  });

  return res.json({ memberships: out });
}

// ─── Free My Slot ─────────────────────────────────────────────────────────────

/**
 * POST /me/slot-memberships/:id/free-slot
 * Body: { courtSlotId, freedDate: "YYYY-MM-DD" }
 */
async function freeMySlot(req, res) {
  const userId = req.auth.sub;
  const { id } = req.params;
  const { courtSlotId, freedDate } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid membership id' });
  }
  if (!mongoose.isValidObjectId(courtSlotId)) {
    return res.status(400).json({ error: 'Invalid courtSlotId' });
  }
  if (!freedDate || !/^\d{4}-\d{2}-\d{2}$/.test(freedDate)) {
    return res.status(400).json({ error: 'freedDate must be in YYYY-MM-DD format' });
  }

  // 1. Load & verify membership
  const membership = await UserMembership.findOne({ _id: id, userId });
  if (!membership) {
    return res.status(404).json({ error: 'Membership not found' });
  }
  if (membership.status !== 'active') {
    return res.status(400).json({ error: 'Membership is not active' });
  }

  // 2. Verify the slot belongs to this membership
  const slotEntry = membership.bookedSlots.find(
    (s) => s.courtSlotId && s.courtSlotId.toString() === courtSlotId
  );
  if (!slotEntry) {
    return res.status(400).json({ error: 'This slot is not part of your membership' });
  }

  // 3. Verify the date is within the membership period
  const freeDate = new Date(freedDate);
  freeDate.setHours(12, 0, 0, 0); // midday to avoid timezone issues
  if (freeDate < new Date(membership.startsAt) || freeDate > new Date(membership.expiresAt)) {
    return res.status(400).json({ error: 'The date is outside your membership period' });
  }

  // 4. Verify day-of-week matches the court slot
  const courtSlot = await CourtSlot.findById(courtSlotId).lean();
  if (!courtSlot) {
    return res.status(404).json({ error: 'Court slot not found' });
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const freeDateDay = dayNames[new Date(freedDate + 'T12:00:00').getDay()];
  if (freeDateDay !== courtSlot.dayOfWeek) {
    return res.status(400).json({
      error: `The date ${freedDate} is a ${freeDateDay}, but this slot is for ${courtSlot.dayOfWeek}s`,
    });
  }

  // 5. Check for duplicate free request
  const existingFree = await SlotFreeRequest.findOne({
    userMembershipId: membership._id,
    courtSlotId,
    freedDate,
  });
  if (existingFree) {
    return res.status(409).json({ error: 'You have already freed this slot for this date' });
  }

  // 6. Enforce the free-window deadline
  const arena = await Arena.findById(slotEntry.arenaId).lean();
  const freeWindowHours = arena?.slotFreeConfig?.freeWindowHours ?? 24;
  const pointsPerFreeSlot = arena?.slotFreeConfig?.pointsPerFreeSlot ?? 10;

  // Parse startTime (e.g. "06:00 AM - 07:00 AM" → extract "06:00 AM")
  const rawStartTime = courtSlot.startTime || courtSlot.timeSlot?.split(' - ')[0] || '';
  const slotDateTime = new Date(`${freedDate}T00:00:00`);

  if (rawStartTime) {
    const match = rawStartTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3]?.toUpperCase();
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      slotDateTime.setHours(hours, minutes, 0, 0);
    }
  }

  const deadline = new Date(slotDateTime.getTime() - freeWindowHours * 3600 * 1000);
  const now = new Date();

  if (now >= deadline) {
    return res.status(400).json({
      error: `Too late to free this slot. The deadline was ${deadline.toISOString()} (${freeWindowHours}h before slot time).`,
      deadline: deadline.toISOString(),
    });
  }

  // 7. Create SlotFreeRequest
  const freeRequest = await SlotFreeRequest.create({
    userMembershipId: membership._id,
    userId,
    courtSlotId,
    courtId: slotEntry.courtId,
    arenaId: slotEntry.arenaId,
    freedDate,
    freedAt: now,
    status: 'freed',
    bonusPointsAwarded: pointsPerFreeSlot,
  });

  // 8. Credit bonus points
  let pointsWallet = await getOrCreatePointsWallet(userId);
  const updatedWallet = await PointsWallet.findByIdAndUpdate(
    pointsWallet._id,
    { $inc: { points: pointsPerFreeSlot } },
    { new: true }
  );

  await PointsTransaction.create({
    userId,
    type: 'credit',
    points: pointsPerFreeSlot,
    reason: 'slot_freed',
    balanceAfter: updatedWallet.points,
    meta: {
      slotFreeRequestId: freeRequest._id.toString(),
      userMembershipId: membership._id.toString(),
      courtSlotId: String(courtSlotId),
      freedDate,
    },
  });

  // 9. Update bonusPointsEarned on membership
  await UserMembership.findByIdAndUpdate(membership._id, {
    $inc: { bonusPointsEarned: pointsPerFreeSlot },
  });

  // 10. Notification
  await createNotification(
    userId,
    'Slot Freed — Points Earned!',
    `You freed your ${courtSlot.timeSlot} slot on ${freedDate} and earned ${pointsPerFreeSlot} bonus points.`,
    'success',
    { slotFreeRequestId: freeRequest._id.toString() }
  );

  return res.status(201).json({
    slotFreeRequest: SlotFreeRequest.toPublic(freeRequest),
    pointsAwarded: pointsPerFreeSlot,
    newPointsBalance: updatedWallet.points,
  });
}

// ─── Points Wallet (User) ─────────────────────────────────────────────────────

async function getMyPointsWallet(req, res) {
  const userId = req.auth.sub;
  const [wallet, discountConfig] = await Promise.all([
    getOrCreatePointsWallet(userId),
    PointsDiscountConfig.findOne({ arenaId: null }).lean(),
  ]);

  const config = discountConfig
    ? PointsDiscountConfig.toPublic(discountConfig)
    : { arenaId: null, tiers: [], maxDiscountPercent: 20 };

  return res.json({
    wallet: PointsWallet.toPublic(wallet),
    discountConfig: config,
  });
}

async function getMyPointsTransactions(req, res) {
  const userId = req.auth.sub;
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [transactions, total] = await Promise.all([
    PointsTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    PointsTransaction.countDocuments({ userId }),
  ]);

  return res.json({
    transactions: transactions.map(PointsTransaction.toPublic),
    total,
    page: Number(page),
    limit: Number(limit),
  });
}

// ─── Purchase Slot Membership ──────────────────────────────────────────────────────

/**
 * POST /me/slot-memberships/purchase
 * Body: { arenaId, courtId, courtSlotIds: [], durationMonths: 1|3|6|12, startDate, usePoints }
 */
async function purchaseSlotMembership(req, res) {
  const userId = req.auth.sub;
  const { arenaId, courtId, courtSlotIds, durationMonths, startDate, usePoints = false } = req.body;

  // Validate inputs
  if (!arenaId || !mongoose.isValidObjectId(arenaId)) return res.status(400).json({ error: 'Valid arenaId is required' });
  if (!courtId || !mongoose.isValidObjectId(courtId)) return res.status(400).json({ error: 'Valid courtId is required' });
  if (!Array.isArray(courtSlotIds) || courtSlotIds.length === 0) return res.status(400).json({ error: 'At least one courtSlotId is required' });
  if (![1, 3, 6, 12].includes(Number(durationMonths))) return res.status(400).json({ error: 'durationMonths must be 1, 3, 6, or 12' });
  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return res.status(400).json({ error: 'startDate must be YYYY-MM-DD' });

  // Load arena
  const arena = await Arena.findById(arenaId).lean();
  if (!arena) return res.status(404).json({ error: 'Arena not found' });

  // Load court
  const court = await Court.findById(courtId).lean();
  if (!court) return res.status(404).json({ error: 'Court not found' });

  // Determine base price from arena slotPricingConfig
  const months = Number(durationMonths);
  const priceMap = {
    1:  arena.slotPricingConfig?.price1Month  ?? 0,
    3:  arena.slotPricingConfig?.price3Month  ?? 0,
    6:  arena.slotPricingConfig?.price6Month  ?? 0,
    12: arena.slotPricingConfig?.price12Month ?? 0,
  };
  const basePrice = priceMap[months];

  // Compute durationDays and endDate
  const durationDays = months === 1 ? 30 : months === 3 ? 90 : months === 6 ? 180 : 365;
  const startDt = new Date(startDate);
  const endDt = new Date(startDt);
  endDt.setDate(endDt.getDate() + durationDays - 1);
  const endDate = endDt.toISOString().slice(0, 10);

  // Validate all courtSlotIds and check for conflicts
  const courtSlotDocs = [];
  for (const slotId of courtSlotIds) {
    if (!mongoose.isValidObjectId(slotId)) return res.status(400).json({ error: `Invalid courtSlotId: ${slotId}` });
    const cs = await CourtSlot.findById(slotId).lean();
    if (!cs) return res.status(404).json({ error: `CourtSlot not found: ${slotId}` });
    courtSlotDocs.push(cs);
  }

  // Check availability conflicts
  for (const cs of courtSlotDocs) {
    const conflictingMembership = await UserMembership.findOne({
      status: 'active',
      'bookedSlots.courtSlotId': cs._id,
      startsAt: { $lte: new Date(endDate) },
      expiresAt: { $gte: new Date(startDate) },
    }).lean();
    if (conflictingMembership) {
      return res.status(409).json({
        error: `Slot ${cs.dayOfWeek} ${cs.timeSlot} is already booked by another member for this period`,
        courtSlotId: slotId,
      });
    }
  }

  // Calculate points discount if requested
  let discountAmount = 0;
  let pointsUsed = 0;
  if (usePoints && basePrice > 0) {
    const [pointsWallet, discountConfig] = await Promise.all([
      getOrCreatePointsWallet(userId),
      PointsDiscountConfig.findOne({ arenaId: null }).lean(),
    ]);
    if (pointsWallet && discountConfig) {
      const discountPct = PointsDiscountConfig.computeDiscount(discountConfig, pointsWallet.points);
      discountAmount = Math.floor((basePrice * discountPct) / 100);
      const sorted = (discountConfig.tiers || []).sort((a, b) => b.pointsRequired - a.pointsRequired);
      const matched = sorted.find((t) => pointsWallet.points >= t.pointsRequired);
      pointsUsed = matched?.pointsRequired || 0;
    }
  }

  const finalAmount = Math.max(0, basePrice - discountAmount);

  // Debit wallet
  if (finalAmount > 0) {
    const wallet = await getOrCreateWallet(userId);
    if (wallet.balance < finalAmount) {
      return res.status(400).json({ error: 'Insufficient wallet balance. Please top up your wallet.' });
    }
    const updatedWallet = await Wallet.findByIdAndUpdate(
      wallet._id,
      { $inc: { balance: -finalAmount } },
      { new: true }
    );
    await WalletTransaction.create({
      walletId: wallet._id,
      userId,
      type: 'debit',
      amount: finalAmount,
      description: `Slot membership — ${court.name}, ${months} month(s)`,
      meta: { arenaId, courtId, courtSlotIds, durationMonths: months },
    });
  }

  // Debit points if used
  if (usePoints && pointsUsed > 0) {
    const pw = await getOrCreatePointsWallet(userId);
    const updPw = await PointsWallet.findByIdAndUpdate(pw._id, { $inc: { points: -pointsUsed } }, { new: true });
    await PointsTransaction.create({
      userId,
      type: 'debit',
      points: pointsUsed,
      reason: 'slot_membership_discount',
      balanceAfter: updPw.points,
      meta: { arenaId, courtId, durationMonths: months },
    });
  }

  // Create UserMembership record
  const membership = await UserMembership.create({
    userId,
    membershipPlanId: null,
    arenaId,
    status: 'active',
    startsAt: new Date(startDate),
    expiresAt: new Date(endDate + 'T23:59:59'),
    amountPaid: finalAmount,
    discountApplied: discountAmount,
    bookedSlots: courtSlotDocs.map((cs) => ({
      courtSlotId: cs._id,
      courtId: court._id,
      arenaId: arena._id,
    })),
    slotMembershipMeta: {
      durationMonths: months,
      basePrice,
      pricePerSlot: 0,
      totalSlots: courtSlotDocs.length,
    },
  });

  await createNotification(
    userId,
    'Slot Membership Activated!',
    `Your ${months}-month slot membership at ${arena.name} starts on ${startDate}.`,
    'success',
    { membershipId: membership._id.toString() }
  );

  return res.status(201).json({ membership: UserMembership.toPublic(membership) });
}

module.exports = {
  checkSlotAvailability,
  previewSlotMembershipPricing,
  getMySlotMemberships,
  freeMySlot,
  purchaseSlotMembership,
  getMyPointsWallet,
  getMyPointsTransactions,
};
