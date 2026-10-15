/**
 * Single definition of "can this court slot be booked on this date", shared by the
 * public availability API and booking creation so the server never accepts a slot
 * the app would not have offered.
 */
const CourtSlot = require('../models/CourtSlot');
const Booking = require('../models/Booking');
const AvailabilityBlock = require('../models/AvailabilityBlock');
const UserMembership = require('../models/UserMembership');
const SlotFreeRequest = require('../models/SlotFreeRequest');
const { buildCourtSlotConflictQuery } = require('../utils/bookingQuery');

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Slot types the public app offers (Academy / Reserved / Maintenance are staff-only).
const PUBLIC_SLOT_TYPES = ['Public', 'Normal', 'Peak', null];
// Oman (Asia/Muscat) is UTC+4 all year — no daylight saving.
const ARENA_UTC_OFFSET_MINUTES = 4 * 60;

function isValidYmd(dateStr) {
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(`${dateStr}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateStr;
}

function dayOfWeekOf(dateStr) {
  return DAY_NAMES[new Date(`${dateStr}T12:00:00Z`).getUTCDay()];
}

const timeToMinutes = (t) => {
  if (!t) return 0;
  const parts = String(t).trim().split(' ');
  const [h, m] = parts[0].split(':').map(Number);
  let finalH = h;
  if (parts.length > 1) {
    const period = parts[1].toUpperCase();
    if (period === 'PM' && h !== 12) finalH += 12;
    if (period === 'AM' && h === 12) finalH = 0;
  }
  return finalH * 60 + (m || 0);
};

function isSlotBlocked(timeSlot, blocks) {
  if (!blocks || blocks.length === 0) return false;
  const [sStartStr, sEndStr] = String(timeSlot).split(' - ');
  const sStart = timeToMinutes(sStartStr);
  let sEnd = timeToMinutes(sEndStr);
  if (sEnd <= sStart) sEnd += 24 * 60; // slot running past midnight
  return blocks.some((b) => {
    const bStart = timeToMinutes(b.startTime);
    const bEnd = timeToMinutes(b.endTime);
    return sStart < bEnd && sEnd > bStart;
  });
}

/** UTC instant at which a slot starts, interpreting the date/time in arena local time. */
function slotStartInstant(dateStr, timeSlot) {
  if (!isValidYmd(dateStr)) return null;
  const m = String(timeSlot || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = (m[3] || '').toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  const [y, mo, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, min) - ARENA_UTC_OFFSET_MINUTES * 60 * 1000);
}

/** Today's date (YYYY-MM-DD) in arena local time. */
function arenaTodayYmd(now = new Date()) {
  return new Date(now.getTime() + ARENA_UTC_OFFSET_MINUTES * 60 * 1000).toISOString().slice(0, 10);
}

/** True when the date is before today, or the slot has already started (arena local time). */
function isSlotInPast(dateStr, timeSlot, now = new Date()) {
  if (!isValidYmd(dateStr)) return true;
  const today = arenaTodayYmd(now);
  if (dateStr < today) return true;
  if (dateStr > today) return false;
  const start = slotStartInstant(dateStr, timeSlot);
  return start ? start.getTime() <= now.getTime() : false;
}

/**
 * Court slot ids reserved on this date by an active slot membership (weekly recurring
 * slots), minus the ones the member freed for that date.
 */
async function membershipHeldSlotIds(courtSlotIds, dateStr) {
  if (!courtSlotIds.length) return new Set();
  const dayStart = new Date(`${dateStr}T00:00:00Z`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);
  const memberships = await UserMembership.find({
    status: 'active',
    'bookedSlots.courtSlotId': { $in: courtSlotIds },
    startsAt: { $lte: dayEnd },
    expiresAt: { $gte: dayStart },
  })
    .select('bookedSlots.courtSlotId')
    .lean();
  if (!memberships.length) return new Set();

  const wanted = new Set(courtSlotIds.map(String));
  const held = new Set();
  for (const m of memberships) {
    for (const s of m.bookedSlots || []) {
      if (s.courtSlotId && wanted.has(String(s.courtSlotId))) held.add(String(s.courtSlotId));
    }
  }
  if (!held.size) return held;

  const freed = await SlotFreeRequest.find({
    courtSlotId: { $in: [...held] },
    freedDate: dateStr,
    status: 'freed',
  })
    .select('courtSlotId')
    .lean();
  for (const f of freed) held.delete(String(f.courtSlotId));
  return held;
}

/** Public, active configured slots for a court on a date. */
async function findPublicCourtSlots(court, dateStr) {
  return CourtSlot.find({
    arenaId: court.arenaId,
    courtId: String(court._id),
    dayOfWeek: dayOfWeekOf(dateStr),
    isActive: true,
    status: 'Available',
    type: { $in: PUBLIC_SLOT_TYPES },
  })
    .sort({ startTime: 1 })
    .lean();
}

/** Availability flags for every public slot of a court on a date. */
async function listCourtDayAvailability(court, dateStr) {
  const configuredSlots = await findPublicCourtSlots(court, dateStr);
  const [booked, blocks, held] = await Promise.all([
    Booking.find({ courtId: court._id, date: dateStr, status: { $in: ['confirmed', 'rescheduled'] } })
      .select('timeSlot')
      .lean(),
    AvailabilityBlock.find({ courtId: court._id, date: dateStr }).lean(),
    membershipHeldSlotIds(configuredSlots.map((s) => s._id), dateStr),
  ]);
  const bookedSet = new Set(booked.map((b) => b.timeSlot));
  return configuredSlots.map((s) => ({
    slot: s,
    available:
      !bookedSet.has(s.timeSlot) &&
      !isSlotBlocked(s.timeSlot, blocks) &&
      !held.has(String(s._id)),
  }));
}

/**
 * Validates that a customer may book this slot right now.
 * Returns { ok: true, courtSlot } or { ok: false, status, error }.
 */
async function checkSlotBookable({ court, dateStr, timeSlot }) {
  if (court.status === 'inactive') {
    return { ok: false, status: 400, error: 'This court is not available for booking' };
  }
  const configured = await findPublicCourtSlots(court, dateStr);
  const courtSlot = configured.find((s) => s.timeSlot === timeSlot);
  if (!courtSlot) {
    return { ok: false, status: 400, error: 'This time slot is not offered on the selected date' };
  }

  const [taken, blocks, held] = await Promise.all([
    Booking.findOne(buildCourtSlotConflictQuery({ courtId: court._id, date: dateStr, timeSlot })).lean(),
    AvailabilityBlock.find({ courtId: court._id, date: dateStr }).lean(),
    membershipHeldSlotIds([courtSlot._id], dateStr),
  ]);
  if (taken || held.size) {
    return { ok: false, status: 409, error: 'This time slot is already booked' };
  }
  if (isSlotBlocked(timeSlot, blocks)) {
    return { ok: false, status: 409, error: 'This time slot is blocked by the arena' };
  }
  return { ok: true, courtSlot };
}

module.exports = {
  isValidYmd,
  dayOfWeekOf,
  timeToMinutes,
  isSlotBlocked,
  isSlotInPast,
  slotStartInstant,
  arenaTodayYmd,
  listCourtDayAvailability,
  checkSlotBookable,
};
