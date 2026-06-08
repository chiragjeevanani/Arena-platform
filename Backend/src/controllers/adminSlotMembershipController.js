const mongoose = require('mongoose');
const Arena = require('../models/Arena');
const SlotFreeRequest = require('../models/SlotFreeRequest');
const PointsWallet = require('../models/PointsWallet');
const PointsTransaction = require('../models/PointsTransaction');
const PointsDiscountConfig = require('../models/PointsDiscountConfig');
const UserMembership = require('../models/UserMembership');
const User = require('../models/User');

// ─── Slot Free Configuration ──────────────────────────────────────────────────

async function getSlotFreeConfig(req, res) {
  const { arenaId } = req.params;
  if (!mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Invalid arenaId' });
  }

  const arena = await Arena.findById(arenaId).lean();
  if (!arena) return res.status(404).json({ error: 'Arena not found' });

  return res.json({
    arenaId,
    freeWindowHours: arena.slotFreeConfig?.freeWindowHours ?? 24,
    pointsPerFreeSlot: arena.slotFreeConfig?.pointsPerFreeSlot ?? 10,
  });
}

async function updateSlotFreeConfig(req, res) {
  const { arenaId } = req.params;
  if (!mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Invalid arenaId' });
  }

  const { freeWindowHours, pointsPerFreeSlot } = req.body;

  const update = {};
  if (freeWindowHours !== undefined) {
    const h = Number(freeWindowHours);
    if (Number.isNaN(h) || h < 1) {
      return res.status(400).json({ error: 'freeWindowHours must be >= 1' });
    }
    update['slotFreeConfig.freeWindowHours'] = h;
  }
  if (pointsPerFreeSlot !== undefined) {
    const p = Number(pointsPerFreeSlot);
    if (Number.isNaN(p) || p < 0) {
      return res.status(400).json({ error: 'pointsPerFreeSlot must be >= 0' });
    }
    update['slotFreeConfig.pointsPerFreeSlot'] = p;
  }

  const arena = await Arena.findByIdAndUpdate(arenaId, { $set: update }, { new: true }).lean();
  if (!arena) return res.status(404).json({ error: 'Arena not found' });

  return res.json({
    arenaId,
    freeWindowHours: arena.slotFreeConfig?.freeWindowHours ?? 24,
    pointsPerFreeSlot: arena.slotFreeConfig?.pointsPerFreeSlot ?? 10,
  });
}

// ─── Points Discount Config ───────────────────────────────────────────────────

async function getPointsDiscountConfig(req, res) {
  // Returns global config (arenaId: null). Could extend for arena-specific later.
  const config = await PointsDiscountConfig.findOne({ arenaId: null }).lean();
  if (!config) {
    return res.json({ arenaId: null, tiers: [], maxDiscountPercent: 20 });
  }
  return res.json(PointsDiscountConfig.toPublic(config));
}

async function updatePointsDiscountConfig(req, res) {
  const { tiers, maxDiscountPercent } = req.body;

  if (!Array.isArray(tiers)) {
    return res.status(400).json({ error: 'tiers must be an array' });
  }

  for (const tier of tiers) {
    if (!tier.pointsRequired || tier.discountPercent === undefined) {
      return res.status(400).json({ error: 'Each tier must have pointsRequired and discountPercent' });
    }
    if (tier.pointsRequired < 1 || tier.discountPercent < 0 || tier.discountPercent > 100) {
      return res.status(400).json({ error: 'Invalid tier values' });
    }
  }

  const cap = maxDiscountPercent !== undefined ? Number(maxDiscountPercent) : 20;
  if (Number.isNaN(cap) || cap < 0 || cap > 100) {
    return res.status(400).json({ error: 'maxDiscountPercent must be 0–100' });
  }

  const config = await PointsDiscountConfig.findOneAndUpdate(
    { arenaId: null },
    { $set: { tiers, maxDiscountPercent: cap } },
    { upsert: true, new: true }
  );

  return res.json(PointsDiscountConfig.toPublic(config));
}

// ─── Freed Slots Management ───────────────────────────────────────────────────

