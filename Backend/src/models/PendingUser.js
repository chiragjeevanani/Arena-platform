const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['CUSTOMER', 'COACH'],
      default: 'CUSTOMER',
    },
    phone: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    country: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    profilePicture: { type: String, default: '' },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    referralCode: { type: String, default: null },
    emailVerifyToken: { type: String, required: true },
    emailVerifyExpires: { type: Date, required: true },
  },
  { timestamps: true }
);

// Automatically delete records 15 minutes after creation
pendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

module.exports = mongoose.model('PendingUser', pendingUserSchema);
