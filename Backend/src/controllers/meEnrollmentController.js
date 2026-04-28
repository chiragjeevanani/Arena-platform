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
    const arena = await Arena.findById(batch.arenaId);
    const b_price = Number(batch.price || 0);
    const b_regFee = Number(batch.registrationFee || 0);
    const b_tax = Number(batch.taxPercent || 18);
    const base = b_price + b_regFee;
    const total = base * (1 + (b_tax / 100));

    return res.status(201).json({
      enrollment: BatchEnrollment.toPublic(enrollment, {
        batchTitle: batch.title,
        arenaId: batch.arenaId.toString(),
        arenaName: arena?.name || 'Arena',
        arenaImage: arena?.images?.[0] || '',
        location: arena?.location?.address || arena?.name || 'Arena',
        price: total,
        basePrice: base,
        taxPercent: b_tax,
        date: enrollment.createdAt,
        timing: batch.scheduleTime || 'See schedule',
        days: batch.schedule || 'Coaching',
        coachName: batch.title || 'Certified Coach'
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

  const out = await Promise.all(list.map(async (e) => {
    const eBatchId = e.batchId ? String(e.batchId) : '';
    const b = batches.find(batch => String(batch._id) === eBatchId);
    
    let arena = null;
    if (b && b.arenaId) {
       arena = await Arena.findById(b.arenaId).lean();
    }
    
    const b_price = Number(b?.price || 0);
    const b_regFee = Number(b?.registrationFee || 0);
    const b_tax = Number(b?.taxPercent || 18);
    const base = b_price + b_regFee;
    const total = base * (1 + (b_tax / 100));

    return BatchEnrollment.toPublic(e, {
      batchTitle: b?.title || 'Coaching Program',
      arenaId: b ? String(b.arenaId) : '',
      arenaName: arena?.name || b?.arenaName || 'Arena',
      arenaImage: arena?.images?.[0] || '',
      location: arena?.location?.address || arena?.name || b?.arenaName || 'Arena',
      price: total,
      basePrice: base,
      taxPercent: b_tax,
      date: e.createdAt,
      timing: b?.scheduleTime || 'See schedule',
      days: b?.schedule || 'Coaching',
      coachName: b?.title || 'Certified Coach'
    });
  }));

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
  const arena = await Arena.findById(batch.arenaId);
  const b_price = Number(batch.price || 0);
  const b_regFee = Number(batch.registrationFee || 0);
  const b_tax = Number(batch.taxPercent || 18);
  const base = b_price + b_regFee;
  const total = base * (1 + (b_tax / 100));

  return res.json({
    enrollment: BatchEnrollment.toPublic(enrollment, {
      batchTitle: batch?.title || 'Coaching Program',
      arenaId: batch ? String(batch.arenaId) : '',
      arenaName: arena?.name || 'Arena',
      arenaImage: arena?.images?.[0] || '',
      location: arena?.location?.address || arena?.name || 'Arena',
      price: total,
      basePrice: base,
      taxPercent: b_tax,
      date: enrollment.createdAt,
      timing: batch.scheduleTime || 'See schedule',
      days: batch.schedule || 'Coaching',
      coachName: batch.title || 'Certified Coach'
    }),
  });
}

async function getMyEnrollmentById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid enrollment id' });
  }

  const enrollment = await BatchEnrollment.findOne({ _id: id, userId: req.auth.sub }).lean();
  if (!enrollment) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }

  const b = await CoachingBatch.findById(enrollment.batchId).lean();
  let arena = null;
  if (b && b.arenaId) {
    arena = await Arena.findById(b.arenaId).lean();
  }

  const b_price = Number(b?.price || 0);
  const b_regFee = Number(b?.registrationFee || 0);
  const b_tax = Number(b?.taxPercent || 18);
  const base = b_price + b_regFee;
  const total = base * (1 + (b_tax / 100));

  return res.json({
    enrollment: BatchEnrollment.toPublic(enrollment, {
      batchTitle: b?.title || 'Coaching Program',
      arenaId: b ? String(b.arenaId) : '',
      arenaName: arena?.name || b?.arenaName || 'Arena',
      arenaImage: arena?.images?.[0] || '',
      location: arena?.location?.address || arena?.name || b?.arenaName || 'Arena',
      price: total,
      basePrice: base,
      taxPercent: b_tax,
      date: enrollment.createdAt,
      timing: b?.scheduleTime || 'See schedule',
      days: b?.schedule || 'Coaching',
      coachName: b?.title || 'Certified Coach'
    }),
  });
}

module.exports = { createMyEnrollment, listMyEnrollments, cancelMyEnrollment, getMyEnrollmentById };