async function listFreedSlots(req, res) {
  const { arenaId, status, startDate, endDate, page = 1, limit = 50 } = req.query;

  const match = {};
  if (arenaId && mongoose.isValidObjectId(arenaId)) {
    match.arenaId = new mongoose.Types.ObjectId(arenaId);
  }
  if (status && ['freed', 'resold'].includes(status)) {
    match.status = status;
  }
  if (startDate || endDate) {
    match.freedDate = {};
    if (startDate) match.freedDate.$gte = startDate;
    if (endDate) match.freedDate.$lte = endDate;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [freedSlots, total] = await Promise.all([
    SlotFreeRequest.find(match)
      .populate('userId', 'name firstName lastName email phone')
      .populate('courtSlotId')
      .populate('courtId', 'name')
      .populate('arenaId', 'name')
      .sort({ freedDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    SlotFreeRequest.countDocuments(match),
  ]);

  return res.json({
    freedSlots: freedSlots.map((s) =>
      SlotFreeRequest.toPublic(s, {
        user: s.userId ? User.toPublic(s.userId) : null,
        courtSlot: s.courtSlotId || null,
        courtName: s.courtId?.name || '',
        arenaName: s.arenaId?.name || '',
      })
    ),
    total,
    page: Number(page),
    limit: Number(limit),
  });
}

async function markSlotResold(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const record = await SlotFreeRequest.findById(id);
  if (!record) return res.status(404).json({ error: 'Freed slot record not found' });
  if (record.status === 'resold') {
    return res.status(400).json({ error: 'Slot is already marked as resold' });
  }

  record.status = 'resold';
  await record.save();

  return res.json({ freedSlot: SlotFreeRequest.toPublic(record) });
}

// ─── Points Wallets (Admin View) ──────────────────────────────────────────────

async function listPointsWallets(req, res) {
  const { page = 1, limit = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [wallets, total] = await Promise.all([
    PointsWallet.find()
      .populate('userId', 'name firstName lastName email phone')
      .sort({ points: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    PointsWallet.countDocuments(),
  ]);

  return res.json({
    wallets: wallets.map((w) => ({
      ...PointsWallet.toPublic(w),
      user: w.userId ? User.toPublic(w.userId) : null,
    })),
    total,
    page: Number(page),
    limit: Number(limit),
  });
}

async function adjustPointsBalance(req, res) {
  const { userId, points, type, note } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }
  if (!points || !type || !['credit', 'debit'].includes(type)) {
    return res.status(400).json({ error: 'points and type (credit|debit) are required' });
  }

  const amount = Number(points);
  if (Number.isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'points must be a positive number' });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let wallet = await PointsWallet.findOne({ userId });
  if (!wallet) {
    wallet = await PointsWallet.create({ userId, points: 0 });
  }

  if (type === 'debit' && wallet.points < amount) {
    return res.status(400).json({ error: 'Insufficient points balance' });
  }

  const inc = type === 'credit' ? amount : -amount;
  const updated = await PointsWallet.findByIdAndUpdate(
    wallet._id,
    { $inc: { points: inc } },
    { new: true }
  );

  await PointsTransaction.create({
    userId,
    type,
    points: amount,
    reason: 'admin_adjustment',
    balanceAfter: updated.points,
    meta: { note: note || 'Admin adjustment' },
  });

  return res.json({ wallet: PointsWallet.toPublic(updated) });
}

// ─── Slot Memberships List (Admin) ────────────────────────────────────────────

async function listSlotMemberships(req, res) {
  const { arenaId, status, page = 1, limit = 50 } = req.query;
  const match = {};

  if (arenaId && mongoose.isValidObjectId(arenaId)) {
    match.arenaId = new mongoose.Types.ObjectId(arenaId);
  }
  if (status && status !== 'ALL') {
    match.status = status.toLowerCase();
  }
  // Only slot-based memberships
  const UserMembership = require('../models/UserMembership');
  const MembershipPlan = require('../models/MembershipPlan');

  const skip = (Number(page) - 1) * Number(limit);
  const [memberships, total] = await Promise.all([
    UserMembership.find(match)
      .populate('userId', 'name firstName lastName email phone')
      .populate({
        path: 'membershipPlanId',
        match: { slotBased: true },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    UserMembership.countDocuments(match),
  ]);

  // Filter to only slot-based memberships (plan populated)
  const slotMemberships = memberships.filter((m) => m.membershipPlanId && m.membershipPlanId.slotBased);

  return res.json({
    memberships: slotMemberships.map((m) =>
      UserMembership.toPublic(m, {
        user: m.userId ? User.toPublic(m.userId) : null,
        plan: m.membershipPlanId ? MembershipPlan.toPublic(m.membershipPlanId) : null,
      })
    ),
    total,
    page: Number(page),
    limit: Number(limit),
  });
}

module.exports = {
  getSlotFreeConfig,
  updateSlotFreeConfig,
  getPointsDiscountConfig,
  updatePointsDiscountConfig,
  listFreedSlots,
  markSlotResold,
  listPointsWallets,
  adjustPointsBalance,
  listSlotMemberships,
};
