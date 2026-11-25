const mongoose = require('mongoose');
const RecurringBlock = require('../models/RecurringBlock');
const Court = require('../models/Court');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { DAYS, dayOf } = require('../services/courtBlocks');
const { slotsOverlap, arenaTodayYmd } = require('../services/slotAvailability');

const YMD = /^\d{4}-\d{2}-\d{2}$/;
const HM = /^([01]\d|2[0-3]):[0-5]\d$/;
const addDays = (ymd, n) => { const d = new Date(`${ymd}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const timeLabel = (rb) => `${rb.startTime}-${rb.endTime}`;
const nameOf = (u) => u?.name || u?.email || '';

function statusOf(rb, today) {
  if (rb.isActive === false) return 'cancelled';
  if (rb.endDate < today) return 'ended';
  if (rb.startDate > today) return 'upcoming';
  return 'active';
}

/** Dates in [from, to] on the chosen weekdays. */
function sessionDates(rb, from = rb.startDate, to = rb.endDate) {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) if (rb.daysOfWeek.includes(dayOf(d))) out.push(d);
  return out;
}

function toPublic(rb, courtName, today) {
  const remaining = rb.endDate >= today ? sessionDates(rb, rb.startDate > today ? rb.startDate : today, rb.endDate).filter((d) => !(rb.releasedDates || []).includes(d)).length : 0;
  const daysLeft = Math.round((new Date(`${rb.endDate}T12:00:00Z`) - new Date(`${today}T12:00:00Z`)) / 864e5);
  return {
    id: String(rb._id),
    courtId: String(rb.courtId),
    courtName: courtName || 'Court',
    startTime: rb.startTime,
    endTime: rb.endTime,
    daysOfWeek: DAYS.filter((d) => rb.daysOfWeek.includes(d)),
    startDate: rb.startDate,
    endDate: rb.endDate,
    playerName: rb.playerName,
    teamName: rb.teamName || '',
    phone: rb.phone || '',
    note: rb.note || '',
    releasedDates: [...(rb.releasedDates || [])].sort(),
    status: statusOf(rb, today),
    daysUntilEnd: daysLeft,
    endingSoon: statusOf(rb, today) !== 'cancelled' && daysLeft >= 0 && daysLeft <= 7,
    remainingSessions: remaining,
    createdAt: rb.createdAt,
  };
}

function validate(b, { partial = false } = {}) {
  const errs = [];
  const has = (k) => b[k] !== undefined;
  if (!partial || has('playerName')) if (!String(b.playerName || '').trim()) errs.push("Enter the player's name");
  if (!partial || has('startTime')) if (!HM.test(String(b.startTime || ''))) errs.push('Pick a start time');
  if (!partial || has('endTime')) if (!HM.test(String(b.endTime || ''))) errs.push('Pick an end time');
  if ((!partial || (has('startTime') && has('endTime'))) && HM.test(String(b.startTime)) && HM.test(String(b.endTime)) && b.endTime !== '00:00' && b.endTime <= b.startTime) errs.push('End time must be after the start time');
  if (!partial || has('daysOfWeek')) if (!Array.isArray(b.daysOfWeek) || !b.daysOfWeek.length || b.daysOfWeek.some((d) => !DAYS.includes(d))) errs.push('Pick at least one day of the week');
  if (!partial || has('startDate')) if (!YMD.test(String(b.startDate || ''))) errs.push('Pick the start date');
  if (!partial || has('endDate')) if (!YMD.test(String(b.endDate || ''))) errs.push('Pick the end date');
  return errs;
}

async function findClashes(arenaId, data, excludeId) {
  const sameCourt = await RecurringBlock.find({
    arenaId, courtId: data.courtId, isActive: true, startDate: { $lte: data.endDate }, endDate: { $gte: data.startDate },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).lean();
  const reserved = sameCourt.filter((o) => o.daysOfWeek.some((d) => data.daysOfWeek.includes(d)) && slotsOverlap(timeLabel(o), timeLabel(data)));
  const bookings = (await Booking.find({
    courtId: data.courtId, date: { $gte: data.startDate, $lte: data.endDate }, status: { $in: ['confirmed', 'rescheduled'] },
  }).populate('userId', 'name').select('date timeSlot userId').lean())
    .filter((b) => data.daysOfWeek.includes(dayOf(b.date)) && slotsOverlap(b.timeSlot, timeLabel(data)))
    .map((b) => ({ date: b.date, timeSlot: b.timeSlot, customer: nameOf(b.userId) || 'Customer' }));
  return { reserved, bookings };
}

/** GET /arena-admin/reserved-slots?status=current|ended|all */
async function listReservedSlots(req, res) {
  const today = arenaTodayYmd();
  const q = { arenaId: req.arenaScopeId };
  const s = req.query.status || 'current';
  if (s === 'current') { q.isActive = true; q.endDate = { $gte: today }; }
  if (s === 'ended') q.$or = [{ isActive: false }, { endDate: { $lt: today } }];
  const [list, courts] = await Promise.all([
    RecurringBlock.find(q).sort({ endDate: s === 'current' ? 1 : -1 }).lean(),
    Court.find({ arenaId: req.arenaScopeId }).select('name').lean(),
  ]);
  const courtName = new Map(courts.map((c) => [String(c._id), c.name]));
  return res.json({ reservedSlots: list.map((rb) => toPublic(rb, courtName.get(String(rb.courtId)), today)), today });
}

/** POST /arena-admin/reserved-slots  { courtId, startTime, endTime, daysOfWeek[], startDate, endDate, playerName, teamName?, phone?, note?, confirm? } */
async function createReservedSlot(req, res) {
  const b = req.body || {};
  const errs = validate(b);
  if (!mongoose.isValidObjectId(b.courtId)) errs.unshift('Pick a court');
  if (errs.length) return res.status(400).json({ error: errs.join('. ') });
  if (b.endDate < b.startDate) return res.status(400).json({ error: 'The end date must be on or after the start date' });
  if (b.endDate > addDays(b.startDate, 731)) return res.status(400).json({ error: 'Reserve for at most 2 years at a time' });
  if (b.endDate < arenaTodayYmd()) return res.status(400).json({ error: 'The end date is in the past' });
  const court = await Court.findOne({ _id: b.courtId, arenaId: req.arenaScopeId }).lean();
  if (!court) return res.status(404).json({ error: 'Court not found' });

  const data = {
    arenaId: req.arenaScopeId, courtId: court._id, startTime: b.startTime, endTime: b.endTime,
    daysOfWeek: DAYS.filter((d) => b.daysOfWeek.includes(d)), startDate: b.startDate, endDate: b.endDate,
    playerName: String(b.playerName).trim(), teamName: String(b.teamName || '').trim(), phone: String(b.phone || '').trim(),
    note: String(b.note || '').trim(), createdBy: req.auth.sub,
  };
  const { reserved, bookings } = await findClashes(req.arenaScopeId, data);
  if (reserved.length) {
    const o = reserved[0];
    return res.status(409).json({ error: `${court.name} is already reserved for ${o.playerName}${o.teamName ? ` (${o.teamName})` : ''} at ${o.startTime}-${o.endTime} on ${o.daysOfWeek.join(', ')} until ${o.endDate}.` });
  }
  if (bookings.length && !b.confirm) {
    return res.status(409).json({ needsConfirm: true, error: `${bookings.length} existing booking(s) fall on these times. They stay booked; the reservation covers every other date.`, conflicts: bookings.slice(0, 50) });
  }
  const rb = await RecurringBlock.create(data);
  return res.status(201).json({ reservedSlot: toPublic(rb.toObject(), court.name, arenaTodayYmd()), existingBookings: bookings.length });
}

async function findOwn(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) { res.status(400).json({ error: 'Invalid id' }); return null; }
  const rb = await RecurringBlock.findOne({ _id: req.params.id, arenaId: req.arenaScopeId });
  if (!rb) { res.status(404).json({ error: 'Reserved slot not found' }); return null; }
  return rb;
}
const respond = async (res, rb) => {
  const court = await Court.findById(rb.courtId).select('name').lean();
  return res.json({ reservedSlot: toPublic(rb.toObject(), court?.name, arenaTodayYmd()) });
};

/** PATCH /arena-admin/reserved-slots/:id  { playerName?, teamName?, phone?, note?, endDate? } — edit details or extend/shorten. */
async function updateReservedSlot(req, res) {
  const rb = await findOwn(req, res); if (!rb) return undefined;
  const b = req.body || {};
  const errs = validate(b, { partial: true });
  if (errs.length) return res.status(400).json({ error: errs.join('. ') });
  for (const k of ['playerName', 'teamName', 'phone', 'note']) if (b[k] !== undefined) rb[k] = String(b[k]).trim();
  if (b.endDate !== undefined && b.endDate !== rb.endDate) {
    if (b.endDate < rb.startDate) return res.status(400).json({ error: 'The end date must be on or after the start date' });
    if (b.endDate > addDays(rb.startDate, 731)) return res.status(400).json({ error: 'Reserve for at most 2 years at a time' });
    if (b.endDate > rb.endDate) {
      const { reserved } = await findClashes(req.arenaScopeId, { ...rb.toObject(), startDate: addDays(rb.endDate, 1), endDate: b.endDate }, rb._id);
      if (reserved.length) return res.status(409).json({ error: `Can't extend: the court is reserved for ${reserved[0].playerName} from ${reserved[0].startDate}.` });
    }
    rb.endDate = b.endDate;
    rb.endingNotifiedAt = null; // a new end date gets its own 7-day notice
  }
  await rb.save();
  return respond(res, rb);
}

