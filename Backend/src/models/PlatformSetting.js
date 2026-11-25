const mongoose = require('mongoose');

/** Platform-wide settings controlled by the Super Admin, one document per key (e.g. 'cancellation'). */
const platformSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model('PlatformSetting', platformSettingSchema);
