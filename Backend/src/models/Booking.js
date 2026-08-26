const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    arenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Arena',
      required: true,
    },
    courtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: true,
      index: true,
    },
    date: { type: String, required: true, trim: true },
    timeSlot: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'],
      default: 'confirmed',
    },
    amount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'expired', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: 'online', trim: true },
    type: { type: String, default: 'court' },
    walletUsed: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },

    // Audit Pricing Snapshot Fields
    normalPrice: { type: Number, default: 0 },
    basePrice: { type: Number, default: 0 },
    peakPrice: { type: Number, default: 0 },
    peakSurcharge: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },
    pricingType: { type: String, enum: ['normal', 'peak', 'weekend', 'holiday', 'custom'], default: 'normal' },
    pricingRuleId: { type: String, default: '' },
    pricingRuleName: { type: String, default: 'Standard Base' },
    priceCalculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Only a CONFIRMED (paid) booking reserves a slot. 'pending' (payment not yet
// completed) is deliberately excluded so an in-progress checkout never blocks
// other users from booking the same slot; see paymentFinalizationService's
// markBookingPaidOnce for the race-guard this relies on at confirm time.
bookingSchema.index(
  { courtId: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['confirmed', 'rescheduled'] },
    },
  }
);

function toPublicBooking(doc, extras = {}) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  const normalVal = o.normalPrice ?? o.basePrice ?? o.amount ?? 0;
  return {
    id: o._id.toString(),
    userId: o.userId?._id ? o.userId._id.toString() : String(o.userId),
    arenaId: String(o.arenaId),
    courtId: String(o.courtId),
    date: o.date,
    timeSlot: o.timeSlot,
    status: o.status,
    amount: o.amount,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    type: o.type,
    walletUsed: o.walletUsed || 0,
    paidAmount: o.paidAmount || 0,
    normalPrice: normalVal,
    basePrice: normalVal,
    peakPrice: o.peakPrice ?? (o.pricingType === 'peak' ? o.amount : 0),
    peakSurcharge: o.peakSurcharge ?? 0,
    finalPrice: o.finalPrice ?? o.amount ?? 0,
    pricingType: o.pricingType || 'normal',
    pricingRuleId: o.pricingRuleId || '',
    pricingRuleName: o.pricingRuleName || 'Standard Base',
    priceCalculatedAt: o.priceCalculatedAt || o.createdAt,
    createdAt: o.createdAt,
    ...extras,
  };
}

bookingSchema.statics.toPublic = toPublicBooking;

module.exports = mongoose.model('Booking', bookingSchema);
