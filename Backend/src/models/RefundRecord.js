const mongoose = require('mongoose');

/**
 * A refund the Super Admin gave a customer (full or partial), credited to their Arena Wallet.
 * Linked to what it refunds (a booking, coaching enrolment, event or membership) so partial
 * refunds can never add up to more than the customer paid; 'general' refunds are not linked.
 */
const refundRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sourceType: { type: String, enum: ['booking', 'enrollment', 'event', 'membership', 'general'], required: true },
    sourceId: { type: String, default: '', index: true },
    sourceLabel: { type: String, default: '', trim: true },
    amount: { type: Number, required: true, min: 0.001 },
    kind: { type: String, enum: ['full', 'partial', 'general'], required: true },
    reason: { type: String, default: '', trim: true, maxlength: 300 },
    cancelledBooking: { type: Boolean, default: false },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

refundRecordSchema.index({ sourceType: 1, sourceId: 1 });

module.exports = mongoose.model('RefundRecord', refundRecordSchema);
