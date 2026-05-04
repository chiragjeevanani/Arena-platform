const mongoose = require('mongoose');
const MembershipPlan = require('../models/MembershipPlan');
const Arena = require('../models/Arena');

async function listPublishedArenaMembershipPlans(req, res) {
  const { arenaId } = req.params;
  if (!mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Invalid arena id' });
  }

  const arena = await Arena.findById(arenaId).lean();
  if (!arena || !arena.isPublished) {
    return res.status(404).json({ error: 'Arena not found' });
  }

  const plans = await MembershipPlan.find({
    $or: [
      { arenaId: arena._id },
      { isGlobal: true }
    ],
    isActive: true
  }).sort({ price: 1 }).lean();

  return res.json({
    arenaId,
    plans: plans.map((p) => MembershipPlan.toPublic(p)),
  });
}

async function listGlobalMembershipPlans(req, res) {
  const plans = await MembershipPlan.find({
    isGlobal: true,
    isActive: true
  }).sort({ price: 1 }).lean();

  return res.json({
    plans: plans.map((p) => MembershipPlan.toPublic(p)),
  });
}

module.exports = { listPublishedArenaMembershipPlans, listGlobalMembershipPlans };
