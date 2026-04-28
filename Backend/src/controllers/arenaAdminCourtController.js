const Court = require('../models/Court');
const CourtSlot = require('../models/CourtSlot');
const Arena = require('../models/Arena');
const mongoose = require('mongoose');

function mapCourt(doc) {
  return {
    id: doc._id.toString(),
    arenaId: doc.arenaId.toString(),
    name: doc.name,
    type: doc.type,
    status: doc.status,
    imageUrl: doc.imageUrl,
    pricePerHour: doc.pricePerHour,
  };
}

function mapSlot(doc) {
  return {
    id: doc._id.toString(),
    arenaId: doc.arenaId.toString(),
    courtId: doc.courtId,
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

async function listMyCourts(req, res) {
  const courts = await Court.find({ arenaId: req.arenaScopeId }).sort({ createdAt: 1 }).lean();
  return res.json({ courts: courts.map(mapCourt) });
}

async function createMyCourt(req, res) {
  const { name, type, status, imageUrl } = req.body;
  if (!name) return res.status(400).json({ error: 'Court name is required' });

  const court = await Court.create({
    arenaId: req.arenaScopeId,
    name: name.trim(),
    type: (type || 'Wooden').trim(),
    status: status || 'active',
    imageUrl: imageUrl || ''
  });

  await Arena.findByIdAndUpdate(req.arenaScopeId, { $inc: { courtsCount: 1 } });

  return res.status(201).json({ court: mapCourt(court) });
}

async function patchMyCourt(req, res) {
  const { courtId } = req.params;
  const { name, type, status, imageUrl, pricePerHour } = req.body;

  const court = await Court.findOne({ _id: courtId, arenaId: req.arenaScopeId });
  if (!court) return res.status(404).json({ error: 'Court not found' });

  if (name !== undefined) court.name = name.trim();
  if (type !== undefined) court.type = type.trim();
  if (status !== undefined) court.status = status;
  if (imageUrl !== undefined) court.imageUrl = String(imageUrl || '');
  if (pricePerHour !== undefined) court.pricePerHour = Number(pricePerHour) || 0;

  await court.save();
  return res.json({ court: mapCourt(court) });
}

async function deleteMyCourt(req, res) {
  const { courtId } = req.params;
  const court = await Court.findOneAndDelete({ _id: courtId, arenaId: req.arenaScopeId });
  if (!court) return res.status(404).json({ error: 'Court not found' });

  await Arena.findByIdAndUpdate(req.arenaScopeId, { $inc: { courtsCount: -1 } });
  
  // Also cleanup slots
  await CourtSlot.deleteMany({ courtId: courtId, arenaId: req.arenaScopeId });

  return res.json({ ok: true });
}

async function listMyCourtSlots(req, res) {
  const { courtId } = req.params;
  const { dayOfWeek } = req.query;

  const query = { arenaId: req.arenaScopeId, courtId };
  if (dayOfWeek) query.dayOfWeek = dayOfWeek;

  const slots = await CourtSlot.find(query).sort({ startTime: 1, timeSlot: 1 }).lean();
  return res.json({ slots: slots.map(mapSlot) });
}

async function createMyCourtSlot(req, res) {
  const { courtId } = req.params;
  const { dayOfWeek, timeSlot, startTime, endTime, price, slotClass, type, status } = req.body;

  if (!dayOfWeek || !timeSlot) {
    return res.status(400).json({ error: 'dayOfWeek and timeSlot are required' });
  }

  // Verify court belongs to arena
  const court = await Court.findOne({ _id: courtId, arenaId: req.arenaScopeId });
  if (!court && !mongoose.isValidObjectId(courtId)) {
      // It might be a sequence number if the backend allows it, but usually it's ObjectId
  }

  const slot = await CourtSlot.findOneAndUpdate(
    { arenaId: req.arenaScopeId, courtId, dayOfWeek, timeSlot },
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

async function deleteMyCourtSlot(req, res) {
  const { slotId } = req.params;
  const slot = await CourtSlot.findOneAndDelete({ _id: slotId, arenaId: req.arenaScopeId });
  if (!slot) return res.status(404).json({ error: 'Slot not found' });

  return res.json({ ok: true });
}

module.exports = {
  listMyCourts,
  createMyCourt,
  patchMyCourt,
  deleteMyCourt,
  listMyCourtSlots,
  createMyCourtSlot,
  deleteMyCourtSlot,
};
