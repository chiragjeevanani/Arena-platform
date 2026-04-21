const mongoose = require('mongoose');

const availabilityBlockSchema = new mongoose.Schema(
  {
    arenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Arena',
      required: true,
      index: true,
    },
    courtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: true,
      index: true,
    },
    date: { 
      type: String, 
      required: true, 
      index: true // YYYY-MM-DD
    },
    startTime: { type: String, required: true }, // HH:MM
    endTime: { type: String, required: true }, // HH:MM
    reason: { 
      type: String, 
      enum: ['maintenance', 'event', 'coaching', 'custom'],
      default: 'maintenance'
    },
    note: { type: String, default: '' },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
  },
  { timestamps: true }
);

availabilityBlockSchema.index({ arenaId: 1, courtId: 1, date: 1 });

module.exports = mongoose.model('AvailabilityBlock', availabilityBlockSchema);
