const mongoose = require('mongoose');

const batchEnrollmentSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoachingBatch',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

batchEnrollmentSchema.index(
  { batchId: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'confirmed'] },
    },
  }
);

function toPublic(doc, extras = {}) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    batchId: String(o.batchId),
    userId: String(o.userId),
    status: o.status,
    createdAt: o.createdAt,
    ...extras,
  };
}

batchEnrollmentSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('BatchEnrollment', batchEnrollmentSchema);
