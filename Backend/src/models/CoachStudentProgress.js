const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema(
  {
    metricKey: { type: String, required: true, trim: true },
    groupCategory: { type: String, default: '', trim: true },
    name: { type: String, default: '', trim: true },
    score: { type: Number, required: true, min: 0, max: 10 },
  },
  { _id: false }
);

const coachStudentProgressSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoachingBatch',
      required: true,
      index: true,
    },
    studentUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    metrics: [metricSchema],
    remarks: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

coachStudentProgressSchema.index({ batchId: 1, studentUserId: 1 }, { unique: true });

function toPublic(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    batchId: String(o.batchId),
    studentUserId: String(o.studentUserId),
    coachId: String(o.coachId),
    metrics: o.metrics || [],
    remarks: o.remarks || '',
    updatedAt: o.updatedAt,
    createdAt: o.createdAt,
  };
}

coachStudentProgressSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('CoachStudentProgress', coachStudentProgressSchema);
