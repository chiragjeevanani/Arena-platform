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

const arenaLabel = (ab) => `${ab.bookedFor}${ab.teamName ? ` · ${ab.teamName}` : ''}`;

/** Whole-arena booking → one full-day block per court ('00:00'–'00:00' = the whole day). */
function arenaDayBlock(ab, courtId) {
  const id = `ab_${ab._id}_${courtId}`;
  return {
    _id: id,
    id,
    arenaBookingId: String(ab._id),
    arenaId: ab.arenaId,
    courtId,
    date: ab.date,
    startTime: '00:00',
    endTime: '00:00',
    reason: 'reserved',
    note: `Whole arena booked: ${arenaLabel(ab)}`,
    playerName: `Whole arena · ${ab.bookedFor}`,
    teamName: ab.teamName || '',
    bookedFor: ab.bookedFor,
    isRecurring: true,
    isArenaBooking: true,
  };
}

/** Whole-arena day-blocks for these courts / this arena on these dates. */
async function arenaDayBlocks({ arenaId, courtIds, from, to }) {
  const Court = require('../models/Court');
  const ArenaDayBooking = require('../models/ArenaDayBooking');
  let courts;
  if (courtIds) courts = await Court.find({ _id: { $in: courtIds.map(String) } }).select('_id arenaId').lean();
  else if (arenaId) courts = await Court.find({ arenaId }).select('_id arenaId').lean();
  else return [];
  if (!courts.length) return [];
  const arenaIds = [...new Set(courts.map((c) => String(c.arenaId)))];
  const list = await ArenaDayBooking.find({ status: 'active', arenaId: { $in: arenaIds }, date: { $gte: from, $lte: to } }).lean();
  const out = [];
  for (const ab of list) for (const c of courts) if (String(c.arenaId) === String(ab.arenaId)) out.push(arenaDayBlock(ab, String(c._id)));
  return out;
}

/** Recurring day-blocks (reserved slots + whole-arena days) for these courts on these dates. */
async function recurringDayBlocks({ arenaId, courtIds, from, to }) {
  const q = { isActive: true, startDate: { $lte: to }, endDate: { $gte: from } };
  if (arenaId) q.arenaId = arenaId;
  if (courtIds) q.courtId = { $in: courtIds.map((c) => new mongoose.Types.ObjectId(String(c))) };
  const [list, wholeArena] = await Promise.all([RecurringBlock.find(q).lean(), arenaDayBlocks({ arenaId, courtIds, from, to })]);
  const out = [...wholeArena];
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

/** Text for a block's holder: "Whole arena: X · team" or "Reserved: X · team". */
const holderText = (b) => (b.isArenaBooking ? `Whole arena: ${b.bookedFor}${b.teamName ? ` · ${b.teamName}` : ''}` : `Reserved: ${b.playerName}${b.teamName ? ` · ${b.teamName}` : ''}`);

module.exports = { DAYS, dayOf, appliesOn, asDayBlock, recurringDayBlocks, arenaDayBlocks, blocksForCourtDay, label, holderText };
