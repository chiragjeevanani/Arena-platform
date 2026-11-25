const AvailabilityBlock = require('../models/AvailabilityBlock');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const Court = require('../models/Court');
const { buildCourtAvailabilityQuery } = require('../utils/bookingQuery');
const RecurringBlock = require('../models/RecurringBlock');
const { recurringDayBlocks } = require('../services/courtBlocks');

function mapBlock(doc) {
  return {
    id: doc._id.toString(),
    arenaId: doc.arenaId.toString(),
    courtId: doc.courtId.toString(),
    date: doc.date,
    startTime: doc.startTime,
    endTime: doc.endTime,
    reason: doc.reason,
    note: doc.note,
    createdAt: doc.createdAt
  };
}

async function listMyBlocks(req, res) {
  const { date, courtId } = req.query;
  const filter = { arenaId: req.arenaScopeId };
  
  if (date) filter.date = date;
  if (courtId && mongoose.isValidObjectId(courtId)) filter.courtId = courtId;

  const blocks = await AvailabilityBlock.find(filter).sort({ date: 1, startTime: 1 }).lean();
  // Reserved slots (recurring, for a player) that apply on this date, shown alongside one-off blocks.
  const reserved = date
    ? await recurringDayBlocks({ arenaId: req.arenaScopeId, courtIds: filter.courtId ? [filter.courtId] : undefined, from: date, to: date })
    : [];
  return res.json({
    blocks: [...blocks.map(mapBlock), ...reserved.map((b) => ({ ...b, arenaId: String(b.arenaId), courtId: String(b.courtId) }))],
  });
}

async function createMyBlock(req, res) {
  const { courtId, date, startTime, endTime, reason, note } = req.body;

  if (!courtId || !date || !startTime || !endTime) {
    return res.status(400).json({ error: 'courtId, date, startTime, and endTime are required' });
  }

  if (!mongoose.isValidObjectId(courtId)) {
    return res.status(400).json({ error: 'Invalid court id' });
  }
  // The court must belong to the staff member's arena.
  const court = await Court.findOne({ _id: courtId, arenaId: req.arenaScopeId }).lean();
  if (!court) {
    return res.status(404).json({ error: 'Court not found' });
  }

  const block = await AvailabilityBlock.create({
    arenaId: req.arenaScopeId,
    courtId,
    date,
    startTime,
    endTime,
    reason: reason || 'maintenance',
    note: note || '',
    createdBy: req.auth.sub
  });

  return res.status(201).json({ block: mapBlock(block) });
}

async function deleteMyBlock(req, res) {
  const { blockId } = req.params;
  // 'rb_<reservedId>_<date>' = a reserved slot on one date: removing it frees that date (player absent).
  const m = /^rb_([a-f0-9]{24})_(\d{4}-\d{2}-\d{2})$/.exec(String(blockId));
  if (m) {
    const rb = await RecurringBlock.findOneAndUpdate({ _id: m[1], arenaId: req.arenaScopeId }, { $addToSet: { releasedDates: m[2] } }, { new: true });
    if (!rb) return res.status(404).json({ error: 'Block not found' });
    return res.json({ ok: true, released: m[2] });
  }
  const block = await AvailabilityBlock.findOneAndDelete({ _id: blockId, arenaId: req.arenaScopeId });
  if (!block) return res.status(404).json({ error: 'Block not found' });

  return res.json({ ok: true });
}

async function getBlockSummary(req, res) {
  const { month } = req.query; // YYYY-MM
  if (!month) return res.status(400).json({ error: 'month (YYYY-MM) is required' });

  const start = `${month}-01`;
  const end = `${month}-31`;

  const blocks = await AvailabilityBlock.find({
    arenaId: req.arenaScopeId,
    date: { $gte: start, $lte: end }
  }).select('date').lean();
  const reserved = await recurringDayBlocks({ arenaId: req.arenaScopeId, from: start, to: end });

  const counts = {};
  [...blocks, ...reserved].forEach(b => {
    counts[b.date] = (counts[b.date] || 0) + 1;
  });

  const summary = Object.keys(counts).map(date => ({
    date,
    count: counts[date]
  }));

  return res.json({ summary });
}

module.exports = {
  listMyBlocks,
  createMyBlock,
  deleteMyBlock,
  getBlockSummary
};
