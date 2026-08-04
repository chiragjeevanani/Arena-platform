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
      enum: ['pending', 'confirmed', 'cancelled', 'removed'],
      default: 'confirmed',
    },
    enrollmentType: {
      type: String,
      enum: ['online', 'offline'],
      default: 'online',
    },
    removedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    removedAt: {
      type: Date,
    },
    removalReason: {
      type: String,
      trim: true,
    },
    removalNotes: {
      type: String,
      trim: true,
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
    enrollmentType: o.enrollmentType,
    removedBy: o.removedBy ? String(o.removedBy) : null,
    removedAt: o.removedAt || null,
    removalReason: o.removalReason || '',
    removalNotes: o.removalNotes || '',
    createdAt: o.createdAt,
    ...extras,
  };
}

batchEnrollmentSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('BatchEnrollment', batchEnrollmentSchema);
