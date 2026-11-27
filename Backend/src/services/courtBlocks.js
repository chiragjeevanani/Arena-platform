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

const addDaysYmd = (ymd, n) => { const d = new Date(`${ymd}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const holdEnd = (ab) => ab.endDate || ab.date;

/** Whole-arena booking / event → one block per court per day (startTime–endTime; 00:00–00:00 = whole day). */
function arenaDayBlock(ab, courtId, ymd) {
  const id = `ab_${ab._id}_${courtId}_${ymd}`;
  const isEvent = ab.kind === 'event';
  return {
    _id: id,
    id,
    arenaBookingId: String(ab._id),
    arenaId: ab.arenaId,
    courtId,
    date: ymd,
    startTime: ab.startTime || '00:00',
    endTime: ab.endTime || '00:00',
    reason: 'reserved',
    note: isEvent ? `Event: ${ab.bookedFor}` : `Whole arena booked: ${arenaLabel(ab)}`,
    playerName: isEvent ? `Event · ${ab.bookedFor}` : `Whole arena · ${ab.bookedFor}`,
    teamName: ab.teamName || '',
    bookedFor: ab.bookedFor,
    holdKind: ab.kind || 'arena',
    isRecurring: true,
    isArenaBooking: true,
  };
}

/** Hold blocks (whole-arena bookings and events) for these courts / this arena on these dates. */
async function arenaDayBlocks({ arenaId, courtIds, from, to }) {
  const Court = require('../models/Court');
  const ArenaDayBooking = require('../models/ArenaDayBooking');
  let courts;
  if (courtIds) courts = await Court.find({ _id: { $in: courtIds.map(String) } }).select('_id arenaId').lean();
  else if (arenaId) courts = await Court.find({ arenaId }).select('_id arenaId').lean();
  else return [];
  if (!courts.length) return [];
  const arenaIds = [...new Set(courts.map((c) => String(c.arenaId)))];
  const list = await ArenaDayBooking.find({
    status: 'active',
    arenaId: { $in: arenaIds },
    date: { $lte: to },
    $or: [{ endDate: { $gte: from } }, { endDate: null, date: { $gte: from } }],
  }).lean();
  const out = [];
  for (const ab of list) {
    const holdCourts = (ab.courtIds || []).map(String);
    const first = ab.date > from ? ab.date : from;
    const last = holdEnd(ab) < to ? holdEnd(ab) : to;
    for (let d = first; d <= last; d = addDaysYmd(d, 1)) {
      for (const c of courts) {
        if (String(c.arenaId) !== String(ab.arenaId)) continue;
        if (holdCourts.length && !holdCourts.includes(String(c._id))) continue;
        out.push(arenaDayBlock(ab, String(c._id), d));
      }
    }
  }
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
const holderText = (b) => (b.isArenaBooking
  ? (b.holdKind === 'event' ? `Event: ${b.bookedFor}` : `Whole arena: ${b.bookedFor}${b.teamName ? ` · ${b.teamName}` : ''}`)
  : `Reserved: ${b.playerName}${b.teamName ? ` · ${b.teamName}` : ''}`);

module.exports = { DAYS, dayOf, appliesOn, asDayBlock, recurringDayBlocks, arenaDayBlocks, blocksForCourtDay, label, holderText };
