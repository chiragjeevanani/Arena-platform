const mongoose = require('mongoose');

/**
 * A court hold: the whole arena (kind 'arena') or an event (kind 'event') takes courts for one or
 * more days, all day or between two times. While active, those courts are blocked on those days
 * (see services/courtBlocks). Customer bookings already there are NOT moved automatically: they are
 * listed in `affected`; the admin moves (manually) or refunds each one, or the customer cancels it
 * for a full refund.
 */
const slotRef = { courtId: String, courtName: String, date: String, timeSlot: String };

const affectedSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    from: slotRef,
    to: slotRef,
    // pending: waiting for a decision · moved: admin moved it · refunded: admin refunded it ·
    // customer_refunded: the customer cancelled for a full refund · released: the hold was cancelled
    state: { type: String, enum: ['pending', 'moved', 'refunded', 'customer_refunded', 'released'], default: 'pending' },
    resolvedAt: { type: Date, default: null },
  },
  { _id: false }
);

const legacyMovedSchema = new mongoose.Schema(
  { bookingId: mongoose.Schema.Types.ObjectId, customerName: String, from: slotRef, to: slotRef },
  { _id: false }
);

const arenaDayBookingSchema = new mongoose.Schema(
  {
    arenaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Arena', required: true, index: true },
    kind: { type: String, enum: ['arena', 'event'], default: 'arena' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'CmsContent', default: null, index: true },
    date: { type: String, required: true, trim: true }, // first day, YYYY-MM-DD (arena local)
    endDate: { type: String, default: null }, // last day (inclusive); null = same as date
    startTime: { type: String, default: '00:00' }, // HH:MM
    endTime: { type: String, default: '00:00' }, // HH:MM; '00:00' = midnight (whole day when both 00:00)
    courtIds: { type: [mongoose.Schema.Types.ObjectId], default: [] }, // empty = every court of the arena
    bookedFor: { type: String, required: true, trim: true, maxlength: 120 },
    teamName: { type: String, default: '', trim: true, maxlength: 120 },
    phone: { type: String, default: '', trim: true, maxlength: 40 },
    note: { type: String, default: '', trim: true, maxlength: 500 },
    amount: { type: Number, default: 0, min: 0 }, // agreed offline; recorded for reference only
    status: { type: String, enum: ['active', 'cancelled'], default: 'active', index: true },
    affected: { type: [affectedSchema], default: [] },
    // older whole-arena bookings moved customers automatically
    moved: { type: [legacyMovedSchema], default: [] },
    notMoved: { type: [legacyMovedSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    cancelledAt: { type: Date, default: null },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

arenaDayBookingSchema.index({ arenaId: 1, status: 1, date: 1 });

module.exports = mongoose.model('ArenaDayBooking', arenaDayBookingSchema);
