const mongoose = require('mongoose');
const StaffAttendance = require('../models/StaffAttendance');
const User = require('../models/User');

async function markStaffAttendance(req, res) {
  const { staffId, arenaId, date, checkIn, checkOut, status, remarks } = req.body;
  const markedBy = req.auth.sub;

  if (!staffId || !arenaId || !date) {
    return res.status(400).json({ error: 'staffId, arenaId, and date are required' });
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
  const { arenaId, date, staffId } = req.query;
  const filter = {};
  if (arenaId) filter.arenaId = arenaId;
  if (date) filter.date = date;
  if (staffId) filter.staffId = staffId;

  try {
    const list = await StaffAttendance.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .populate('staffId', 'name firstName lastName email phone')
      .populate('arenaId', 'name')
      .populate('markedBy', 'name firstName lastName')
      .lean();

    return res.json({ attendance: list });
  } catch (err) {
    console.error('Error listing staff attendance:', err);
    return res.status(500).json({ error: 'Failed to list attendance' });
  }
}

module.exports = { markStaffAttendance, listStaffAttendance };
