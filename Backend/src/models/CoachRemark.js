const mongoose = require('mongoose');

const coachRemarkSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoachingBatch',
      required: true,
      index: true,
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    text: { type: String, required: true, trim: true, maxlength: 8000 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

function toPublic(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    batchId: String(o.batchId),
    coachId: String(o.coachId),
    studentUserId: o.studentUserId ? String(o.studentUserId) : null,
    text: o.text,
    rating: o.rating,
    pinned: !!o.pinned,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

coachRemarkSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('CoachRemark', coachRemarkSchema);
