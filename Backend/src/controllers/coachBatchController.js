const mongoose = require('mongoose');
const CoachingBatch = require('../models/CoachingBatch');
const Arena = require('../models/Arena');
const BatchEnrollment = require('../models/BatchEnrollment');
const User = require('../models/User');
const CoachingAttendance = require('../models/CoachingAttendance');

async function listCoachBatches(req, res) {
  const coachId = req.auth.sub;
  const list = await CoachingBatch.find({ coachId }).sort({ startDate: 1 }).lean();

  const batchIds = list.map((b) => b._id);
  let countById = new Map();
  if (batchIds.length) {
    const counts = await BatchEnrollment.aggregate([
      {
        $match: {
          batchId: { $in: batchIds },
          status: { $in: ['confirmed', 'pending'] },
        },
      },
      { $group: { _id: '$batchId', n: { $sum: 1 } } },
    ]);
    countById = new Map(counts.map((c) => [String(c._id), c.n]));
  }

  const out = await Promise.all(
    list.map(async (b) => {
      const arena = await Arena.findById(b.arenaId).lean();
      return CoachingBatch.toPublic(b, {
        arenaName: arena?.name || '',
        enrolledCount: countById.get(String(b._id)) || 0,
      });
    })
  );

  return res.json({ batches: out });
}

async function assertCoachOwnsBatch(coachId, batchId) {
  if (!mongoose.isValidObjectId(batchId)) return null;
  const batch = await CoachingBatch.findById(batchId).lean();
  if (!batch || String(batch.coachId) !== String(coachId)) return null;
  return batch;
}

async function listBatchStudents(req, res) {
  const coachId = req.auth.sub;
  const { batchId } = req.params;
  const batch = await assertCoachOwnsBatch(coachId, batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  const enrollments = await BatchEnrollment.find({
    batchId: batch._id,
    status: { $in: ['confirmed', 'pending'] },
  }).lean();
  const userIds = enrollments.map((e) => e.userId);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const byId = new Map(users.map((u) => [u._id.toString(), u]));

  const students = enrollments.map((e) => {
    const u = byId.get(String(e.userId));
    return {
      enrollmentId: e._id.toString(),
      userId: String(e.userId),
      name: u?.name || '',
      email: u?.email || '',
      enrollmentStatus: e.status,
    };
  });
  return res.json({ students });
}

async function listCoachStudentsAll(req, res) {
  const coachId = req.auth.sub;
  const batches = await CoachingBatch.find({ coachId }).lean();
  const batchById = new Map(batches.map((b) => [b._id.toString(), b]));
  const batchIds = batches.map((b) => b._id);
  if (!batchIds.length) return res.json({ students: [] });

  const enrollments = await BatchEnrollment.find({
    batchId: { $in: batchIds },
    status: { $in: ['confirmed', 'pending'] },
  }).lean();
  const userIds = enrollments.map((e) => e.userId);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const byId = new Map(users.map((u) => [u._id.toString(), u]));

  const students = enrollments.map((e) => {
    const b = batchById.get(String(e.batchId));
    const u = byId.get(String(e.userId));
    return {
      id: String(e.userId),
      enrollmentId: e._id.toString(),
      userId: String(e.userId),
      name: u?.name || '',
      email: u?.email || '',
      batch: b?.title || '',
      batchId: String(e.batchId),
      level: '—',
      status: e.status === 'pending' ? 'Pending' : 'Active',
    };
  });
  return res.json({ students });
}

async function listBatchAttendance(req, res) {
  const coachId = req.auth.sub;
  const { batchId } = req.params;
  const batch = await assertCoachOwnsBatch(coachId, batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  const from = (req.query.from || '').trim();
  const to = (req.query.to || '').trim();
  const q = { batchId: batch._id };
  if (from && to) q.sessionDate = { $gte: from, $lte: to };
  const rows = await CoachingAttendance.find(q).sort({ sessionDate: -1 }).lean();
  return res.json({ attendance: rows.map((r) => CoachingAttendance.toPublic(r)) });
}

async function upsertBatchAttendance(req, res) {
  const coachId = req.auth.sub;
  const { batchId } = req.params;
  const batch = await assertCoachOwnsBatch(coachId, batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  const { sessionDate, records } = req.body;
  if (!sessionDate || !/^\d{4}-\d{2}-\d{2}$/.test(String(sessionDate))) {
    return res.status(400).json({ error: 'sessionDate (YYYY-MM-DD) is required' });
  }
  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'records must be an array' });
  }

  const enrolled = await BatchEnrollment.find({
    batchId: batch._id,
    status: { $in: ['confirmed', 'pending'] },
  }).distinct('userId');
  const enrolledSet = new Set(enrolled.map((id) => String(id)));
  const cleaned = [];
  for (const r of records) {
    const uid = r.userId;
    if (!uid || !mongoose.isValidObjectId(uid) || !enrolledSet.has(String(uid))) continue;
    const st = ['present', 'absent', 'late', 'excused'].includes(r.status) ? r.status : 'present';
    cleaned.push({ userId: uid, status: st });
  }

  const doc = await CoachingAttendance.findOneAndUpdate(
    { batchId: batch._id, sessionDate: String(sessionDate) },
    { $set: { records: cleaned } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return res.json({ attendance: CoachingAttendance.toPublic(doc) });
}

async function listCoachAttendanceHistory(req, res) {
  const coachId = req.auth.sub;
  const batches = await CoachingBatch.find({ coachId }).lean();
  const batchIds = batches.map((b) => b._id);
  const titleById = new Map(batches.map((b) => [b._id.toString(), b.title]));
  if (!batchIds.length) return res.json({ sessions: [] });

  const from = (req.query.from || '').trim();
  const to = (req.query.to || '').trim();
  const q = { batchId: { $in: batchIds } };
  if (from && to) q.sessionDate = { $gte: from, $lte: to };
  const rows = await CoachingAttendance.find(q).sort({ sessionDate: -1 }).lean();
  const sessions = rows.map((row) => {
    const recs = row.records || [];
    const present = recs.filter((r) => r.status === 'present' || r.status === 'late').length;
    const absent = recs.filter((r) => r.status === 'absent' || r.status === 'excused').length;
    return {
      id: row._id.toString(),
      sessionDate: row.sessionDate,
      batchId: String(row.batchId),
      batch: titleById.get(String(row.batchId)) || '',
      present,
      absent,
      status: 'Logged',
    };
  });
  return res.json({ sessions });
}

module.exports = {
  listCoachBatches,
  listBatchStudents,
  listCoachStudentsAll,
  listBatchAttendance,
  upsertBatchAttendance,
  listCoachAttendanceHistory,
};
