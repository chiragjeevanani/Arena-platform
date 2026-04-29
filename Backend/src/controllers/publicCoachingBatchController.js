const mongoose = require('mongoose');
const CoachingBatch = require('../models/CoachingBatch');
const Arena = require('../models/Arena');
const BatchEnrollment = require('../models/BatchEnrollment');

async function listPublishedArenaCoachingBatches(req, res) {
  const { arenaId } = req.params;
  if (!mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Invalid arena id' });
  }

  const arena = await Arena.findById(arenaId).lean();
  if (!arena || !arena.isPublished) {
    return res.status(404).json({ error: 'Arena not found' });
  }

  const list = await CoachingBatch.find({ arenaId, isPublished: true })
    .populate('coachId')
    .sort({ createdAt: -1 });

  if (!list.length) {
    return res.json({ arenaId, batches: [] });
  }

  const counts = await BatchEnrollment.aggregate([
    {
      $match: {
        batchId: { $in: list.map((b) => b._id) },
        status: { $in: ['pending', 'confirmed'] },
      },
    },
    { $group: { _id: '$batchId', n: { $sum: 1 } } },
  ]);
  const countByBatch = new Map(counts.map((c) => [String(c._id), c.n]));

  const batches = list.map((b) => {
    const taken = countByBatch.get(b._id.toString()) || 0;
    return CoachingBatch.toPublic(b, {
      enrolledCount: taken,
      spotsRemaining: Math.max(0, b.capacity - taken),
    });
  });

  return res.json({ arenaId, batches });
}

module.exports = { listPublishedArenaCoachingBatches };
