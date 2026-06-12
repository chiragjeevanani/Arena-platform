const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    description: { type: String, default: '', trim: true },
    discountType: {
      type: String,
      enum: ['FLAT', 'PERCENTAGE'],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    // Only applicable when discountType === 'PERCENTAGE'
    maxDiscountCap: { type: Number, default: null, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    // null = unlimited
    maxUses: { type: Number, default: null, min: 1 },
    maxUsesPerUser: { type: Number, default: 1, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    // Tracks per-user usage
    usedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        usedAt: { type: Date, default: Date.now },
      },
    ],
    // Public = listed in checkout; Private = hidden (must be typed manually)
    isPublic: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * Compute the discount amount for a given order total.
 * Returns 0 if the coupon is not applicable.
 */
couponSchema.methods.computeDiscount = function (orderAmount) {
  if (this.discountType === 'FLAT') {
    return Math.min(this.discountValue, orderAmount);
  }
  // PERCENTAGE
  const raw = (orderAmount * this.discountValue) / 100;
  if (this.maxDiscountCap) {
    return Math.min(raw, this.maxDiscountCap);
  }
  return raw;
};

function toPublic(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    code: o.code,
    description: o.description || '',
    discountType: o.discountType,
    discountValue: o.discountValue,
    maxDiscountCap: o.maxDiscountCap ?? null,
    minOrderAmount: o.minOrderAmount ?? 0,
    maxUses: o.maxUses ?? null,
    maxUsesPerUser: o.maxUsesPerUser ?? 1,
    usedCount: o.usedCount ?? 0,
    isPublic: !!o.isPublic,
    isActive: !!o.isActive,
    expiresAt: o.expiresAt ?? null,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

couponSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('Coupon', couponSchema);
