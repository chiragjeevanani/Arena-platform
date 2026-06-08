const mongoose = require('mongoose');
const Court = require('../models/Court');
const CourtSlot = require('../models/CourtSlot');
const Booking = require('../models/Booking');
const AvailabilityBlock = require('../models/AvailabilityBlock');
const UserMembership = require('../models/UserMembership');

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
    Booking.find({
      courtId: court._id,
      date: dateStr,
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot').lean(),
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

const DAY_MAP = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

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
  }).sort({ dayOfWeek: 1, startTime: 1 }).lean();

  let availabilityMap = {};
  if (startDate && durationMonths) {
    const months = Number(durationMonths) || 1;
    const durationDays = months === 1 ? 30 : months === 3 ? 90 : months === 6 ? 180 : 365;
    const startDt = new Date(startDate);
    const endDt = new Date(startDt);
    endDt.setDate(endDt.getDate() + durationDays - 1);
    const endDate = endDt.toISOString().slice(0, 10);

    const [bookings, activeMemberships] = await Promise.all([
      Booking.find({
        courtId: court._id,
        date: { $gte: startDate, $lte: endDate },
        status: { $in: ['confirmed', 'pending', 'rescheduled'] }
      }).select('timeSlot date').lean(),
      UserMembership.find({
        status: 'active',
        'bookedSlots.courtId': court._id,
        startsAt: { $lte: new Date(endDate) },
        expiresAt: { $gte: new Date(startDate) },
      }).select('startsAt expiresAt bookedSlots.courtSlotId').lean()
    ]);

    for (const s of slots) {
      const occurrences = getOccurrenceDates(startDate, endDate, s.dayOfWeek);

      const isBooked = bookings.some(b => b.timeSlot === s.timeSlot && occurrences.includes(b.date));

      const hasMembershipConflict = activeMemberships.some(mem => {
        const booksThisSlot = mem.bookedSlots.some(bs => String(bs.courtSlotId) === String(s._id));
        if (!booksThisSlot) return false;

        const overlapStart = new Date(Math.max(new Date(startDate).getTime(), new Date(mem.startsAt).getTime()));
        const overlapEnd = new Date(Math.min(new Date(endDate).getTime(), new Date(mem.expiresAt).getTime()));
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

  return res.json({
    courtId: court._id.toString(),
    arenaId: court.arenaId.toString(),
    slots: slots.map((s) => ({
      id: s._id.toString(),
      dayOfWeek: s.dayOfWeek,
      timeSlot: s.timeSlot,
      startTime: s.startTime || '',
      endTime: s.endTime || '',
      slotClass: s.slotClass || 'nonPrime',
      price: s.price || 0,
      available: availabilityMap[s._id.toString()] !== undefined ? availabilityMap[s._id.toString()] : true
    })),
  });
}

module.exports = { getCourtAvailability, listCourtSlots };
