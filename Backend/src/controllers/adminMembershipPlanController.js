const mongoose = require('mongoose');
const MembershipPlan = require('../models/MembershipPlan');
const Arena = require('../models/Arena');
const UserMembership = require('../models/UserMembership');
const User = require('../models/User');

async function createMembershipPlan(req, res) {
  const { arenaId, isGlobal, name, price, durationDays, discountPercent, description, applicableTransactions, category } = req.body;

  if (!isGlobal && (!arenaId || !mongoose.isValidObjectId(arenaId))) {
    return res.status(400).json({ error: 'arenaId is required for non-global plans' });
  }

  if (!name || price === undefined || price === null || !durationDays) {
    return res.status(400).json({ error: 'name, price, and durationDays are required' });
  }

  if (arenaId && mongoose.isValidObjectId(arenaId)) {
    const arena = await Arena.findById(arenaId);
    if (!arena) {
      return res.status(404).json({ error: 'Arena not found' });
    }
  }

  const plan = await MembershipPlan.create({
    arenaId: isGlobal ? null : arenaId,
    isGlobal: !!isGlobal,
    name: String(name).trim(),
    description: description != null ? String(description) : '',
    price: Number(price),
    durationDays: Number(durationDays),
    discountPercent: discountPercent != null ? Number(discountPercent) : 0,
    applicableTransactions: Array.isArray(applicableTransactions) ? applicableTransactions : [],
    category: category || 'non-premium',
  });

  return res.status(201).json({ plan: MembershipPlan.toPublic(plan) });
}

async function listMembershipPlans(req, res) {
  const { arenaId } = req.query;
  
  let query = {};
  if (arenaId && mongoose.isValidObjectId(arenaId)) {
    // Return plans for this arena OR global plans
    query = {
      $or: [
        { arenaId: arenaId },
        { isGlobal: true }
      ]
    };
  } else {
    // If no specific arena requested, maybe return all or just global
    // For admin list, usually we want to see everything or filter by arena
    // Let's return all if no arenaId is specified, as superadmin might want to see all
    query = {};
  }

  const list = await MembershipPlan.find(query).sort({ createdAt: -1 }).lean();
  return res.json({ plans: list.map((p) => MembershipPlan.toPublic(p)) });
}

async function patchMembershipPlan(req, res) {
  const { planId } = req.params;
  if (!mongoose.isValidObjectId(planId)) {
    return res.status(400).json({ error: 'Invalid plan id' });
  }
  const plan = await MembershipPlan.findById(planId);
  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  const {
    name,
    price,
    durationDays,
    discountPercent,
    description,
    applicableTransactions,
    isActive,
    category,
  } = req.body;

  if (name !== undefined) plan.name = String(name).trim();
  if (description !== undefined) plan.description = String(description);
  if (price !== undefined && price !== null) {
    const p = Number(price);
    if (Number.isNaN(p) || p < 0) {
      return res.status(400).json({ error: 'price must be >= 0' });
    }
    plan.price = p;
  }
  if (durationDays !== undefined && durationDays !== null) {
    const d = Number(durationDays);
    if (Number.isNaN(d) || d < 1) {
      return res.status(400).json({ error: 'durationDays must be >= 1' });
    }
    plan.durationDays = d;
  }
  if (discountPercent !== undefined && discountPercent !== null) {
    const x = Number(discountPercent);
    if (Number.isNaN(x) || x < 0 || x > 100) {
      return res.status(400).json({ error: 'discountPercent must be 0–100' });
    }
    plan.discountPercent = x;
  }
  if (applicableTransactions !== undefined && Array.isArray(applicableTransactions)) {
    plan.applicableTransactions = applicableTransactions;
  }
  if (category !== undefined) plan.category = category;
  if (typeof isActive === 'boolean') plan.isActive = isActive;

  await plan.save();
  return res.json({ plan: MembershipPlan.toPublic(plan) });
}

async function deleteMembershipPlan(req, res) {
  const { planId } = req.params;
  if (!mongoose.isValidObjectId(planId)) {
    return res.status(400).json({ error: 'Invalid plan id' });
  }
  const plan = await MembershipPlan.findById(planId);
  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  await MembershipPlan.findByIdAndDelete(planId);
  return res.json({ success: true, deletedId: planId });
}

async function adminMembershipStats(req, res) {
  const { arenaId } = req.query;
  const match = {};
  if (arenaId && mongoose.isValidObjectId(arenaId)) {
    match.$or = [
      { arenaId: new mongoose.Types.ObjectId(arenaId) },
      { arenaId: null } // Include global plans
    ];
  }

  const now = new Date();
  
  // Total Revenue & Users
  const revenueAgg = await UserMembership.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'membershipplans',
        localField: 'membershipPlanId',
        foreignField: '_id',
        as: 'plan'
      }
    },
    { $unwind: '$plan' },
    { $group: { _id: null, totalRevenue: { $sum: '$plan.price' }, count: { $sum: 1 } } }
  ]);

  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
  const totalUsers = revenueAgg[0]?.count || 0;
  const avgRevenuePerUser = totalUsers > 0 ? (totalRevenue / totalUsers) : 0;

  // Active Users
  const activeMatch = { ...match, status: 'active', expiresAt: { $gt: now } };
  const totalActiveUsers = await UserMembership.countDocuments(activeMatch);

  // Expiring soon: within next 7 days
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const expiringSoonCount = await UserMembership.countDocuments({
    ...match,
    status: 'active',
    expiresAt: { $gt: now, $lte: nextWeek }
  });

  // Churn rate
  const cancelledCount = await UserMembership.countDocuments({
    ...match,
    status: 'cancelled'
  });
  const churnRate = totalUsers > 0 ? (cancelledCount / totalUsers * 100) : 0;

  // Conversion rate is mocked or calculated if we have total platform users
  const conversionRate = 4.2;

  return res.json({
    avgRevenuePerUser,
    churnRate,
    conversionRate,
    expiringSoonCount,
    totalActiveUsers,
    totalRevenue
  });
}

async function listUserMemberships(req, res) {
  const { arenaId, status } = req.query;
  const match = {};
  if (arenaId && mongoose.isValidObjectId(arenaId)) {
    match.$or = [
      { arenaId: new mongoose.Types.ObjectId(arenaId) },
      { arenaId: null }
    ];
  }
  if (status && status !== 'ALL') {
    match.status = status.toLowerCase();
  }

  const list = await UserMembership.find(match)
    .populate('userId', 'name firstName lastName email phone')
    .populate('membershipPlanId')
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    memberships: list.map((m) => UserMembership.toPublic(m, {
      user: User.toPublic(m.userId),
      plan: m.membershipPlanId ? MembershipPlan.toPublic(m.membershipPlanId) : null
    }))
  });
}

module.exports = { 
  createMembershipPlan, 
  listMembershipPlans, 
  patchMembershipPlan, 
  deleteMembershipPlan, 
  adminMembershipStats,
  listUserMemberships
};
