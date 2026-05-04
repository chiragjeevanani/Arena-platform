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
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    amount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: 'online', trim: true },
    type: { type: String, default: 'court' },
  },
  { timestamps: true }
);

bookingSchema.index(
  { courtId: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'confirmed'] },
    },
  }
);

function toPublicBooking(doc, extras = {}) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
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
    createdAt: o.createdAt,
    ...extras,
  };
}

bookingSchema.statics.toPublic = toPublicBooking;

module.exports = mongoose.model('Booking', bookingSchema);
