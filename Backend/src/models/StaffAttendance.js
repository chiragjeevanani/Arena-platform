const mongoose = require('mongoose');

const staffAttendanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // 'user' = staff with a login (staffId is a User); 'roster' = ArenaStaff without a login.
    staffKind: { type: String, enum: ['user', 'roster'], default: 'user' },
    arenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Arena',
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    checkIn: { type: String }, // HH:mm
    checkOut: { type: String }, // HH:mm
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half_day'],
      default: 'present',
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StaffAttendance', staffAttendanceSchema);
