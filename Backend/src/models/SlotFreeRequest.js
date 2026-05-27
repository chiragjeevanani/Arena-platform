const mongoose = require('mongoose');

const slotFreeRequestSchema = new mongoose.Schema(
  {
    userMembershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserMembership',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courtSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourtSlot',
      required: true,
    },
    courtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: true,
    },
    arenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Arena',
      required: true,
      index: true,
    },
    freedDate: { type: String, required: true, trim: true }, // "YYYY-MM-DD"
    freedAt: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ['freed', 'resold'],
      default: 'freed',
    },
    bonusPointsAwarded: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Prevent duplicate free requests for the same slot on the same date in the same membership
slotFreeRequestSchema.index(
  { userMembershipId: 1, courtSlotId: 1, freedDate: 1 },
  { unique: true }
);

function toPublic(doc, extras = {}) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    userMembershipId: String(o.userMembershipId),
    userId: String(o.userId),
    courtSlotId: String(o.courtSlotId),
    courtId: String(o.courtId),
    arenaId: String(o.arenaId),
    freedDate: o.freedDate,
    freedAt: o.freedAt,
    status: o.status,
    bonusPointsAwarded: o.bonusPointsAwarded,
    createdAt: o.createdAt,
    ...extras,
  };
}

slotFreeRequestSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('SlotFreeRequest', slotFreeRequestSchema);
