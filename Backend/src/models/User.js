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
  },
  { timestamps: true }
);

function toPublicUser(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    role: doc.role,
    assignedArenaId: doc.assignedArenaId,
    avatarUrl: doc.avatarUrl || '',
    phone: doc.phone || '',
    isActive: doc.isActive !== false,
  };
}

userSchema.statics.toPublic = toPublicUser;

module.exports = mongoose.model('User', userSchema);
