const mongoose = require('mongoose');
const CoachingBatch = require('../models/CoachingBatch');
const Arena = require('../models/Arena');
const BatchEnrollment = require('../models/BatchEnrollment');
const User = require('../models/User');
const CoachingAttendance = require('../models/CoachingAttendance');

function resolveCoachId(req) {
  let coachId = req.auth.sub;
  if (req.auth.role === 'SUPER_ADMIN') {
    const headerCoachId = req.headers['x-coach-id'];
    const queryCoachId = req.query.coachId;
    const bodyCoachId = req.body.coachId;
    coachId = headerCoachId || queryCoachId || bodyCoachId || coachId;
  }
  return coachId;
}

async function listCoachBatches(req, res) {
  const coachId = resolveCoachId(req);
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

async function assertCoachOwnsBatch(coachId, batchId, userRole = '') {
  if (!mongoose.isValidObjectId(batchId)) return null;
  const batch = await CoachingBatch.findById(batchId).lean();
  if (!batch) return null;
  if (userRole !== 'SUPER_ADMIN' && String(batch.coachId) !== String(coachId)) return null;
  return batch;
}

async function listBatchStudents(req, res) {
  const coachId = resolveCoachId(req);
  const { batchId } = req.params;
  const batch = await assertCoachOwnsBatch(coachId, batchId, req.auth?.role);
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
  const coachId = resolveCoachId(req);
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
      studentId: String(e.userId),
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
  const coachId = resolveCoachId(req);
  const { batchId } = req.params;
  const batch = await assertCoachOwnsBatch(coachId, batchId, req.auth?.role);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  const from = (req.query.from || '').trim();
  const to = (req.query.to || '').trim();
  const q = { batchId: batch._id };
  if (from && to) q.sessionDate = { $gte: from, $lte: to };
  const rows = await CoachingAttendance.find(q).sort({ sessionDate: -1 }).lean();
  return res.json({ attendance: rows.map((r) => CoachingAttendance.toPublic(r)) });
}

async function upsertBatchAttendance(req, res) {
  const coachId = resolveCoachId(req);
  const { batchId } = req.params;
  const batch = await assertCoachOwnsBatch(coachId, batchId, req.auth?.role);
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
  const coachId = resolveCoachId(req);
  const batches = await CoachingBatch.find({ coachId }).lean();
  const batchIds = batches.map((b) => b._id);
  const titleById = new Map(batches.map((b) => [b._id.toString(), b.title]));
  if (!batchIds.length) return res.json({ sessions: [] });

  const from = (req.query.from || '').trim();
  const to = (req.query.to || '').trim();
  const q = { batchId: { $in: batchIds } };
  if (from && to) q.sessionDate = { $gte: from, $lte: to };
  const rows = await CoachingAttendance.find(q).sort({ sessionDate: -1 }).lean();

  const studentIds = [...new Set(rows.flatMap((row) => (row.records || []).map((r) => String(r.userId))))];
  const students = studentIds.length ? await User.find({ _id: { $in: studentIds } }).lean() : [];
  const nameById = new Map(students.map((s) => [String(s._id), s.name || 'Student']));

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
      // Real per-student attendance so the coach UI never has to fabricate names.
      records: recs.map((r) => ({
        userId: String(r.userId),
        name: nameById.get(String(r.userId)) || 'Student',
        status: r.status,
      })),
    };
  });
  return res.json({ sessions });
}

async function getStudentAttendance(req, res) {
  const { studentId } = req.params;
  if (!mongoose.isValidObjectId(studentId)) {
    return res.status(400).json({ error: 'Invalid student ID' });
  }

  const user = await User.findById(studentId).lean();
  const enrollments = await BatchEnrollment.find({
    userId: studentId,
    status: { $in: ['confirmed', 'pending'] },
  }).lean();
  const batchIds = enrollments.map((e) => e.batchId);

  const batches = await CoachingBatch.find({ _id: { $in: batchIds } }).lean();
  const batchById = new Map(batches.map((b) => [b._id.toString(), b]));

  const coachIds = batches.map((b) => b.coachId).filter(Boolean);
  const coaches = await User.find({ _id: { $in: coachIds } }).lean();
  const coachById = new Map(coaches.map((c) => [c._id.toString(), c.name || 'Head Coach']));

  const primaryBatch = batches[0];
  const studentMeta = {
    id: String(studentId),
    name: user?.name || 'Student',
    email: user?.email || '',
    batch: primaryBatch?.title || '—',
    status: enrollments[0]?.status === 'pending' ? 'Pending' : 'Active',
  };

  if (!batchIds.length) {
    return res.json({
      student: studentMeta,
      summary: { total: 0, present: 0, absent: 0, late: 0, percentage: 0, streak: 0 },
      sessions: [],
    });
  }

  const attendanceRows = await CoachingAttendance.find({
    batchId: { $in: batchIds },
  }).sort({ sessionDate: -1 }).lean();

  const sessions = [];
  let present = 0;
  let absent = 0;
  let late = 0;

  for (const row of attendanceRows) {
    const rec = (row.records || []).find((r) => String(r.userId) === String(studentId));
    if (rec) {
      if (rec.status === 'present') present++;
      else if (rec.status === 'absent') absent++;
      else if (rec.status === 'late') late++;

      const b = batchById.get(String(row.batchId));
      const coachName = b ? (coachById.get(String(b.coachId)) || 'Head Coach') : 'Head Coach';

      sessions.push({
        sessionId: row._id.toString(),
        date: row.sessionDate,
        startTime: b?.startTime || '07:30 AM',
        endTime: b?.endTime || '08:30 AM',
        batchName: b?.title || '—',
        coachName: coachName,
        status: rec.status,
      });
    }
  }

  const total = present + absent + late;
  const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  let streak = 0;
  for (const s of sessions) {
    if (s.status === 'present' || s.status === 'late') streak++;
    else break;
  }

  return res.json({
    student: studentMeta,
    summary: { total, present, absent, late, percentage, streak },
    sessions,
  });
}

async function removeStudentFromBatch(req, res) {
  const coachId = resolveCoachId(req);
  const { batchId, studentId } = req.params;

  const batch = await assertCoachOwnsBatch(coachId, batchId, req.auth?.role);
  if (!batch) {
    return res.status(404).json({ error: 'Batch not found or permission denied' });
  }

  const enrollment = await BatchEnrollment.findOne({
    batchId: batch._id,
    userId: studentId,
    status: { $in: ['confirmed', 'pending'] },
  });

  if (!enrollment) {
    return res.status(404).json({ error: 'Active enrollment not found for student in this batch' });
  }

  const { reason, notes } = req.body || {};
  if (!reason || !String(reason).trim()) {
    return res.status(400).json({ error: 'Removal reason is required' });
  }

  enrollment.status = 'removed';
  enrollment.removedBy = coachId;
  enrollment.removedAt = new Date();
  enrollment.removalReason = String(reason).trim();
  enrollment.removalNotes = String(notes || '').trim();
  await enrollment.save();

  if (batch.enrolledCount > 0) {
    await CoachingBatch.findByIdAndUpdate(batch._id, { $inc: { enrolledCount: -1 } });
  }

  return res.json({
    success: true,
    message: 'Student successfully removed from batch',
    enrollment: BatchEnrollment.toPublic(enrollment),
  });
}

module.exports = {
  listCoachBatches,
  listBatchStudents,
  listCoachStudentsAll,
  listBatchAttendance,
  upsertBatchAttendance,
  listCoachAttendanceHistory,
  getStudentAttendance,
  removeStudentFromBatch,
};


