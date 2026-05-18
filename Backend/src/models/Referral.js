const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'expired'],
      default: 'pending',
    },
    rewardAmountReferrer: {
      type: Number,
      required: true,
      default: 150,
    },
    rewardAmountReferred: {
      type: Number,
      required: true,
      default: 100,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

function toPublicReferral(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    referrerId: String(o.referrerId),
    referredUserId: String(o.referredUserId),
    referralCode: o.referralCode,
    status: o.status,
    rewardAmountReferrer: o.rewardAmountReferrer,
    rewardAmountReferred: o.rewardAmountReferred,
    bookingId: o.bookingId ? String(o.bookingId) : null,
    expiryDate: o.expiryDate,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

referralSchema.statics.toPublic = toPublicReferral;

module.exports = mongoose.model('Referral', referralSchema);
