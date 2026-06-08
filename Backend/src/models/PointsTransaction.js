const mongoose = require('mongoose');

const REASONS = ['slot_freed', 'membership_discount_applied', 'admin_adjustment'];

const pointsTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    points: { type: Number, required: true, min: 0 },
    reason: { type: String, enum: REASONS, required: true },
    balanceAfter: { type: Number, required: true, min: 0 },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

function toPublic(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    userId: String(o.userId),
    type: o.type,
    points: o.points,
    reason: o.reason,
    balanceAfter: o.balanceAfter,
    meta: o.meta || {},
    createdAt: o.createdAt,
  };
}

pointsTransactionSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('PointsTransaction', pointsTransactionSchema);
