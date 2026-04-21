const mongoose = require('mongoose');
const MembershipPlan = require('../models/MembershipPlan');
const UserMembership = require('../models/UserMembership');
const Arena = require('../models/Arena');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const { getOrCreateWallet } = require('../services/walletService');

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
    });
  });

  return res.json({ memberships: out });
}

async function purchaseMembership(req, res) {
  const userId = req.auth.sub;
  const { planId } = req.body;

  if (!planId || !mongoose.isValidObjectId(planId)) {
    return res.status(400).json({ error: 'Valid planId is required' });
  }

  const plan = await MembershipPlan.findOne({ _id: planId, isActive: true });
  if (!plan) {
    return res.status(404).json({ error: 'Membership plan not found' });
  }

  const arena = await Arena.findById(plan.arenaId);
  if (!arena) {
    return res.status(404).json({ error: 'Arena not found' });
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
    meta: { membershipPlanId: plan._id.toString(), arenaId: plan.arenaId.toString() },
  });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + Number(plan.durationDays) * 86400000);

  const membership = await UserMembership.create({
    userId,
    membershipPlanId: plan._id,
    arenaId: plan.arenaId,
    startsAt: now,
    expiresAt,
    status: 'active',
  });

  return res.status(201).json({
    membership: UserMembership.toPublic(membership, {
      planName: plan.name,
      discountPercent: plan.discountPercent,
    }),
    wallet: Wallet.toPublic(updatedWallet),
  });
}

module.exports = { listMyMemberships, purchaseMembership };
