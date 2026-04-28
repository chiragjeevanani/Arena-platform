const mongoose = require('mongoose');
const Court = require('../models/Court');
const CourtSlot = require('../models/CourtSlot');
const Booking = require('../models/Booking');
const AvailabilityBlock = require('../models/AvailabilityBlock');

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

module.exports = { getCourtAvailability };
