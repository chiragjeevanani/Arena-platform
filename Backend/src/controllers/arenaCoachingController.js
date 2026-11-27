/**
 * Arena Panel → Coaching Batches: the arena admin (or Super Admin for the active arena) sees the
 * coaching batches at their arena, marks student attendance, adds students, and gives students an
 * app login (email + password) so they can sign in to the customer app.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const CoachingBatch = require('../models/CoachingBatch');
const CoachingAttendance = require('../models/CoachingAttendance');
const BatchEnrollment = require('../models/BatchEnrollment');
const User = require('../models/User');
const { arenaTodayYmd } = require('../services/slotAvailability');
const fees = require('../services/coachingFees');
const { createNotification } = require('../services/notificationService');

const YMD = /^\d{4}-\d{2}-\d{2}$/;
const STATUSES = ['present', 'absent', 'late', 'excused'];
const ACTIVE = ['confirmed', 'pending'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLACEHOLDER_EMAIL = /@offline\.ammarena\.invalid$/i;

const nameOf = (u) => (u ? u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || '' : '');
/** True when the student can sign in to the app (a real email, not the desk placeholder). */
const hasLogin = (u) => !!u?.email && !PLACEHOLDER_EMAIL.test(u.email);

async function batchInScope(req, batchId) {
  if (!mongoose.isValidObjectId(batchId)) return null;
  const batch = await CoachingBatch.findById(batchId).populate('coachId', 'name firstName lastName email').lean();
  if (!batch || String(batch.arenaId) !== String(req.arenaScopeId)) return null;
  return batch;
}

function batchPublic(b, studentCount) {
  const today = arenaTodayYmd();
  return {
    id: String(b._id),
    title: b.title,
    coachName: nameOf(b.coachId) || '—',
    schedule: b.schedule || '',
    scheduleTime: b.scheduleTime || '',
    level: b.level || '',
    capacity: b.capacity || 0,
    studentCount,
    startDate: b.startDate || '',
    endDate: b.endDate || '',
    status: b.endDate && b.endDate < today ? 'ended' : b.startDate && b.startDate > today ? 'upcoming' : 'running',
  };
}

/** GET /arena-admin/coaching-batches?status=current|ended|all */
async function listArenaBatches(req, res) {
  const today = arenaTodayYmd();
  const status = String(req.query.status || 'current');
  const q = { arenaId: req.arenaScopeId };
  if (status === 'current') q.$or = [{ endDate: { $gte: today } }, { endDate: null }, { endDate: '' }];
  if (status === 'ended') q.endDate = { $lt: today };
  const batches = await CoachingBatch.find(q).sort({ startDate: -1, createdAt: -1 }).populate('coachId', 'name firstName lastName email').lean();
  const counts = await BatchEnrollment.aggregate([
    { $match: { batchId: { $in: batches.map((b) => b._id) }, status: { $in: ACTIVE } } },
    { $group: { _id: '$batchId', n: { $sum: 1 } } },
  ]);
  const countById = new Map(counts.map((c) => [String(c._id), c.n]));
  return res.json({ batches: batches.map((b) => batchPublic(b, countById.get(String(b._id)) || 0)) });
}

