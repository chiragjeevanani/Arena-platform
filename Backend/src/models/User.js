const mongoose = require('mongoose');

const ROLES = ['SUPER_ADMIN', 'ARENA_ADMIN', 'RECEPTIONIST', 'COACH', 'CUSTOMER'];

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '', trim: true },
    role: {
      type: String,
      enum: ROLES,
      default: 'CUSTOMER',
    },
    assignedArenaId: { type: String, default: null },
    avatarUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, default: null, select: false },
    emailVerifyExpires: { type: Date, default: null, select: false },
    // Coach profile fields
    bio: { type: String, default: '' },
    experience: { type: String, default: '' },
    achievements: { type: [String], default: [] },
    hours: { type: String, default: '0' },
    wins: { type: String, default: '0' },
    // Referral System fields
    referralCode: { type: String, unique: true, sparse: true, index: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    fcmTokens: {
      type: [
        {
          token: { type: String, required: true },
          platform: { type: String, enum: ['web', 'app'], default: 'web' },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.referralCode) {
    let code = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const prefix = (this.name || 'ARENA').replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || 'ARENA';
      const suffix = Math.floor(1000 + Math.random() * 9000);
      code = `${prefix}${suffix}`;
      const existing = await this.constructor.findOne({ referralCode: code });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }
    this.referralCode = code;
  }
  next();
});

function toPublicUser(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name || `${doc.firstName || ''} ${doc.lastName || ''}`.trim(),
    role: doc.role,
    assignedArenaId: doc.assignedArenaId,
    avatarUrl: doc.avatarUrl || '',
    phone: doc.phone || '',
    isActive: doc.isActive !== false,
    bio: doc.bio || '',
    experience: doc.experience || '',
    achievements: doc.achievements || [],
    hours: doc.hours || '0',
    wins: doc.wins || '0',
    referralCode: doc.referralCode || '',
    referredBy: doc.referredBy ? doc.referredBy.toString() : null,
  };
}

userSchema.statics.toPublic = toPublicUser;

module.exports = mongoose.model('User', userSchema);
