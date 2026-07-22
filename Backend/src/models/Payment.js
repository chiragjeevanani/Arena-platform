const mongoose = require('mongoose');

const PURPOSES = ['top_up', 'booking', 'membership', 'enrollment'];
const STATUSES = [
  'created',
  'initiated',
  'pending',
  'succeeded',
  'failed',
  'cancelled',
  'expired',
];

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
    status: { type: String, enum: STATUSES, default: 'pending', index: true },
    provider: { type: String, default: 'mock', trim: true, index: true },

    merchantId: { type: String, trim: true },
    internalTransactionId: { type: String, trim: true, index: true },
    merchantTransactionReference: { type: String, trim: true, index: true },
    providerTransactionId: { type: String, trim: true },

    providerResponseCode: { type: String, trim: true },
    providerResponseMessage: { type: String, trim: true },
    failureReason: { type: String, trim: true },

    initiatedAt: { type: Date },
    completedAt: { type: Date },
    verifiedAt: { type: Date },

    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, purpose: 1, status: 1, createdAt: -1 });

function toPublic(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  const meta = { ...(o.meta || {}) };
  // Strip any accidentally nested sensitive fields
  delete meta.encRequest;
  delete meta.workingKey;
  delete meta.accessCode;

  return {
    id: o._id.toString(),
    userId: String(o.userId),
    amount: o.amount,
    currency: o.currency,
    purpose: o.purpose,
    status: o.status,
    provider: o.provider,
    merchantId: o.merchantId || null,
    internalTransactionId: o.internalTransactionId || null,
    merchantTransactionReference: o.merchantTransactionReference || null,
    providerTransactionId: o.providerTransactionId || null,
    providerResponseCode: o.providerResponseCode || null,
    providerResponseMessage: o.providerResponseMessage || null,
    failureReason: o.failureReason || null,
    initiatedAt: o.initiatedAt || null,
    completedAt: o.completedAt || null,
    verifiedAt: o.verifiedAt || null,
    meta,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

paymentSchema.statics.toPublic = toPublic;
paymentSchema.statics.STATUSES = STATUSES;
paymentSchema.statics.PURPOSES = PURPOSES;

module.exports = mongoose.model('Payment', paymentSchema);