/** GET /arena-admin/coaching-batches/:batchId/students */
async function listArenaBatchStudents(req, res) {
  const batch = await batchInScope(req, req.params.batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });
  const enrollments = await BatchEnrollment.find({ batchId: batch._id, status: { $in: ACTIVE } }).lean();
  const users = await User.find({ _id: { $in: enrollments.map((e) => e.userId) } }).select('name firstName lastName email phone').lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));
  // attendance % over the sessions recorded for this batch
  const sessions = await CoachingAttendance.find({ batchId: batch._id }).select('records').lean();
  const students = enrollments.map((e) => {
    const u = byId.get(String(e.userId));
    const marks = sessions.map((s) => (s.records || []).find((r) => String(r.userId) === String(e.userId))).filter(Boolean);
    const present = marks.filter((r) => r.status === 'present' || r.status === 'late').length;
    return {
      userId: String(e.userId),
      enrollmentId: String(e._id),
      name: nameOf(u) || 'Student',
      phone: u?.phone || '',
      email: hasLogin(u) ? u.email : '',
      hasLogin: hasLogin(u),
      enrollmentType: e.enrollmentType || 'online',
      enrollmentStatus: e.status,
      sessions: marks.length,
      attendancePercent: marks.length ? Math.round((present / marks.length) * 100) : null,
      fee: e.status === 'confirmed' ? fees.feeStatus(e, batch) : null,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
  return res.json({ batch: batchPublic(batch, students.length), students });
}

/** GET /arena-admin/coaching-batches/:batchId/attendance?date=YYYY-MM-DD — the register for that day, if any. */
async function getArenaBatchAttendance(req, res) {
  const batch = await batchInScope(req, req.params.batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });
  const date = String(req.query.date || '');
  if (!YMD.test(date)) return res.status(400).json({ error: 'date (YYYY-MM-DD) is required' });
  const s = await CoachingAttendance.findOne({ batchId: batch._id, sessionDate: date }).lean();
  if (!s) return res.json({ session: null });
  const who = s.markedBy ? await User.findById(s.markedBy).select('name firstName lastName email role').lean() : null;
  return res.json({
    session: {
      id: String(s._id),
      sessionDate: s.sessionDate,
      records: (s.records || []).map((r) => ({ userId: String(r.userId), status: r.status })),
      markedBy: who ? { name: nameOf(who), role: who.role } : null,
      markedAt: s.markedAt || s.updatedAt,
      verifiedAt: s.verifiedAt || null,
    },
  });
}

/**
 * PUT /arena-admin/coaching-batches/:batchId/attendance { sessionDate, records: [{ userId, status }] }
 * The arena takes the register itself. It counts as checked (verified) because the arena marked it.
 */
async function saveArenaBatchAttendance(req, res) {
  const batch = await batchInScope(req, req.params.batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });
  const { sessionDate, records } = req.body || {};
  if (!YMD.test(String(sessionDate || ''))) return res.status(400).json({ error: 'Choose the class date' });
  if (sessionDate > arenaTodayYmd()) return res.status(400).json({ error: "You can't mark attendance for a future date" });
  if (!Array.isArray(records) || !records.length) return res.status(400).json({ error: 'Mark at least one student' });
  const enrolled = new Set((await BatchEnrollment.find({ batchId: batch._id, status: { $in: ACTIVE } }).distinct('userId')).map(String));
  const cleaned = [];
  for (const r of records) {
    const uid = String(r?.userId || '');
    if (!enrolled.has(uid) || !STATUSES.includes(r.status) || cleaned.some((c) => String(c.userId) === uid)) continue;
    cleaned.push({ userId: uid, status: r.status });
  }
  if (!cleaned.length) return res.status(400).json({ error: 'None of these students are in this batch' });
  const now = new Date();
  const doc = await CoachingAttendance.findOneAndUpdate(
    { batchId: batch._id, sessionDate: String(sessionDate) },
    { $set: { records: cleaned, markedBy: req.auth.sub, markedAt: now, verifiedBy: req.auth.sub, verifiedAt: now, correctedBy: null, correctedAt: null } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return res.json({ session: CoachingAttendance.toPublic(doc) });
}

function validateLogin(email, password) {
  if (!EMAIL_RE.test(email)) return 'Enter a valid email for the app login';
  if (PLACEHOLDER_EMAIL.test(email)) return 'Enter a real email address';
  if (String(password || '').length < 8) return 'Password must be at least 8 characters';
  return null;
}

/**
 * POST /arena-admin/coaching-batches/:batchId/students
 *   { userId }                                   — add an existing customer
 *   { name, phone, email?, password? }           — new student; with email + password they get an app login
 */
async function addArenaBatchStudent(req, res) {
  const batch = await batchInScope(req, req.params.batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });
  const b = req.body || {};
  let user = null;
  let createdLogin = false;

  if (b.userId) {
    if (!mongoose.isValidObjectId(b.userId)) return res.status(400).json({ error: 'Invalid customer' });
    user = await User.findById(b.userId);
    if (!user || user.isActive === false) return res.status(404).json({ error: 'Customer not found' });
    if (user.role !== 'CUSTOMER') return res.status(409).json({ error: 'This is a staff account, not a student' });
  } else {
    const name = String(b.name || '').trim();
    const phone = String(b.phone || '').trim();
    const email = String(b.email || '').trim().toLowerCase();
    const password = String(b.password || '');
    if (name.length < 2) return res.status(400).json({ error: "Enter the student's name" });
    if (phone.replace(/\D/g, '').length < 8) return res.status(400).json({ error: 'Enter a phone number (at least 8 digits)' });
    if (password && !email) return res.status(400).json({ error: 'An app login needs an email address' });
    if (email && !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Email address is not valid' });
    if (password) { const e = validateLogin(email, password); if (e) return res.status(400).json({ error: e }); }

    user = (email && await User.findOne({ email })) || await User.findOne({ phone });
    if (user && user.role !== 'CUSTOMER') return res.status(409).json({ error: 'This phone/email belongs to a staff account, not a student' });
    if (user && password && hasLogin(user)) {
      // Never overwrite the password of someone who already signs in to the app.
      return res.status(409).json({ error: `${nameOf(user)} already has an app login (${user.email}). Add them without a password — they keep their own.` });
    }
    if (!user) {
      user = await User.create({
        name,
        phone,
        email: email || `offline-${phone.replace(/\D/g, '')}-${Date.now()}@offline.ammarena.invalid`,
        passwordHash: await bcrypt.hash(password || crypto.randomBytes(24).toString('hex'), 10),
        role: 'CUSTOMER',
        isEmailVerified: !!(email && password),
      });
      createdLogin = !!(email && password);
    } else if (password) {
      // existing desk student without a login: give them one now
      if (await User.findOne({ email, _id: { $ne: user._id } })) return res.status(409).json({ error: 'That email is already used by another account' });
      user.email = email;
      user.passwordHash = await bcrypt.hash(password, 10);
      user.isEmailVerified = true;
      await user.save();
      createdLogin = true;
    }
  }

  const active = await BatchEnrollment.findOne({ batchId: batch._id, userId: user._id, status: { $in: ACTIVE } });
  if (active) return res.status(409).json({ error: `${nameOf(user)} is already in this batch` });
  const taken = await BatchEnrollment.countDocuments({ batchId: batch._id, status: { $in: ACTIVE } });
  if (batch.capacity && taken >= batch.capacity) return res.status(400).json({ error: `Batch is full (${batch.capacity} students)` });
  const enrollment = await BatchEnrollment.create({ batchId: batch._id, userId: user._id, status: 'confirmed', enrollmentType: 'offline' });
  return res.status(201).json({
    student: { userId: String(user._id), name: nameOf(user), phone: user.phone || '', email: hasLogin(user) ? user.email : '', hasLogin: hasLogin(user), enrollmentId: String(enrollment._id) },
    createdLogin,
  });
}

/**
 * POST /arena-admin/students/:userId/login { email, password }
 * Give a desk-added student (no login yet) an app login. Only for students of a batch at this arena,
 * and never for someone who already has a login (they reset their own password).
 */
async function createStudentLogin(req, res) {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ error: 'Invalid student' });
  const user = await User.findById(userId);
  if (!user || user.role !== 'CUSTOMER') return res.status(404).json({ error: 'Student not found' });
  const arenaBatchIds = await CoachingBatch.find({ arenaId: req.arenaScopeId }).distinct('_id');
  const inArena = await BatchEnrollment.exists({ userId: user._id, batchId: { $in: arenaBatchIds } });
  if (!inArena) return res.status(403).json({ error: 'This student is not in a batch at your arena' });
  if (hasLogin(user)) return res.status(409).json({ error: `${nameOf(user)} already has an app login (${user.email}). They can use "Forgot password" on the login page.` });
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const err = validateLogin(email, password);
  if (err) return res.status(400).json({ error: err });
  if (await User.findOne({ email, _id: { $ne: user._id } })) return res.status(409).json({ error: 'That email is already used by another account' });
  user.email = email;
  user.passwordHash = await bcrypt.hash(password, 10);
  user.isEmailVerified = true;
  await user.save();
  return res.json({ student: { userId: String(user._id), name: nameOf(user), email: user.email, hasLogin: true } });
}

