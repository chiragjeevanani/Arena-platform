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
    // Who took the register (the coach), and the arena's cross-check of it.
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    markedAt: { type: Date, default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedAt: { type: Date, default: null },
    correctedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    correctedAt: { type: Date, default: null },
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
    markedBy: o.markedBy ? String(o.markedBy) : null,
    markedAt: o.markedAt || o.updatedAt,
    verifiedBy: o.verifiedBy ? String(o.verifiedBy) : null,
    verifiedAt: o.verifiedAt || null,
    correctedBy: o.correctedBy ? String(o.correctedBy) : null,
    correctedAt: o.correctedAt || null,
    updatedAt: o.updatedAt,
  };
}

coachingAttendanceSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('CoachingAttendance', coachingAttendanceSchema);
