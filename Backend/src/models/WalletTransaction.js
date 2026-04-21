const mongoose = require('mongoose');

const REASONS = ['top_up', 'booking_payment', 'refund', 'membership_purchase', 'admin_adjustment'];

const walletTransactionSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true, min: 0 },
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
    walletId: String(o.walletId),
    userId: String(o.userId),
    type: o.type,
    amount: o.amount,
    reason: o.reason,
    balanceAfter: o.balanceAfter,
    meta: o.meta || {},
    createdAt: o.createdAt,
  };
}

walletTransactionSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