/**
 * GET /arena-admin/coaching/fees?show=due|all
 * Students of running batches at this arena with their fee status; "due" = overdue, due soon or not recorded.
 */
async function listArenaFees(req, res) {
  const today = arenaTodayYmd();
  const batches = await CoachingBatch.find({ arenaId: req.arenaScopeId, endDate: { $gte: today } }).populate('coachId', 'name firstName lastName email').lean();
  const batchById = new Map(batches.map((b) => [String(b._id), b]));
  const list = await BatchEnrollment.find({ batchId: { $in: batches.map((b) => b._id) }, status: 'confirmed' }).lean();
  const users = await User.find({ _id: { $in: list.map((e) => e.userId) } }).select('name firstName lastName email phone').lean();
  const userById = new Map(users.map((u) => [String(u._id), u]));
  const order = { overdue: 0, due_soon: 1, not_recorded: 2, paid: 3, covered: 4, ended: 5 };
  let rows = list.map((e) => {
    const b = batchById.get(String(e.batchId));
    const u = userById.get(String(e.userId));
    return {
      enrollmentId: String(e._id), userId: String(e.userId), name: nameOf(u) || 'Student', phone: u?.phone || '', hasLogin: hasLogin(u),
      batchId: String(b._id), batchTitle: b.title, coachName: nameOf(b.coachId) || '—', enrollmentType: e.enrollmentType || 'online',
      fee: fees.feeStatus(e, b, today),
    };
  });
  if (String(req.query.show || 'due') === 'due') rows = rows.filter((r) => ['overdue', 'due_soon', 'not_recorded'].includes(r.fee.state));
  rows.sort((a, b) => (order[a.fee.state] - order[b.fee.state]) || ((b.fee.daysOverdue || 0) - (a.fee.daysOverdue || 0)) || a.name.localeCompare(b.name));
  const all = list.map((e) => fees.feeStatus(e, batchById.get(String(e.batchId)), today).state);
  return res.json({
    students: rows,
    summary: { overdue: all.filter((s) => s === 'overdue').length, dueSoon: all.filter((s) => s === 'due_soon').length, notRecorded: all.filter((s) => s === 'not_recorded').length },
  });
}

