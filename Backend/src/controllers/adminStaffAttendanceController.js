const mongoose = require('mongoose');
const StaffAttendance = require('../models/StaffAttendance');
const User = require('../models/User');
const ArenaStaff = require('../models/ArenaStaff');
const CoachingBatch = require('../models/CoachingBatch');

async function markStaffAttendance(req, res) {
  const { staffId, arenaId, date, checkIn, checkOut, status, remarks } = req.body;
  const markedBy = req.auth.sub;

  if (!staffId || !arenaId || !date) {
    return res.status(400).json({ error: 'staffId, arenaId, and date are required' });
  }
  if (!mongoose.isValidObjectId(staffId) || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    return res.status(400).json({ error: 'Invalid staff or date' });
  }
  if (status && !['present', 'absent', 'late', 'half_day'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  // Roster staff (no login) must belong to this arena.
  const roster = await ArenaStaff.findOne({ _id: staffId, arenaId }).lean();
  const staffKind = roster ? 'roster' : 'user';
  if (!roster) {
    const u = await User.findById(staffId).select('role assignedArenaId').lean();
    const coachHere = u?.role === 'COACH' && (await CoachingBatch.exists({ coachId: staffId, arenaId }));
    const assignedHere = u && ['ARENA_ADMIN', 'RECEPTIONIST', 'COACH'].includes(u.role) && String(u.assignedArenaId) === String(arenaId);
    if (!u || !(coachHere || assignedHere)) return res.status(404).json({ error: 'Staff member not found at this arena' });
  }

  try {
    const existing = await StaffAttendance.findOne({ staffId, arenaId, date });
    if (existing) {
      existing.checkIn = checkIn || existing.checkIn;
      existing.checkOut = checkOut || existing.checkOut;
      existing.status = status || existing.status;
      existing.remarks = remarks || existing.remarks;
      existing.markedBy = markedBy;
      await existing.save();
      return res.json({ message: 'Attendance updated', attendance: existing });
    }

    const attendance = await StaffAttendance.create({
      staffId,
      staffKind,
      arenaId,
      date,
      checkIn,
      checkOut,
      status,
      remarks,
      markedBy,
    });

    return res.status(201).json({ message: 'Attendance marked', attendance });
  } catch (err) {
    console.error('Error marking staff attendance:', err);
    return res.status(500).json({ error: 'Failed to mark attendance' });
  }
}

async function listStaffAttendance(req, res) {
  const { arenaId, date, staffId, startDate, endDate } = req.query;
  const filter = {};
  if (arenaId) filter.arenaId = arenaId;
  if (staffId) filter.staffId = staffId;

  if (date) {
    filter.date = date;
  } else if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }

  try {
    const list = await StaffAttendance.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .populate('arenaId', 'name')
      .populate('markedBy', 'name firstName lastName')
      .lean();

    // Staff are either Users (with a login) or ArenaStaff (roster, no login): resolve both
    // so every row carries staffId = { _id, name, role, phone }.
    const ids = [...new Set(list.map((a) => String(a.staffId)))];
    const [users, roster] = await Promise.all([
      User.find({ _id: { $in: ids } }).select('name firstName lastName email phone role').lean(),
      ArenaStaff.find({ _id: { $in: ids } }).lean(),
    ]);
    const userById = new Map(users.map((u) => [String(u._id), u]));
    const rosterById = new Map(roster.map((s) => [String(s._id), s]));
    for (const a of list) {
      const sid = String(a.staffId);
      const r = rosterById.get(sid);
      if (r) { a.staffId = { _id: r._id, name: r.name, role: r.jobTitle || 'Staff', phone: r.phone }; a.staffKind = 'roster'; continue; }
      a.staffId = userById.get(sid) || { _id: sid, name: 'Former staff' };
      a.staffKind = 'user';
    }

    return res.json({ attendance: list });
  } catch (err) {
    console.error('Error listing staff attendance:', err);
    return res.status(500).json({ error: 'Failed to list attendance' });
  }
}

module.exports = { markStaffAttendance, listStaffAttendance };
