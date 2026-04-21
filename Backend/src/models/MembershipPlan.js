const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema(
  {
    arenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Arena',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    price: { type: Number, required: true, min: 0 },
    durationDays: { type: Number, required: true, min: 1 },
    discountPercent: { type: Number, required: true, min: 0, max: 100, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

function toPublic(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    arenaId: String(o.arenaId),
    name: o.name,
    description: o.description || '',
    price: o.price,
    durationDays: o.durationDays,
    discountPercent: o.discountPercent,
    isActive: o.isActive,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

membershipPlanSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