/**
 * POST /arena-admin/coaching/enrollments/:enrollmentId/fee { months?, method: cash|card|waived, amount? }
 * The desk records a monthly fee payment; "paid until" moves forward and the student is notified.
 */
async function recordArenaFee(req, res) {
  const { enrollmentId } = req.params;
  if (!mongoose.isValidObjectId(enrollmentId)) return res.status(400).json({ error: 'Invalid enrolment' });
  const e = await BatchEnrollment.findById(enrollmentId);
  if (!e || e.status !== 'confirmed') return res.status(404).json({ error: 'Enrolment not found' });
  const batch = await batchInScope(req, e.batchId);
  if (!batch) return res.status(404).json({ error: 'Enrolment not found' });
  const method = String(req.body?.method || 'cash');
  if (!['cash', 'card', 'waived'].includes(method)) return res.status(400).json({ error: 'Payment method must be cash, card or waived' });
  const paid = await fees.recordFeePayment(e, batch, { months: req.body?.months, amount: req.body?.amount, method, recordedBy: req.auth.sub });
  try {
    await createNotification(e.userId, 'Coaching fee received', `Thank you — your ${batch.title} fee is paid until ${paid.to}${paid.amount ? ` (OMR ${paid.amount.toFixed(3)}, ${method})` : ''}.`, 'success', { kind: 'coaching_fee_paid', enrollmentId: String(e._id) });
  } catch (err) { /* notification is a courtesy */ }
  return res.json({ paid, fee: fees.feeStatus(e, batch) });
}

module.exports = {
  listArenaFees,
  recordArenaFee,
  listArenaBatches,
  listArenaBatchStudents,
  getArenaBatchAttendance,
  saveArenaBatchAttendance,
  addArenaBatchStudent,
  createStudentLogin,
};