/** POST /arena-admin/reserved-slots/:id/release { date } — free one date (player absent). */
async function releaseReservedDate(req, res) {
  const rb = await findOwn(req, res); if (!rb) return undefined;
  const date = String(req.body?.date || '');
  if (!YMD.test(date) || date < rb.startDate || date > rb.endDate || !rb.daysOfWeek.includes(dayOf(date))) {
    return res.status(400).json({ error: `Pick a date between ${rb.startDate} and ${rb.endDate} on ${rb.daysOfWeek.join(', ')}` });
  }
  if (!rb.releasedDates.includes(date)) rb.releasedDates.push(date);
  await rb.save();
  return respond(res, rb);
}

/** POST /arena-admin/reserved-slots/:id/restore { date } — re-block a freed date. */
async function restoreReservedDate(req, res) {
  const rb = await findOwn(req, res); if (!rb) return undefined;
  const date = String(req.body?.date || '');
  const clash = await Booking.findOne({ courtId: rb.courtId, date, status: { $in: ['confirmed', 'rescheduled'] } }).select('timeSlot').lean();
  if (clash && slotsOverlap(clash.timeSlot, timeLabel(rb))) return res.status(409).json({ error: 'Someone has booked that slot since it was freed' });
  rb.releasedDates = rb.releasedDates.filter((d) => d !== date);
  await rb.save();
  return respond(res, rb);
}

