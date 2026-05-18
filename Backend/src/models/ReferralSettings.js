const mongoose = require('mongoose');

const referralSettingsSchema = new mongoose.Schema(
  {
    referralSystemEnabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    referrerReward: {
      type: Number,
      required: true,
      default: 150,
    },
    newuserReward: {
      type: Number,
      required: true,
      default: 100,
    },
    referralExpiryDays: {
      type: Number,
      required: true,
      default: 30,
    },
    minBookingAmountRequired: {
      type: Number,
      required: true,
      default: 0,
    },
    walletUsageEnabled: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

function toPublicSettings(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    referralSystemEnabled: o.referralSystemEnabled,
    referrerReward: o.referrerReward,
    newuserReward: o.newuserReward,
    referralExpiryDays: o.referralExpiryDays,
    minBookingAmountRequired: o.minBookingAmountRequired,
    walletUsageEnabled: o.walletUsageEnabled,
    updatedAt: o.updatedAt,
  };
}

referralSettingsSchema.statics.toPublic = toPublicSettings;

// Helper to get singleton settings
referralSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('ReferralSettings', referralSettingsSchema);
