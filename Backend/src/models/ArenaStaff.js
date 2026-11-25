const mongoose = require('mongoose');

/**
 * Arena staff who don't sign in to the system (cleaners, ground staff, security, …).
 * Added by the Super Admin; the arena's admins take their daily attendance.
 * Staff with logins (arena admins, receptionists, coaches) are Users instead.
 */
const arenaStaffSchema = new mongoose.Schema(
  {
    arenaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Arena', required: true, index: true },
    name: { type: String, required: true, trim: true },
    jobTitle: { type: String, default: 'Staff', trim: true },
    phone: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

arenaStaffSchema.statics.toPublic = (o) => ({
  id: String(o._id),
  arenaId: String(o.arenaId),
  name: o.name,
  jobTitle: o.jobTitle || 'Staff',
  phone: o.phone || '',
  isActive: o.isActive !== false,
  createdAt: o.createdAt,
});

module.exports = mongoose.model('ArenaStaff', arenaStaffSchema);
