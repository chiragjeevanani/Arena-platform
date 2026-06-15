const mongoose = require('mongoose');
const CoachingBatch = require('../models/CoachingBatch');
const Arena = require('../models/Arena');
const User = require('../models/User');
const BatchEnrollment = require('../models/BatchEnrollment');
const CoachStudentProgress = require('../models/CoachStudentProgress');
const CoachingAttendance = require('../models/CoachingAttendance');

/**
 * Checks if a coach has schedule conflicts with other batches.
 * Returns an array of conflicting batches (soft warning — does NOT block save).
 *
 * Conflict = same coach + overlapping date range + at least one overlapping week day.
 */
async function checkCoachConflict(coachId, schedule, startDate, endDate, excludeBatchId = null) {
  const query = {
    coachId,
    startDate: { $lte: endDate },
    endDate:   { $gte: startDate },
  };
  if (excludeBatchId) query._id = { $ne: excludeBatchId };

  const candidates = await CoachingBatch.find(query).lean();

  const newDays = (schedule || '').split('-').filter(Boolean);
  if (newDays.length === 0) return []; // No schedule days set — no conflict possible

  return candidates.filter((b) => {
    const existingDays = (b.schedule || '').split('-').filter(Boolean);
    return newDays.some((d) => existingDays.includes(d));
  });
}

/**
 * Build a human-readable conflict warning string from the first conflicting batch.
 */
function buildConflictWarning(conflicts) {
  if (!conflicts.length) return null;
  const c = conflicts[0];
  return `Coach is already scheduled for "${c.title}" (${c.schedule || 'N/A'}, ${c.startDate} – ${c.endDate})`;
}

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

  // Soft conflict check — does not block save, but informs the admin via a warning
  const conflicts = await checkCoachConflict(
    coachId,
    schedule != null ? String(schedule) : '',
    String(startDate).trim(),
    String(endDate).trim()
  );
  const conflictWarning = buildConflictWarning(conflicts);

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

  return res.status(201).json({ batch: CoachingBatch.toPublic(batch), conflictWarning });
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

  // Soft conflict check — runs after save so we use the final values on the doc
  const updateConflicts = await checkCoachConflict(
    String(batch.coachId),
    batch.schedule,
    batch.startDate,
    batch.endDate,
    batch._id
  );
  const conflictWarning = buildConflictWarning(updateConflicts);

  return res.json({ batch: CoachingBatch.toPublic(batch), conflictWarning });
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

async function listBatchStudentsWithProgress(req, res) {
  const { batchId } = req.params;
  if (!batchId || !mongoose.isValidObjectId(batchId)) {
    return res.status(400).json({ error: 'Invalid batchId' });
  }

  const enrollments = await BatchEnrollment.find({
    batchId,
    status: { $in: ['confirmed', 'pending'] },
  }).populate('userId').lean();

  const userIds = enrollments.map(e => e.userId?._id).filter(Boolean);
  
  const [progressRecords, attendanceRecords] = await Promise.all([
    CoachStudentProgress.find({ batchId, studentUserId: { $in: userIds } }).lean(),
    CoachingAttendance.find({ batchId }).lean()
  ]);

  const progressMap = new Map(progressRecords.map(p => [p.studentUserId.toString(), p]));
  
  // Calculate attendance % per student
  const attendanceStats = new Map();
  attendanceRecords.forEach(record => {
    (record.students || []).forEach(s => {
      const sid = s.userId.toString();
      if (!attendanceStats.has(sid)) {
        attendanceStats.set(sid, { present: 0, total: 0 });
      }
      const stats = attendanceStats.get(sid);
      stats.total += 1;
      if (s.status === 'present') stats.present += 1;
    });
  });

  const students = enrollments.map(e => {
    const user = e.userId;
    if (!user) return null;
    const progress = progressMap.get(user._id.toString());
    const stats = attendanceStats.get(user._id.toString()) || { present: 0, total: 0 };
    
    // Calculate average score from metrics
    const metrics = progress?.metrics || [];
    const avgScore = metrics.length > 0 
      ? (metrics.reduce((acc, m) => acc + (m.score || 0), 0) / metrics.length).toFixed(1)
      : '0.0';

    return {
      id: user._id.toString(),
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Unknown',
      email: user.email,
      phone: user.phone,
      enrollmentStatus: e.status,
      enrollmentType: e.enrollmentType,
      attendancePercentage: stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : '0.0',
      performanceScore: avgScore,
      lastProgressUpdate: progress?.updatedAt || null,
      metrics: progress?.metrics || []
    };
  }).filter(Boolean);

  return res.json({ students });
}

async function enrollOfflineStudent(req, res) {
  const { batchId } = req.params;
  const { firstName, lastName, email, phone } = req.body;

  if (!batchId || !mongoose.isValidObjectId(batchId)) {
    return res.status(400).json({ error: 'Invalid batchId' });
  }

  if (!firstName || !phone) {
    return res.status(400).json({ error: 'First name and phone number are required for offline enrollment' });
  }

  const batch = await CoachingBatch.findById(batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  // 1. Find or create user
  // Let's try finding the user by phone first
  let user = await User.findOne({ phone: String(phone).trim() });
  
  if (!user) {
    // If not found by phone, try email if provided
    if (email) {
      user = await User.findOne({ email: String(email).trim().toLowerCase() });
    }
  }

  if (!user) {
    // Create a new "Offline" user
    user = await User.create({
      firstName: String(firstName).trim(),
      lastName: lastName ? String(lastName).trim() : '',
      phone: String(phone).trim(),
      email: email ? String(email).trim().toLowerCase() : undefined,
      password: await require('bcryptjs').hash(Date.now().toString() + Math.random().toString(), 10), // Random password for offline users
      role: 'USER',
      status: 'ACTIVE'
    });
  }

  // 2. Check if already enrolled
  const existing = await BatchEnrollment.findOne({ batchId, userId: user._id });
  if (existing && ['pending', 'confirmed'].includes(existing.status)) {
    return res.status(409).json({ error: 'User is already enrolled in this batch' });
  }

  // 3. Create Offline Enrollment
  const enrollment = await BatchEnrollment.create({
    batchId,
    userId: user._id,
    status: 'confirmed',
    enrollmentType: 'offline'
  });

  // 4. Return new student record formatted for the frontend Matrix
  const studentData = {
    id: user._id.toString(),
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    email: user.email,
    phone: user.phone,
    enrollmentStatus: enrollment.status,
    enrollmentType: enrollment.enrollmentType,
    attendancePercentage: '0.0',
    performanceScore: '0.0',
    lastProgressUpdate: null,
    metrics: []
  };

  return res.json({ student: studentData });
}

module.exports = { createCoachingBatch, listCoachingBatches, updateCoachingBatch, deleteCoachingBatch, listBatchStudentsWithProgress, enrollOfflineStudent };
