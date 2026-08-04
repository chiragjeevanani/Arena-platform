const mongoose = require('mongoose');
const Court = require('../models/Court');
const CourtSlot = require('../models/CourtSlot');
const Booking = require('../models/Booking');
const AvailabilityBlock = require('../models/AvailabilityBlock');
const UserMembership = require('../models/UserMembership');
const { buildCourtAvailabilityQuery } = require('../utils/bookingQuery');

const timeToMinutes = (t) => {
  if (!t) return 0;
  const parts = t.trim().split(' ');
  const [h, m] = parts[0].split(':').map(Number);
  let finalH = h;
  if (parts.length > 1) {
    const period = parts[1].toUpperCase();
    if (period === 'PM' && h !== 12) finalH += 12;
    if (period === 'AM' && h === 12) finalH = 0;
  }
  return finalH * 60 + (m || 0);
};

const isSlotBlocked = (timeSlot, blocks) => {
  if (!blocks || blocks.length === 0) return false;
  const [sStartStr, sEndStr] = timeSlot.split(' - ');
  const sStart = timeToMinutes(sStartStr);
  const sEnd = timeToMinutes(sEndStr);

  return blocks.some(b => {
    const bStart = timeToMinutes(b.startTime);
    const bEnd = timeToMinutes(b.endTime);
    return (sStart < bEnd) && (sEnd > bStart);
  });
};

async function getCourtAvailability(req, res) {
  const { courtId } = req.params;
  const { date } = req.query;

  if (!mongoose.isValidObjectId(courtId)) {
    return res.status(400).json({ error: 'Invalid court id' });
  }

  if (!date || typeof date !== 'string' || !date.trim()) {
    return res.status(400).json({ error: 'Query ?date=YYYY-MM-DD is required' });
  }

  const court = await Court.findById(courtId).lean();
  if (!court) {
    return res.status(404).json({ error: 'Court not found' });
  }

  const dateStr = date.trim();
  const dayOfWeek = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });

  // 1. Fetch configured slots for this court and day
  let configuredSlots = await CourtSlot.find({
    arenaId: court.arenaId,
    courtId: String(courtId),
    dayOfWeek,
    isActive: true,
    status: 'Available'
  }).sort({ startTime: 1 }).lean();

  // 2. Map configured slots
  const baseSlots = configuredSlots.map(s => ({ timeSlot: s.timeSlot }));

  // 3. Fetch Bookings and AvailabilityBlocks
  const [booked, blocks] = await Promise.all([
    Booking.find(buildCourtAvailabilityQuery({ courtId: court._id, date: dateStr }))
      .select('timeSlot')
      .lean(),
    AvailabilityBlock.find({
      courtId: court._id,
      date: dateStr,
    }).lean()
  ]);

  const bookedSet = new Set(booked.map((b) => b.timeSlot));
  const slots = baseSlots.map((s) => ({
    timeSlot: s.timeSlot,
    available: !bookedSet.has(s.timeSlot) && !isSlotBlocked(s.timeSlot, blocks),
  }));

  return res.json({
    courtId: court._id.toString(),
    arenaId: court.arenaId.toString(),
    date: dateStr,
    slots,
  });
}

