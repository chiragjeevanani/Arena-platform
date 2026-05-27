const mongoose = require('mongoose');

const userMembershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    membershipPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: true,
    },
    arenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Arena',
      required: false,
      index: true,
    },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    bookedSlots: [
      {
        courtSlotId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourtSlot' },
        courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court' },
        arenaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Arena' },
      },
    ],
    amountPaid: { type: Number, default: 0, min: 0 },
    pointsUsed: { type: Number, default: 0, min: 0 },
    bonusPointsEarned: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

userMembershipSchema.index({ userId: 1, arenaId: 1, status: 1 });

function toPublic(doc, extras = {}) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    userId: String(o.userId),
    membershipPlanId: String(o.membershipPlanId),
    arenaId: o.arenaId ? String(o.arenaId) : null,
    startsAt: o.startsAt,
    expiresAt: o.expiresAt,
    status: o.status,
    bookedSlots: (o.bookedSlots || []).map((s) => ({
      courtSlotId: s.courtSlotId ? String(s.courtSlotId) : null,
      courtId: s.courtId ? String(s.courtId) : null,
      arenaId: s.arenaId ? String(s.arenaId) : null,
    })),
    amountPaid: o.amountPaid || 0,
    pointsUsed: o.pointsUsed || 0,
    bonusPointsEarned: o.bonusPointsEarned || 0,
    createdAt: o.createdAt,
    ...extras,
  };
}

userMembershipSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('UserMembership', userMembershipSchema);
