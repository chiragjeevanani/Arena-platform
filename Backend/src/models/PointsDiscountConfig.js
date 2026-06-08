const mongoose = require('mongoose');

const pointsDiscountConfigSchema = new mongoose.Schema(
  {
    // null = global config; ObjectId = arena-specific override
    arenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Arena',
      default: null,
      index: true,
    },
    tiers: [
      {
        pointsRequired: { type: Number, required: true, min: 1 },
        discountPercent: { type: Number, required: true, min: 0, max: 100 },
      },
    ],
    maxDiscountPercent: { type: Number, default: 20, min: 0, max: 100 },
  },
  { timestamps: true }
);

// One config document per arena (or one global document where arenaId is null)
pointsDiscountConfigSchema.index({ arenaId: 1 }, { unique: true, sparse: true });

function toPublic(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    arenaId: o.arenaId ? String(o.arenaId) : null,
    tiers: (o.tiers || [])
      .map((t) => ({ pointsRequired: t.pointsRequired, discountPercent: t.discountPercent }))
      .sort((a, b) => a.pointsRequired - b.pointsRequired),
    maxDiscountPercent: o.maxDiscountPercent,
    updatedAt: o.updatedAt,
  };
}

pointsDiscountConfigSchema.statics.toPublic = toPublic;

/**
 * Given a points balance, returns the highest applicable discount percent
 * that does not exceed maxDiscountPercent.
 */
pointsDiscountConfigSchema.statics.computeDiscount = function (config, userPoints) {
  if (!config) return 0;
  const sorted = (config.tiers || []).sort((a, b) => b.pointsRequired - a.pointsRequired);
  const matched = sorted.find((t) => userPoints >= t.pointsRequired);
  if (!matched) return 0;
  return Math.min(matched.discountPercent, config.maxDiscountPercent);
};

module.exports = mongoose.model('PointsDiscountConfig', pointsDiscountConfigSchema);
