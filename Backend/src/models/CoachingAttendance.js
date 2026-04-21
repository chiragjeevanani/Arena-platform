const mongoose = require('mongoose');

const attendanceEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'present',
    },
  },
  { _id: false }
);

const coachingAttendanceSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoachingBatch',
      required: true,
      index: true,
    },
    sessionDate: { type: String, required: true, trim: true },
    records: { type: [attendanceEntrySchema], default: [] },
  },
  { timestamps: true }
);

coachingAttendanceSchema.index({ batchId: 1, sessionDate: 1 }, { unique: true });

function toPublic(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    batchId: String(o.batchId),
    sessionDate: o.sessionDate,
    records: (o.records || []).map((r) => ({
      userId: String(r.userId),
      status: r.status,
    })),
    updatedAt: o.updatedAt,
  };
}

coachingAttendanceSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('CoachingAttendance', coachingAttendanceSchema);
