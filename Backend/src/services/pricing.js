const MembershipPlan = require('../models/MembershipPlan');
const UserMembership = require('../models/UserMembership');

function roundMoney(n) {
  return Math.round(Number(n) * 100) / 100;
}

async function computeCourtBookingPrice(userId, arena) {
  const baseAmount = roundMoney(arena.pricePerHour || 0);

  const activeMemberships = await UserMembership.find({
    userId,
    arenaId: arena._id,
    status: 'active',
    expiresAt: { $gt: new Date() },
  }).lean();

  if (!activeMemberships.length) {
    return {
      baseAmount,
      discountPercent: 0,
      discountAmount: 0,
      finalAmount: baseAmount,
      membershipPlanIds: [],
    };
  }

  const planIds = activeMemberships.map((m) => m.membershipPlanId);
  const plans = await MembershipPlan.find({
    _id: { $in: planIds },
    isActive: true,
  }).lean();

  let discountPercent = 0;
  for (const p of plans) {
    discountPercent = Math.max(discountPercent, Number(p.discountPercent) || 0);
  }

  const discountAmount = roundMoney((baseAmount * discountPercent) / 100);
  const finalAmount = roundMoney(baseAmount - discountAmount);

  return {
    baseAmount,
    discountPercent,
    discountAmount,
    finalAmount,
    membershipPlanIds: plans.map((p) => p._id.toString()),
  };
}

function amountsMatch(clientAmount, serverAmount) {
  if (clientAmount === undefined || clientAmount === null || clientAmount === '') {
    return true;
  }
  return Math.abs(Number(clientAmount) - serverAmount) < 0.005;
}

module.exports = { computeCourtBookingPrice, amountsMatch, roundMoney };
