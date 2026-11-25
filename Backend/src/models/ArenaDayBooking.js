const mongoose = require('mongoose');

/**
 * The whole arena (every court, the whole day) booked for one client on one date —
 * e.g. a company day or a tournament. Payment is agreed offline; this only marks the day.
 * While active, every court of the arena is blocked on that date (see services/courtBlocks).
 */
const movedSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    customerName: { type: String, default: '' },
    from: { courtId: String, courtName: String, date: String, timeSlot: String },
    to: { courtId: String, courtName: String, date: String, timeSlot: String },
  },
  { _id: false }
);

const arenaDayBookingSchema = new mongoose.Schema(
  {
    arenaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Arena', required: true, index: true },
    date: { type: String, required: true, trim: true }, // YYYY-MM-DD (arena local)
    bookedFor: { type: String, required: true, trim: true, maxlength: 120 },
    teamName: { type: String, default: '', trim: true, maxlength: 120 },
    phone: { type: String, default: '', trim: true, maxlength: 40 },
    note: { type: String, default: '', trim: true, maxlength: 500 },
    amount: { type: Number, default: 0, min: 0 }, // agreed offline; recorded for reference only
    status: { type: String, enum: ['active', 'cancelled'], default: 'active', index: true },
    moved: { type: [movedSchema], default: [] }, // customer bookings moved off this day
    notMoved: { type: [movedSchema], default: [] }, // bookings that could not be moved automatically
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    cancelledAt: { type: Date, default: null },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// One active whole-arena booking per arena per day.
arenaDayBookingSchema.index({ arenaId: 1, date: 1 }, { unique: true, partialFilterExpression: { status: 'active' } });

module.exports = mongoose.model('ArenaDayBooking', arenaDayBookingSchema);