/** POST /arena-admin/reserved-slots/:id/end — unblock now (from today). */
async function endReservedSlot(req, res) {
  const rb = await findOwn(req, res); if (!rb) return undefined;
  const today = arenaTodayYmd();
  if (rb.startDate >= today) rb.isActive = false; // hadn't started: cancel it
  else rb.endDate = addDays(today, -1) < rb.endDate ? addDays(today, -1) : rb.endDate; // played up to yesterday
  rb.endingNotifiedAt = rb.endingNotifiedAt || new Date();
  await rb.save();
  return respond(res, rb);
}

/**
 * Hourly: notify the arena's admins (and Super Admins) once, 7 days before a reservation ends.
 */
async function notifyEndingReservedSlots() {
  const { createNotification } = require('../services/notificationService');
  const today = arenaTodayYmd();
  const due = await RecurringBlock.find({ isActive: true, endingNotifiedAt: null, endDate: { $gte: today, $lte: addDays(today, 7) } }).lean();
  for (const rb of due) {
    const [court, staff] = await Promise.all([
      Court.findById(rb.courtId).select('name').lean(),
      User.find({ isActive: { $ne: false }, $or: [{ role: 'ARENA_ADMIN', assignedArenaId: String(rb.arenaId) }, { role: 'SUPER_ADMIN' }] }).select('_id').lean(),
    ]);
    const days = Math.round((new Date(`${rb.endDate}T12:00:00Z`) - new Date(`${today}T12:00:00Z`)) / 864e5);
    const who = `${rb.playerName}${rb.teamName ? ` (${rb.teamName})` : ''}`;
    const when = new Date(`${rb.endDate}T12:00:00Z`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
    const title = `Reserved slot ends ${days === 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`}`;
    const message = `${court?.name || 'Court'} ${rb.startTime}-${rb.endTime} (${rb.daysOfWeek.join(', ')}) for ${who} ends on ${when}. Extend it in Reserved Slots if they continue; otherwise it frees up automatically.`;
    for (const u of staff) await createNotification(u._id, title, message, 'warning', { kind: 'reserved_slot_ending', reservedSlotId: String(rb._id) });
    await RecurringBlock.updateOne({ _id: rb._id }, { $set: { endingNotifiedAt: new Date() } });
  }
  return due.length;
}

let timer = null;
function startReservedSlotNotifier() {
  const run = () => notifyEndingReservedSlots().catch((e) => console.error('[reservedSlots] notify failed:', e.message));
  setTimeout(run, 30 * 1000).unref?.();
  if (!timer) { timer = setInterval(run, 60 * 60 * 1000); timer.unref?.(); }
}

module.exports = {
  listReservedSlots, createReservedSlot, updateReservedSlot, releaseReservedDate, restoreReservedDate, endReservedSlot,
  notifyEndingReservedSlots, startReservedSlotNotifier,
};
