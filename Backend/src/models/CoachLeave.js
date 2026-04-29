const mongoose = require('mongoose');

const coachLeaveSchema = new mongoose.Schema(
  {
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoachingBatch',
      index: true, // If null, means leave from all batches on that date
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    reason: {
      type: String,
      default: 'Personal Leave',
    },
    status: {
      type: String,
      enum: ['Approved', 'Pending', 'Rejected'],
      default: 'Approved', // Auto-approved for now as per user request flow
    }
  },
  { timestamps: true }
);

coachLeaveSchema.index({ coachId: 1, date: 1, batchId: 1 }, { unique: true });

function toPublic(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    coachId: String(o.coachId),
    batchId: o.batchId ? String(o.batchId) : null,
    date: o.date,
    reason: o.reason,
    status: o.status,
    createdAt: o.createdAt,
  };
}

coachLeaveSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('CoachLeave', coachLeaveSchema);
