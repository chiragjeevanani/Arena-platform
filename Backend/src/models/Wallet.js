const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    balance: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

function toPublic(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    userId: String(o.userId),
    balance: o.balance,
    updatedAt: o.updatedAt,
  };
}

walletSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('Wallet', walletSchema);
