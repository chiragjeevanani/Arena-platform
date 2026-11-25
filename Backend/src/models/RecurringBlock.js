const mongoose = require('mongoose');

/**
 * A court time reserved for a player/team on chosen weekdays between two dates
 * (e.g. Court 1, 17:00–18:00, Mon/Tue/Wed, 1 Dec → 31 Mar). Customers can't book it while it runs;
 * it ends by itself after endDate. Single dates can be freed (player absent).
 */
const recurringBlockSchema = new mongoose.Schema(
  {
    arenaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Arena', required: true, index: true },
    courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true, index: true },
    startTime: { type: String, required: true }, // HH:MM (24 h)
    endTime: { type: String, required: true }, // HH:MM; '00:00' = midnight
    daysOfWeek: { type: [String], required: true }, // 'Sun'..'Sat'
    startDate: { type: String, required: true }, // YYYY-MM-DD
    endDate: { type: String, required: true }, // YYYY-MM-DD (inclusive)
    playerName: { type: String, required: true, trim: true },
    teamName: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    note: { type: String, default: '', trim: true },
    releasedDates: { type: [String], default: [] }, // dates freed (absence)
    isActive: { type: Boolean, default: true }, // false = cancelled
    endingNotifiedAt: { type: Date, default: null }, // "ends in 7 days" notice sent
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

recurringBlockSchema.index({ arenaId: 1, courtId: 1, isActive: 1, endDate: 1 });

module.exports = mongoose.model('RecurringBlock', recurringBlockSchema);
