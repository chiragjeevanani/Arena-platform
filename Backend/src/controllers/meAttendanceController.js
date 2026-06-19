const BatchEnrollment = require('../models/BatchEnrollment');
const CoachingAttendance = require('../models/CoachingAttendance');
const CoachingBatch = require('../models/CoachingBatch');

async function listMyAttendance(req, res) {
  const userId = req.auth.sub;
  const month = (req.query.month || '').trim();

  const list = await BatchEnrollment.find({
    userId,
    status: { $in: ['confirmed', 'pending'] },
  }).lean();
  const batchIds = list.map((e) => e.batchId);
  if (!batchIds.length) {
    return res.json({ sessions: [] });
  }

  const q = { batchId: { $in: batchIds } };
  if (/^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number);
    const pad = (n) => String(n).padStart(2, '0');
    const start = `${y}-${pad(m)}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const end = `${y}-${pad(m)}-${pad(lastDay)}`;
    q.sessionDate = { $gte: start, $lte: end };
  }

  const enrollmentMap = new Map(list.map((e) => [e.batchId.toString(), e]));
  const sessions = await CoachingAttendance.find(q).sort({ sessionDate: -1 }).lean();
  const batches = await CoachingBatch.find({ _id: { $in: sessions.map((s) => s.batchId) } }).lean();
  const batchMap = new Map(batches.map((b) => [b._id.toString(), b]));
 
  const out = [];
  for (const s of sessions) {
    const e = enrollmentMap.get(String(s.batchId));
    if (!e) continue;
    
    const enrollYmd = new Date(e.createdAt).toISOString().slice(0, 10);
    if (s.sessionDate < enrollYmd) {
      continue;
    }
    
    const me = (s.records || []).find((r) => String(r.userId) === String(userId));
    const b = batchMap.get(String(s.batchId));
    out.push({
      sessionDate: s.sessionDate,
      batchId: String(s.batchId),
      batchTitle: b?.title || '',
      status: me?.status || 'present',
    });
  }
  return res.json({ sessions: out });
}

module.exports = { listMyAttendance };
