const mongoose = require('mongoose');

/** A message the Super Admin or an arena admin sent to many users' notifications at once. */
const broadcastSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    imageUrl: { type: String, default: '', trim: true },
    audience: { type: String, enum: ['customers', 'staff', 'everyone'], default: 'customers' },
    arenaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Arena', default: null, index: true }, // set when an arena admin sent it
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sentByName: { type: String, default: '' },
    recipients: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Broadcast', broadcastSchema);