function calculateMembershipEndDate(startDateStr, durationDays, activeDays) {
  if (!activeDays || activeDays.length === 0) {
    const d = new Date(startDateStr);
    d.setDate(d.getDate() + durationDays - 1);
    return d.toISOString().slice(0, 10);
  }

  const DAY_MAP = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const targetDays = new Set(activeDays.map(d => DAY_MAP[d]));

  const cursor = new Date(startDateStr);
  let playDaysCount = 0;
  
  for (let i = 0; i < 2000; i++) {
    const dayOfWeek = cursor.getDay();
    if (targetDays.has(dayOfWeek)) {
      playDaysCount++;
    }
    if (playDaysCount === durationDays) {
      return cursor.toISOString().slice(0, 10);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  
  const d = new Date(startDateStr);
  d.setDate(d.getDate() + durationDays - 1);
  return d.toISOString().slice(0, 10);
}

const DAY_MAP = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const DAY_ORDER_LIST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getOccurrenceDates(startDate, endDate, targetDayOfWeek) {
  const targetDay = DAY_MAP[targetDayOfWeek];
  if (targetDay === undefined) return [];

  const dates = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  while (cursor <= end) {
    if (cursor.getDay() === targetDay) {
      dates.push(cursor.toISOString().slice(0, 10));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

/**
 * GET /api/public/courts/:courtId/slots?startDate=YYYY-MM-DD&durationMonths=N
 *
 * Returns slots GROUPED by timeSlot. Each group represents a single membership
 * slot that covers all days it is configured for. Selecting one group books the
 * user for that time on ALL its configured days for the entire membership period.
 */
async function listCourtSlots(req, res) {
  const { courtId } = req.params;
  const { startDate, durationMonths } = req.query;

  if (!mongoose.isValidObjectId(courtId)) {
    return res.status(400).json({ error: 'Invalid court id' });
  }

  const court = await Court.findById(courtId).lean();
  if (!court) {
    return res.status(404).json({ error: 'Court not found' });
  }

  const slots = await CourtSlot.find({
    courtId: String(courtId),
    isActive: true,
    status: 'Available',
  }).sort({ startTime: 1, dayOfWeek: 1 }).lean();

  // Build per-slot availability map
  let availabilityMap = {};
  if (startDate && durationMonths) {
    const months = Number(durationMonths) || 1;
    const durationDays = months === 1 ? 30 : months === 3 ? 90 : months === 6 ? 180 : 365;

    // Group active days by timeSlot to determine custom endDate for each slot group
    const timeSlotDays = {};
    for (const s of slots) {
      if (!timeSlotDays[s.timeSlot]) {
        timeSlotDays[s.timeSlot] = [];
      }
      timeSlotDays[s.timeSlot].push(s.dayOfWeek);
    }

    // Determine the maximum end date across all slot groups to query DB range correctly
    let maxEndDate = startDate;
    for (const timeSlot in timeSlotDays) {
      const activeDays = timeSlotDays[timeSlot];
      const customEnd = calculateMembershipEndDate(startDate, durationDays, activeDays);
      if (customEnd > maxEndDate) {
        maxEndDate = customEnd;
      }
    }

    const [bookings, activeMemberships] = await Promise.all([
      Booking.find(buildCourtAvailabilityQuery({
        courtId: court._id,
        date: { $gte: startDate, $lte: maxEndDate },
      })).select('timeSlot date').lean(),
      UserMembership.find({
        status: 'active',
        'bookedSlots.courtId': court._id,
        startsAt: { $lte: new Date(maxEndDate) },
        expiresAt: { $gte: new Date(startDate) },
      }).select('startsAt expiresAt bookedSlots.courtSlotId').lean()
    ]);

    for (const s of slots) {
      const activeDays = timeSlotDays[s.timeSlot];
      const slotEndDate = calculateMembershipEndDate(startDate, durationDays, activeDays);
      const occurrences = getOccurrenceDates(startDate, slotEndDate, s.dayOfWeek);
      const isBooked = bookings.some(b => b.timeSlot === s.timeSlot && occurrences.includes(b.date));

      const hasMembershipConflict = activeMemberships.some(mem => {
        const booksThisSlot = mem.bookedSlots.some(bs => String(bs.courtSlotId) === String(s._id));
        if (!booksThisSlot) return false;

        const overlapStart = new Date(Math.max(new Date(startDate).getTime(), new Date(mem.startsAt).getTime()));
        const overlapEnd = new Date(Math.min(new Date(slotEndDate).getTime(), new Date(mem.expiresAt).getTime()));
        const overlapDates = getOccurrenceDates(
          overlapStart.toISOString().slice(0, 10),
          overlapEnd.toISOString().slice(0, 10),
          s.dayOfWeek
        );
        return overlapDates.length > 0;
      });

      availabilityMap[s._id.toString()] = !isBooked && !hasMembershipConflict;
    }
  }

  // ─── Group slots by timeSlot ─────────────────────────────────────────────────
  // One timeSlot = one bookable membership unit (covers all its configured days).
  const groupMap = {};

  for (const s of slots) {
    const key = s.timeSlot;
    if (!groupMap[key]) {
      groupMap[key] = {
        timeSlot: s.timeSlot,
        startTime: s.startTime || '',
        slotClass: s.slotClass || 'nonPrime',
        days: [],
        courtSlotIds: [],
        allAvailable: true,
      };
    }
    groupMap[key].days.push(s.dayOfWeek);
    groupMap[key].courtSlotIds.push(s._id.toString());

    // A group is unavailable if ANY constituent day slot is unavailable
    const slotAvailable = availabilityMap[s._id.toString()] !== undefined
      ? availabilityMap[s._id.toString()]
      : true;
    if (!slotAvailable) {
      groupMap[key].allAvailable = false;
    }
  }

  const groupedSlots = Object.values(groupMap)
    .map(g => ({
      timeSlot: g.timeSlot,
      startTime: g.startTime,
      slotClass: g.slotClass,
      days: g.days.sort((a, b) => DAY_ORDER_LIST.indexOf(a) - DAY_ORDER_LIST.indexOf(b)),
      courtSlotIds: g.courtSlotIds,
      available: g.allAvailable,
    }))
    .sort((a, b) => timeToMinutes(a.startTime || a.timeSlot) - timeToMinutes(b.startTime || b.timeSlot));

  return res.json({
    courtId: court._id.toString(),
    arenaId: court.arenaId.toString(),
    slots: groupedSlots,
  });
}

module.exports = { getCourtAvailability, listCourtSlots };
