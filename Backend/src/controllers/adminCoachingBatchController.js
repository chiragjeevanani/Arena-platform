const mongoose = require('mongoose');
const CoachingBatch = require('../models/CoachingBatch');
const Arena = require('../models/Arena');
const User = require('../models/User');
const BatchEnrollment = require('../models/BatchEnrollment');

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
    scheduleTime,
    isPublished,
    registrationFee,
    taxPercent,
    level,
    coachImage,
    rating,
    studentCount,
    experienceYears,
    benefits,
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
    scheduleTime: scheduleTime != null ? String(scheduleTime) : '',
    isPublished: Boolean(isPublished),
    registrationFee: registrationFee != null ? Number(registrationFee) : 500,
    taxPercent: taxPercent != null ? Number(taxPercent) : 18,
    level: level != null ? String(level) : 'Open',
    coachImage: coachImage != null ? String(coachImage) : '',
    rating: rating != null ? Number(rating) : 5.0,
    studentCount: studentCount != null ? String(studentCount) : '500+',
    experienceYears: experienceYears != null ? String(experienceYears) : '8+ Years',
    benefits: Array.isArray(benefits) ? benefits : [],
  });

  return res.status(201).json({ batch: CoachingBatch.toPublic(batch) });
}

async function listCoachingBatches(req, res) {
  const { arenaId } = req.query;
  if (!arenaId || !mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Valid arenaId query is required' });
  }

  const list = await CoachingBatch.find({ arenaId }).sort({ createdAt: -1 }).populate('coachId').lean();
  
  const enrollmentCounts = await BatchEnrollment.aggregate([
    {
      $match: {
        batchId: { $in: list.map(b => b._id) },
        status: { $in: ['pending', 'confirmed'] }
      }
    },
    { $group: { _id: '$batchId', count: { $sum: 1 } } }
  ]);
  const countMap = new Map(enrollmentCounts.map(c => [c._id.toString(), c.count]));

  return res.json({ batches: list.map((b) => CoachingBatch.toPublic(b, {
    coachName: b.coachId ? `${b.coachId.firstName || ''} ${b.coachId.lastName || ''}`.trim() || 'Unknown Coach' : '—',
    enrolledCount: countMap.get(b._id.toString()) || 0
  })) });
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
    scheduleTime,
    isPublished,
    coachId,
    registrationFee,
    taxPercent,
    level,
    coachImage,
    rating,
    studentCount,
    experienceYears,
    benefits,
  } = req.body;

  if (title !== undefined) batch.title = String(title).trim();
  if (description !== undefined) batch.description = String(description);
  if (capacity !== undefined) batch.capacity = Number(capacity);
  if (price !== undefined) batch.price = Number(price);
  if (startDate !== undefined) batch.startDate = String(startDate).trim();
  if (endDate !== undefined) batch.endDate = String(endDate).trim();
  if (schedule !== undefined) batch.schedule = String(schedule);
  if (scheduleTime !== undefined) batch.scheduleTime = String(scheduleTime);
  if (isPublished !== undefined) batch.isPublished = Boolean(isPublished);
  if (registrationFee !== undefined) batch.registrationFee = Number(registrationFee);
  if (taxPercent !== undefined) batch.taxPercent = Number(taxPercent);
  if (level !== undefined) batch.level = String(level);
  if (coachImage !== undefined) batch.coachImage = String(coachImage);
  if (rating !== undefined) batch.rating = Number(rating);
  if (studentCount !== undefined) batch.studentCount = String(studentCount);
  if (experienceYears !== undefined) batch.experienceYears = String(experienceYears);
  if (benefits !== undefined) batch.benefits = Array.isArray(benefits) ? benefits : [];

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

async function deleteCoachingBatch(req, res) {
  const { batchId } = req.params;
  if (!mongoose.isValidObjectId(batchId)) {
    return res.status(400).json({ error: 'Invalid batch id' });
  }

  const batch = await CoachingBatch.findByIdAndDelete(batchId);
  if (!batch) {
    return res.status(404).json({ error: 'Batch not found' });
  }

  return res.json({ message: 'Batch deleted successfully' });
}

module.exports = { createCoachingBatch, listCoachingBatches, updateCoachingBatch, deleteCoachingBatch };
