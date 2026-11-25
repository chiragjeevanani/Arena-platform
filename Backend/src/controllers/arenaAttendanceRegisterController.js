const mongoose = require('mongoose');
const CoachingBatch = require('../models/CoachingBatch');
const CoachingAttendance = require('../models/CoachingAttendance');
const BatchEnrollment = require('../models/BatchEnrollment');
const User = require('../models/User');

const YMD = /^\d{4}-\d{2}-\d{2}$/;
const STATUSES = ['present', 'absent', 'late', 'excused'];

function nameOf(u) {
  if (!u) return '';
  return u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || '';
}

/**
 * GET /arena-admin/attendance-register?batchId=&from=YYYY-MM-DD&to=YYYY-MM-DD&status=unverified|verified
 * Coaching sessions recorded by coaches at this arena, newest first, with each student's mark
 * and the arena's verification. Super Admin uses the same endpoint (arena via X-Arena-Id).
 */
async function listAttendanceRegister(req, res) {
  const { batchId, from, to, status } = req.query;
  if (batchId && !mongoose.isValidObjectId(batchId)) return res.status(400).json({ error: 'Invalid batchId' });
  const batches = await CoachingBatch.find({ arenaId: req.arenaScopeId }).sort({ createdAt: -1 }).populate('coachId', 'name firstName lastName email').lean();
  const scoped = batchId ? batches.filter((b) => String(b._id) === String(batchId)) : batches;

  const q = { batchId: { $in: scoped.map((b) => b._id) } };
  if ((from && !YMD.test(from)) || (to && !YMD.test(to))) return res.status(400).json({ error: 'Dates must be YYYY-MM-DD' });
  if (from || to) q.sessionDate = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
  if (status === 'unverified') q.verifiedAt = null;
  if (status === 'verified') q.verifiedAt = { $ne: null };

  const sessions = await CoachingAttendance.find(q).sort({ sessionDate: -1, updatedAt: -1 }).limit(300).lean();

  const userIds = new Set();
  for (const s of sessions) {
    for (const r of s.records || []) userIds.add(String(r.userId));
    for (const k of ['markedBy', 'verifiedBy', 'correctedBy']) if (s[k]) userIds.add(String(s[k]));
  }
  const users = await User.find({ _id: { $in: [...userIds] } }).select('name firstName lastName email phone').lean();
  const userById = new Map(users.map((u) => [String(u._id), u]));
  const batchById = new Map(batches.map((b) => [String(b._id), b]));

  const out = sessions.map((s) => {
    const b = batchById.get(String(s.batchId));
    const records = (s.records || []).map((r) => {
      const u = userById.get(String(r.userId));
      return { userId: String(r.userId), name: nameOf(u) || 'Student', phone: u?.phone || '', status: r.status };
    }).sort((x, y) => x.name.localeCompare(y.name));
    const who = (id) => (id ? { id: String(id), name: nameOf(userById.get(String(id))) || 'Staff' } : null);
    return {
      id: String(s._id),
      batchId: String(s.batchId),
      batchTitle: b?.title || 'Batch',
      schedule: b ? `${b.schedule || ''} ${b.scheduleTime || ''}`.trim() : '',
      coachName: nameOf(b?.coachId) || '—',
      sessionDate: s.sessionDate,
      records,
      presentCount: records.filter((r) => r.status === 'present' || r.status === 'late').length,
      absentCount: records.filter((r) => r.status === 'absent').length,
      markedBy: who(s.markedBy),
      markedAt: s.markedAt || s.updatedAt,
      verifiedBy: who(s.verifiedBy),
      verifiedAt: s.verifiedAt || null,
      correctedBy: who(s.correctedBy),
      correctedAt: s.correctedAt || null,
    };
  });

  return res.json({
    batches: batches.map((b) => ({ id: String(b._id), title: b.title, coachName: nameOf(b.coachId) || '—', endDate: b.endDate })),
    sessions: out,
    summary: {
      sessions: out.length,
      unverified: out.filter((s) => !s.verifiedAt).length,
      marks: out.reduce((n, s) => n + s.records.length, 0),
      present: out.reduce((n, s) => n + s.presentCount, 0),
    },
  });
}

/**
 * PATCH /arena-admin/attendance-register/:sessionId  { verified?: boolean, records?: [{ userId, status }] }
 * Verify (or un-verify) a coach's register, and optionally correct individual marks.
 */
async function updateAttendanceSession(req, res) {
  const { sessionId } = req.params;
  if (!mongoose.isValidObjectId(sessionId)) return res.status(400).json({ error: 'Invalid session id' });
  const doc = await CoachingAttendance.findById(sessionId);
  if (!doc) return res.status(404).json({ error: 'Session not found' });
  const batch = await CoachingBatch.findById(doc.batchId).select('arenaId').lean();
  if (!batch || String(batch.arenaId) !== String(req.arenaScopeId)) return res.status(403).json({ error: 'Forbidden' });

  const { verified, records } = req.body || {};
  if (Array.isArray(records) && records.length) {
    const enrolled = new Set((await BatchEnrollment.find({ batchId: doc.batchId }).distinct('userId')).map(String));
    let changed = 0;
    for (const r of records) {
      if (!r || !STATUSES.includes(r.status)) continue;
      const uid = String(r.userId || '');
      const existing = doc.records.find((x) => String(x.userId) === uid);
      if (existing) { if (existing.status !== r.status) { existing.status = r.status; changed++; } }
      else if (enrolled.has(uid)) { doc.records.push({ userId: uid, status: r.status }); changed++; }
    }
    if (changed) { doc.correctedBy = req.auth.sub; doc.correctedAt = new Date(); }
  }
  if (verified === true) { doc.verifiedBy = req.auth.sub; doc.verifiedAt = new Date(); }
  if (verified === false) { doc.verifiedBy = null; doc.verifiedAt = null; }
  await doc.save();
  return res.json({ session: CoachingAttendance.toPublic(doc) });
}

module.exports = { listAttendanceRegister, updateAttendanceSession };
