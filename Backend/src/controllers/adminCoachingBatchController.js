const mongoose = require('mongoose');
const CoachingBatch = require('../models/CoachingBatch');
const Arena = require('../models/Arena');
const User = require('../models/User');

async function createCoachingBatch(req, res) {
  const {
    arenaId,
    coachId,
    title,
    description,
    capacity,
    price,
    startDate,
    endDate,
    schedule,
    isPublished,
  } = req.body;

  if (!arenaId || !coachId || !title || !capacity || !startDate || !endDate) {
    return res.status(400).json({ error: 'arenaId, coachId, title, capacity, startDate, and endDate are required' });
  }

  if (!mongoose.isValidObjectId(arenaId) || !mongoose.isValidObjectId(coachId)) {
    return res.status(400).json({ error: 'Invalid arena or coach id' });
  }

  const [arena, coach] = await Promise.all([Arena.findById(arenaId), User.findById(coachId)]);
  if (!arena) {
    return res.status(404).json({ error: 'Arena not found' });
  }
  if (!coach || coach.role !== 'COACH') {
    return res.status(400).json({ error: 'Coach user not found or not a coach' });
  }

  const batch = await CoachingBatch.create({
    arenaId,
    coachId,
    title: String(title).trim(),
    description: description != null ? String(description) : '',
    capacity: Number(capacity),
    price: price != null ? Number(price) : 0,
    startDate: String(startDate).trim(),
    endDate: String(endDate).trim(),
    schedule: schedule != null ? String(schedule) : '',
    isPublished: Boolean(isPublished),
  });

  return res.status(201).json({ batch: CoachingBatch.toPublic(batch) });
}

async function listCoachingBatches(req, res) {
  const { arenaId } = req.query;
  if (!arenaId || !mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Valid arenaId query is required' });
  }

  const list = await CoachingBatch.find({ arenaId }).sort({ createdAt: -1 }).lean();
  return res.json({ batches: list.map((b) => CoachingBatch.toPublic(b)) });
}

async function updateCoachingBatch(req, res) {
  const { batchId } = req.params;
  if (!mongoose.isValidObjectId(batchId)) {
    return res.status(400).json({ error: 'Invalid batch id' });
  }

  const batch = await CoachingBatch.findById(batchId);
  if (!batch) {
    return res.status(404).json({ error: 'Batch not found' });
  }

  const {
    title,
    description,
    capacity,
    price,
    startDate,
    endDate,
    schedule,
    isPublished,
    coachId,
  } = req.body;

  if (title !== undefined) batch.title = String(title).trim();
  if (description !== undefined) batch.description = String(description);
  if (capacity !== undefined) batch.capacity = Number(capacity);
  if (price !== undefined) batch.price = Number(price);
  if (startDate !== undefined) batch.startDate = String(startDate).trim();
  if (endDate !== undefined) batch.endDate = String(endDate).trim();
  if (schedule !== undefined) batch.schedule = String(schedule);
  if (isPublished !== undefined) batch.isPublished = Boolean(isPublished);
  if (coachId !== undefined) {
    if (!mongoose.isValidObjectId(coachId)) {
      return res.status(400).json({ error: 'Invalid coach id' });
    }
    const coach = await User.findById(coachId);
    if (!coach || coach.role !== 'COACH') {
      return res.status(400).json({ error: 'Coach user not found or not a coach' });
    }
    batch.coachId = coachId;
  }

  await batch.save();
  return res.json({ batch: CoachingBatch.toPublic(batch) });
}

module.exports = { createCoachingBatch, listCoachingBatches, updateCoachingBatch };
