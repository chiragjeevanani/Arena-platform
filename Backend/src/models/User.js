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
  },
  { timestamps: true }
);

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
  };
}

userSchema.statics.toPublic = toPublicUser;

module.exports = mongoose.model('User', userSchema);
