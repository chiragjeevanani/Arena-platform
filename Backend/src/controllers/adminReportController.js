const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const PosSale = require('../models/PosSale');
const BatchEnrollment = require('../models/BatchEnrollment');
const CoachingBatch = require('../models/CoachingBatch');
const UserMembership = require('../models/UserMembership');
const Arena = require('../models/Arena');
const Court = require('../models/Court');

async function adminReportSummary(req, res) {
  const arenaId = (req.query.arenaId || '').trim();
  let aOid = null;
  if (arenaId && mongoose.isValidObjectId(arenaId)) {
    aOid = new mongoose.Types.ObjectId(arenaId);
  }
  const from = (req.query.from || '').trim();
  const to = (req.query.to || '').trim();

  const bookingMatch = {};
  if (from && to) bookingMatch.date = { $gte: from, $lte: to };
  if (aOid) bookingMatch.arenaId = aOid;

  // 1. Basic Stats
  const bookingAgg = await Booking.aggregate([
    {
      $match: {
        ...bookingMatch,
        status: { $in: ['confirmed', 'completed'] },
      },
    },
    { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
  ]);

  const cancelled = await Booking.countDocuments({
    ...bookingMatch,
    status: 'cancelled',
  });

  const posMatch = {};
  if (aOid) posMatch.arenaId = aOid;
  if (from && to) {
    posMatch.createdAt = {
      $gte: new Date(`${from}T00:00:00.000Z`),
      $lte: new Date(`${to}T23:59:59.999Z`),
    };
  }

  const posAgg = await PosSale.aggregate([
    { $match: posMatch },
    { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
  ]);

  let enrollMatch = { status: { $in: ['confirmed', 'pending'] } };
  if (aOid) {
    const batchIds = await CoachingBatch.find({ arenaId: aOid }).distinct('_id');
    enrollMatch = { ...enrollMatch, batchId: { $in: batchIds } };
  }
  const enrollCount = await BatchEnrollment.countDocuments(enrollMatch);

  // Membership Stats
  const membershipMatch = {};
  if (aOid) membershipMatch.arenaId = aOid;
  if (from && to) {
    membershipMatch.createdAt = {
        $gte: new Date(`${from}T00:00:00.000Z`),
        $lte: new Date(`${to}T23:59:59.999Z`),
    };
  }
  const membershipAgg = await UserMembership.aggregate([
    { $match: membershipMatch },
    {
      $lookup: {
        from: 'membershipplans',
        localField: 'membershipPlanId',
        foreignField: '_id',
        as: 'plan'
      }
    },
    { $unwind: '$plan' },
    { $group: { _id: null, total: { $sum: '$plan.price' }, count: { $sum: 1 } } }
  ]);

  // 2. Weekly Revenue Velocity (Last 6 weeks)
  const now = new Date();
  const sixWeeksAgo = new Date(now.getTime() - 6 * 7 * 24 * 60 * 60 * 1000);
  
  const weeklyAgg = await Booking.aggregate([
    {
      $match: {
        ...(aOid ? { arenaId: aOid } : {}),
        status: { $in: ['confirmed', 'completed'] },
        createdAt: { $gte: sixWeeksAgo }
      }
    },
    {
      $group: {
        _id: { $week: '$createdAt' },
        revenue: { $sum: '$amount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 3. Revenue Source Distribution
  const courtRevenue = bookingAgg[0]?.revenue || 0;
  const retailRevenue = posAgg[0]?.total || 0;
  const membershipRevenue = membershipAgg[0]?.total || 0;
  
  // Coaching Revenue (approximate from enrollments if not explicitly in payments)
  const coachingBatchData = await CoachingBatch.find(aOid ? { arenaId: aOid } : {});
  const coachingRevenueAgg = await BatchEnrollment.aggregate([
    { $match: enrollMatch },
    {
      $lookup: {
        from: 'coachingbatches',
        localField: 'batchId',
        foreignField: '_id',
        as: 'batch'
      }
    },
    { $unwind: '$batch' },
    { $group: { _id: null, total: { $sum: '$batch.price' } } }
  ]);
  const coachingRevenue = coachingRevenueAgg[0]?.total || 0;

  const totalRevenue = courtRevenue + retailRevenue + membershipRevenue + coachingRevenue;
  const sourceDistribution = [
    { name: 'Courts', value: totalRevenue > 0 ? Math.round((courtRevenue / totalRevenue) * 100) : 0, color: '#CE2029' },
    { name: 'Coaching', value: totalRevenue > 0 ? Math.round((coachingRevenue / totalRevenue) * 100) : 0, color: '#36454F' },
    { name: 'Membership', value: totalRevenue > 0 ? Math.round((membershipRevenue / totalRevenue) * 100) : 0, color: '#4287f5' },
    { name: 'Retail', value: totalRevenue > 0 ? Math.round((retailRevenue / totalRevenue) * 100) : 0, color: '#E88E3E' },
  ];

  // 4. Court Utilization
  const courts = await Court.find(aOid ? { arenaId: aOid } : {});
  const courtIds = courts.map(c => c._id);
  const courtUsageAgg = await Booking.aggregate([
    {
      $match: {
        courtId: { $in: courtIds },
        status: { $in: ['confirmed', 'completed'] },
        ...(from && to ? { date: { $gte: from, $lte: to } } : {})
      }
    },
    {
      $group: {
        _id: '$courtId',
        bookingsCount: { $sum: 1 },
        revenue: { $sum: '$amount' }
      }
    }
  ]);

  const courtPerf = courts.map(c => {
    const usage = courtUsageAgg.find(u => String(u._id) === String(c._id));
    return {
      id: c._id.toString(),
      name: c.name,
      revenue: usage?.revenue || 0,
      utilization: usage ? Math.min(Math.round((usage.bookingsCount / 10) * 100), 100) : 0 // Mock utilization based on 10 slots max
    };
  });

  return res.json({
    bookings: {
      confirmedOrCompleted: bookingAgg[0]?.count || 0,
      revenueAmount: courtRevenue,
      cancelled,
    },
    pos: { salesCount: posAgg[0]?.count || 0, totalAmount: retailRevenue },
    coaching: { activeEnrollments: enrollCount, totalRevenue: coachingRevenue },
    membership: { count: membershipAgg[0]?.count || 0, totalRevenue: membershipRevenue },
    charts: {
      weeklyRevenue: weeklyAgg.map(w => ({ name: `Week ${w._id}`, courts: w.revenue, coaching: 0, membership: 0, retail: 0 })),
      sourceDistribution,
      courtPerformance: courtPerf
    },
    range: { from: from || null, to: to || null, arenaId: arenaId || null },
  });
}

module.exports = { adminReportSummary };
