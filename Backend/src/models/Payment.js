const mongoose = require('mongoose');

const PURPOSES = ['top_up', 'booking', 'membership', 'enrollment'];
const STATUSES = ['pending', 'succeeded', 'failed'];

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'OMR', trim: true },
    purpose: { type: String, enum: PURPOSES, required: true },
    status: { type: String, enum: STATUSES, default: 'pending' },
    provider: { type: String, default: 'mock', trim: true },
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
    amount: o.amount,
    currency: o.currency,
    purpose: o.purpose,
    status: o.status,
    provider: o.provider,
    meta: o.meta || {},
    createdAt: o.createdAt,
  };
}

paymentSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('Payment', paymentSchema);
