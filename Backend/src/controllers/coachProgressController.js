const mongoose = require('mongoose');
const CoachingBatch = require('../models/CoachingBatch');
const BatchEnrollment = require('../models/BatchEnrollment');
const User = require('../models/User');
const Arena = require('../models/Arena');
const CoachStudentProgress = require('../models/CoachStudentProgress');
const CoachRemark = require('../models/CoachRemark');

async function assertCoachOwnsBatch(coachId, batchId) {
  if (!mongoose.isValidObjectId(batchId)) return null;
  const batch = await CoachingBatch.findById(batchId).lean();
  if (!batch || String(batch.coachId) !== String(coachId)) return null;
  return batch;
}

async function listBatchProgress(req, res) {
  const coachId = req.auth.sub;
  const { batchId } = req.params;
  const oneUserId = (req.query.userId || '').trim();
  const batch = await assertCoachOwnsBatch(coachId, batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  if (oneUserId) {
    if (!mongoose.isValidObjectId(oneUserId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }
    const enrolled = await BatchEnrollment.findOne({
      batchId: batch._id,
      userId: oneUserId,
      status: { $in: ['confirmed', 'pending'] },
    }).lean();
    if (!enrolled) {
      return res.status(400).json({ error: 'Student is not enrolled in this batch' });
    }
    const doc = await CoachStudentProgress.findOne({
      batchId: batch._id,
      studentUserId: oneUserId,
    }).lean();
    const u = await User.findById(oneUserId).lean();
    if (!doc) {
      return res.json({
        records: [
          {
            batchId: String(batch._id),
            studentUserId: String(oneUserId),
            studentName: u?.name || '',
            metrics: [],
            remarks: '',
          },
        ],
      });
    }
    return res.json({
      records: [
        {
          ...CoachStudentProgress.toPublic(doc),
          studentName: u?.name || '',
        },
      ],
    });
  }

  const rows = await CoachStudentProgress.find({ batchId: batch._id }).lean();
  const userIds = rows.map((r) => r.studentUserId);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const nameById = new Map(users.map((u) => [u._id.toString(), u.name || '']));

  const records = rows.map((r) => ({
    ...CoachStudentProgress.toPublic(r),
    studentName: nameById.get(String(r.studentUserId)) || '',
  }));
  return res.json({ records });
}

async function upsertBatchProgress(req, res) {
  const coachId = req.auth.sub;
  const { batchId } = req.params;
  const batch = await assertCoachOwnsBatch(coachId, batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  const { userId, metrics, remarks } = req.body;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const enrolled = await BatchEnrollment.findOne({
    batchId: batch._id,
    userId,
    status: { $in: ['confirmed', 'pending'] },
  }).lean();
  if (!enrolled) {
    return res.status(400).json({ error: 'Student is not enrolled in this batch' });
  }

  let cleanedMetrics = [];
  if (Array.isArray(metrics)) {
    cleanedMetrics = metrics
      .filter((m) => m && typeof m.metricKey === 'string' && m.metricKey.trim())
      .map((m) => ({
        metricKey: String(m.metricKey).trim().slice(0, 64),
        groupCategory: String(m.groupCategory || '').trim().slice(0, 120),
        name: String(m.name || '').trim().slice(0, 120),
        score: Math.min(10, Math.max(0, Number(m.score) || 0)),
      }));
  }

  const remarksStr =
    typeof remarks === 'string' ? remarks.trim().slice(0, 8000) : undefined;

  const update = {
    coachId,
    metrics: cleanedMetrics,
  };
  if (remarksStr !== undefined) update.remarks = remarksStr;

  const doc = await CoachStudentProgress.findOneAndUpdate(
    { batchId: batch._id, studentUserId: userId },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const u = await User.findById(userId).lean();
  return res.json({
    record: {
      ...CoachStudentProgress.toPublic(doc),
      studentName: u?.name || '',
    },
  });
}

async function listCoachRemarks(req, res) {
  const coachId = req.auth.sub;
  const batchId = (req.query.batchId || '').trim();
  if (!batchId || !mongoose.isValidObjectId(batchId)) {
    return res.status(400).json({ error: 'batchId query is required' });
  }
  const batch = await assertCoachOwnsBatch(coachId, batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  const rows = await CoachRemark.find({ batchId: batch._id, coachId })
    .sort({ pinned: -1, createdAt: -1 })
    .limit(200)
    .lean();

  const userIds = rows.map((r) => r.studentUserId).filter(Boolean);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const nameById = new Map(users.map((u) => [u._id.toString(), u.name || '']));

  const remarks = rows.map((r) => {
    const pub = CoachRemark.toPublic(r);
    const sid = r.studentUserId ? String(r.studentUserId) : null;
    return {
      ...pub,
      studentName: sid ? nameById.get(sid) || 'Student' : 'General',
    };
  });
  return res.json({ remarks });
}

async function createCoachRemark(req, res) {
  const coachId = req.auth.sub;
  const { batchId, studentUserId, text, rating, pinned } = req.body;
  if (!batchId || !mongoose.isValidObjectId(batchId)) {
    return res.status(400).json({ error: 'batchId is required' });
  }
  const batch = await assertCoachOwnsBatch(coachId, batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  const t = typeof text === 'string' ? text.trim() : '';
  if (!t) return res.status(400).json({ error: 'text is required' });

  let studentOid = null;
  if (studentUserId) {
    if (!mongoose.isValidObjectId(studentUserId)) {
      return res.status(400).json({ error: 'Invalid studentUserId' });
    }
    const enrolled = await BatchEnrollment.findOne({
      batchId: batch._id,
      userId: studentUserId,
      status: { $in: ['confirmed', 'pending'] },
    }).lean();
    if (!enrolled) {
      return res.status(400).json({ error: 'Student is not enrolled in this batch' });
    }
    studentOid = studentUserId;
  }

  const doc = await CoachRemark.create({
    batchId: batch._id,
    coachId,
    studentUserId: studentOid,
    text: t.slice(0, 8000),
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    pinned: !!pinned,
  });
  const u = studentOid ? await User.findById(studentOid).lean() : null;
  return res.status(201).json({
    remark: {
      ...CoachRemark.toPublic(doc),
      studentName: u?.name || (studentOid ? 'Student' : 'General'),
    },
  });
}

async function deleteCoachRemark(req, res) {
  const coachId = req.auth.sub;
  const { remarkId } = req.params;
  if (!mongoose.isValidObjectId(remarkId)) {
    return res.status(400).json({ error: 'Invalid remark id' });
  }
  const row = await CoachRemark.findOne({ _id: remarkId, coachId });
  if (!row) return res.status(404).json({ error: 'Remark not found' });
  await CoachRemark.deleteOne({ _id: remarkId });
  return res.json({ ok: true });
}

async function patchCoachRemark(req, res) {
  const coachId = req.auth.sub;
  const { remarkId } = req.params;
  if (!mongoose.isValidObjectId(remarkId)) {
    return res.status(400).json({ error: 'Invalid remark id' });
  }
  const row = await CoachRemark.findOne({ _id: remarkId, coachId });
  if (!row) return res.status(404).json({ error: 'Remark not found' });

  const { pinned } = req.body;
  if (typeof pinned === 'boolean') row.pinned = pinned;
  await row.save();
  return res.json({ remark: CoachRemark.toPublic(row) });
}

async function listAllCoachProgress(req, res) {
  const coachId = req.auth.sub;
  const batches = await CoachingBatch.find({ coachId }).lean();
  const batchIds = batches.map((b) => b._id);
  const titleById = new Map(batches.map((b) => [b._id.toString(), b.title]));
  if (!batchIds.length) return res.json({ records: [] });

  const rows = await CoachStudentProgress.find({ batchId: { $in: batchIds } }).lean();
  const userIds = [...new Set(rows.map((r) => String(r.studentUserId)))];
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const nameById = new Map(users.map((u) => [u._id.toString(), u.name || '']));

  const records = rows.map((r) => ({
    ...CoachStudentProgress.toPublic(r),
    studentName: nameById.get(String(r.studentUserId)) || '',
    batchTitle: titleById.get(String(r.batchId)) || '',
  }));
  return res.json({ records });
}

async function listBatchesForStudent(req, res) {
  const coachId = req.auth.sub;
  const { userId } = req.params;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }
  const batches = await CoachingBatch.find({ coachId }).sort({ startDate: 1 }).lean();
  const batchIds = batches.map((b) => b._id);
  if (!batchIds.length) return res.json({ batches: [] });

  const enrolls = await BatchEnrollment.find({
    userId,
    batchId: { $in: batchIds },
    status: { $in: ['confirmed', 'pending'] },
  })
    .select('batchId')
    .lean();
  const enrolledSet = new Set(enrolls.map((e) => String(e.batchId)));

  const out = [];
  for (const b of batches) {
    if (!enrolledSet.has(String(b._id))) continue;
    const arena = await Arena.findById(b.arenaId).lean();
    out.push({
      id: String(b._id),
      title: b.title,
      schedule: b.schedule || '',
      startDate: b.startDate,
      endDate: b.endDate,
      arenaName: arena?.name || '',
    });
  }
  return res.json({ batches: out });
}

module.exports = {
  listBatchProgress,
  upsertBatchProgress,
  listAllCoachProgress,
  listBatchesForStudent,
  listCoachRemarks,
  createCoachRemark,
  deleteCoachRemark,
  patchCoachRemark,
};
