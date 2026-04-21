const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema(
  {
    arenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Arena',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    type: { type: String, default: 'Wooden', trim: true },
    pricePerHour: { type: Number, min: 0, default: null },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    imageUrl: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Court', courtSchema);
