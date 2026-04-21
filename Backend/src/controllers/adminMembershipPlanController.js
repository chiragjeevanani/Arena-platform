const mongoose = require('mongoose');
const MembershipPlan = require('../models/MembershipPlan');
const Arena = require('../models/Arena');

async function createMembershipPlan(req, res) {
  const { arenaId, name, price, durationDays, discountPercent, description } = req.body;

  if (!arenaId || !name || price === undefined || price === null || !durationDays) {
    return res.status(400).json({ error: 'arenaId, name, price, and durationDays are required' });
  }

  if (!mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Invalid arena id' });
  }

  const arena = await Arena.findById(arenaId);
  if (!arena) {
    return res.status(404).json({ error: 'Arena not found' });
  }

  const plan = await MembershipPlan.create({
    arenaId,
    name: String(name).trim(),
    description: description != null ? String(description) : '',
    price: Number(price),
    durationDays: Number(durationDays),
    discountPercent: discountPercent != null ? Number(discountPercent) : 0,
  });

  return res.status(201).json({ plan: MembershipPlan.toPublic(plan) });
}

async function listMembershipPlans(req, res) {
  const { arenaId } = req.query;
  if (!arenaId || !mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Valid arenaId query is required' });
  }

  const list = await MembershipPlan.find({ arenaId }).sort({ createdAt: -1 }).lean();
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
    isActive,
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
  if (typeof isActive === 'boolean') plan.isActive = isActive;

  await plan.save();
  return res.json({ plan: MembershipPlan.toPublic(plan) });
}

module.exports = { createMembershipPlan, listMembershipPlans, patchMembershipPlan };
