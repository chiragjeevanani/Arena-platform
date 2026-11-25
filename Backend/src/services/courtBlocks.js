/**
 * Everything that blocks a court on a given day: one-off AvailabilityBlocks plus the
 * RecurringBlocks (reserved slots) that apply on that date. Recurring ones are returned as
 * block-shaped objects so every availability check treats them the same way.
 */
const mongoose = require('mongoose');
const AvailabilityBlock = require('../models/AvailabilityBlock');
const RecurringBlock = require('../models/RecurringBlock');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayOf = (ymd) => DAYS[new Date(`${ymd}T12:00:00Z`).getUTCDay()];

function appliesOn(rb, ymd) {
  return rb.isActive !== false
    && rb.startDate <= ymd && ymd <= rb.endDate
    && (rb.daysOfWeek || []).includes(dayOf(ymd))
    && !(rb.releasedDates || []).includes(ymd);
}

const label = (rb) => `${rb.playerName}${rb.teamName ? ` · ${rb.teamName}` : ''}`;

/** Recurring block → the shape of an AvailabilityBlock for one date. */
function asDayBlock(rb, ymd) {
  return {
    _id: `rb_${rb._id}_${ymd}`,
    id: `rb_${rb._id}_${ymd}`,
    recurringBlockId: String(rb._id),
    arenaId: rb.arenaId,
    courtId: rb.courtId,
    date: ymd,
    startTime: rb.startTime,
    endTime: rb.endTime,
    reason: 'reserved',
    note: `Reserved: ${label(rb)}`,
    playerName: rb.playerName,
    teamName: rb.teamName || '',
    isRecurring: true,
  };
}

/** Recurring day-blocks for these courts on these dates. */
async function recurringDayBlocks({ arenaId, courtIds, from, to }) {
  const q = { isActive: true, startDate: { $lte: to }, endDate: { $gte: from } };
  if (arenaId) q.arenaId = arenaId;
  if (courtIds) q.courtId = { $in: courtIds.map((c) => new mongoose.Types.ObjectId(String(c))) };
  const list = await RecurringBlock.find(q).lean();
  const out = [];
  if (!list.length) return out;
  for (let d = new Date(`${from}T12:00:00Z`); d <= new Date(`${to}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    const ymd = d.toISOString().slice(0, 10);
    for (const rb of list) if (appliesOn(rb, ymd)) out.push(asDayBlock(rb, ymd));
  }
  return out;
}

/** All blocks (one-off + reserved) for one court on one date. */
async function blocksForCourtDay(courtId, ymd) {
  const [oneOff, recurring] = await Promise.all([
    AvailabilityBlock.find({ courtId, date: ymd }).lean(),
    recurringDayBlocks({ courtIds: [courtId], from: ymd, to: ymd }),
  ]);
  return [...oneOff, ...recurring];
}

module.exports = { DAYS, dayOf, appliesOn, asDayBlock, recurringDayBlocks, blocksForCourtDay, label };
