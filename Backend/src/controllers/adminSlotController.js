const CourtSlot = require('../models/CourtSlot');
const mongoose = require('mongoose');

function mapSlot(doc) {
  return {
    id: doc._id.toString(),
    arenaId: doc.arenaId.toString(),
    courtId: doc.courtId.toString(),
    dayOfWeek: doc.dayOfWeek,
    timeSlot: doc.timeSlot,
    startTime: doc.startTime,
    endTime: doc.endTime,
    price: doc.price,
    slotClass: doc.slotClass,
    type: doc.type,
    status: doc.status,
  };
}

async function listCourtSlots(req, res) {
  const { arenaId, courtId } = req.params;
  const { day } = req.query;

  if (!mongoose.isValidObjectId(arenaId) || !mongoose.isValidObjectId(courtId)) {
    return res.json({ slots: [] });
  }

  const query = { arenaId, courtId };
  if (day) query.dayOfWeek = day;

  const slots = await CourtSlot.find(query).sort({ startTime: 1, timeSlot: 1 });
  return res.json({ slots: slots.map(mapSlot) });
}

async function listArenaSlots(req, res) {
  const { arenaId } = req.params;
  const { day } = req.query;

  if (!mongoose.isValidObjectId(arenaId)) {
    return res.json({ slots: [] });
  }

  const query = { arenaId };
  if (day) query.dayOfWeek = day;

  const slots = await CourtSlot.find(query).sort({ startTime: 1, timeSlot: 1 });
  return res.json({ slots: slots.map(mapSlot) });
}

async function createCourtSlot(req, res) {
  const { arenaId, courtId } = req.params;
  const { dayOfWeek, timeSlot, startTime, endTime, price, slotClass, type, status } = req.body;

  if (!dayOfWeek || !timeSlot) {
    return res.status(400).json({ error: 'dayOfWeek and timeSlot are required' });
  }

  // Use findOneAndUpdate with upsert to avoid duplicates and handle updates
  const slot = await CourtSlot.findOneAndUpdate(
    { arenaId, courtId, dayOfWeek, timeSlot },
    {
      startTime,
      endTime,
      price: Number(price) || 0,
      slotClass: slotClass || 'nonPrime',
      type: type || 'Normal',
      status: status || 'Available',
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(201).json({ slot: mapSlot(slot) });
}

async function deleteCourtSlot(req, res) {
  const { slotId } = req.params;
  if (!mongoose.isValidObjectId(slotId)) {
    return res.status(400).json({ error: 'Invalid slot id' });
  }

  const slot = await CourtSlot.findByIdAndDelete(slotId);
  if (!slot) {
    return res.status(404).json({ error: 'Slot not found' });
  }

  return res.json({ ok: true });
}

module.exports = {
  listCourtSlots,
  listArenaSlots,
  createCourtSlot,
  deleteCourtSlot,
};
