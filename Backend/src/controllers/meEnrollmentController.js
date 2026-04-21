const mongoose = require('mongoose');
const BatchEnrollment = require('../models/BatchEnrollment');
const CoachingBatch = require('../models/CoachingBatch');
const Arena = require('../models/Arena');

async function countActiveEnrollments(batchId) {
  return BatchEnrollment.countDocuments({
    batchId,
    status: { $in: ['pending', 'confirmed'] },
  });
}

async function createMyEnrollment(req, res) {
  const { batchId } = req.body;
  if (!batchId || !mongoose.isValidObjectId(batchId)) {
    return res.status(400).json({ error: 'Valid batchId is required' });
  }

  const batch = await CoachingBatch.findById(batchId);
  if (!batch || !batch.isPublished) {
    return res.status(404).json({ error: 'Batch not found' });
  }

  const arena = await Arena.findById(batch.arenaId);
  if (!arena || !arena.isPublished) {
    return res.status(404).json({ error: 'Arena not found' });
  }

  const userId = req.auth.sub;
  const existing = await BatchEnrollment.findOne({
    batchId: batch._id,
    userId,
    status: { $in: ['pending', 'confirmed'] },
  });
  if (existing) {
    return res.status(409).json({ error: 'Already enrolled in this batch' });
  }

  const taken = await countActiveEnrollments(batch._id);
  if (taken >= batch.capacity) {
    return res.status(400).json({ error: 'Batch is full' });
  }

  try {
    const enrollment = await BatchEnrollment.create({
      batchId: batch._id,
      userId,
      status: 'confirmed',
    });
    return res.status(201).json({
      enrollment: BatchEnrollment.toPublic(enrollment, {
        batchTitle: batch.title,
        arenaId: batch.arenaId.toString(),
      }),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Already enrolled in this batch' });
    }
    throw err;
  }
}

async function listMyEnrollments(req, res) {
  const userId = req.auth.sub;
  const list = await BatchEnrollment.find({ userId }).sort({ createdAt: -1 }).lean();
  const batchIds = list.map((e) => e.batchId);
  const batches = await CoachingBatch.find({ _id: { $in: batchIds } }).lean();
  const batchById = new Map(batches.map((b) => [b._id.toString(), b]));

  const out = list.map((e) => {
    const b = batchById.get(String(e.batchId));
    return BatchEnrollment.toPublic(e, {
      batchTitle: b?.title || '',
      arenaId: b ? String(b.arenaId) : '',
    });
  });

  return res.json({ enrollments: out });
}

async function cancelMyEnrollment(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid enrollment id' });
  }

  const enrollment = await BatchEnrollment.findOne({ _id: id, userId: req.auth.sub });
  if (!enrollment) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }
  if (enrollment.status === 'cancelled') {
    return res.status(400).json({ error: 'Enrollment is already cancelled' });
  }

  enrollment.status = 'cancelled';
  await enrollment.save();

  const batch = await CoachingBatch.findById(enrollment.batchId).lean();
  return res.json({
    enrollment: BatchEnrollment.toPublic(enrollment, {
      batchTitle: batch?.title || '',
      arenaId: batch ? String(batch.arenaId) : '',
    }),
  });
}

module.exports = { createMyEnrollment, listMyEnrollments, cancelMyEnrollment };
