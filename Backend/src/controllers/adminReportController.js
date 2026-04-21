const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const PosSale = require('../models/PosSale');
const BatchEnrollment = require('../models/BatchEnrollment');
const CoachingBatch = require('../models/CoachingBatch');

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

  return res.json({
    bookings: {
      confirmedOrCompleted: bookingAgg[0]?.count || 0,
      revenueAmount: bookingAgg[0]?.revenue || 0,
      cancelled,
    },
    pos: { salesCount: posAgg[0]?.count || 0, totalAmount: posAgg[0]?.total || 0 },
    coaching: { activeEnrollments: enrollCount },
    range: { from: from || null, to: to || null, arenaId: arenaId || null },
  });
}

module.exports = { adminReportSummary };
