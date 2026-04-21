const mongoose = require('mongoose');

const courtSlotSchema = new mongoose.Schema(
  {
    arenaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Arena', required: true },
    courtId: { type: String, required: true }, // Can be court sequence number or ID
    dayOfWeek: { 
      type: String, 
      required: true, 
      enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] 
    },
    timeSlot: { type: String, required: true }, // e.g. "06:00 AM - 07:00 AM"
    startTime: { type: String }, // optional numeric/raw for sorting
    endTime: { type: String },
    price: { type: Number, default: 0 },
    slotClass: { type: String, enum: ['prime', 'nonPrime'], default: 'nonPrime' },
    type: { type: String, default: 'Normal' },
    status: { type: String, default: 'Available' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate slots for same day/time on same court
courtSlotSchema.index({ arenaId: 1, courtId: 1, dayOfWeek: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('CourtSlot', courtSlotSchema);
