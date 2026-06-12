const Coupon = require('../models/Coupon');

// ─── Helpers ────────────────────────────────────────────────────────────────

function validateCouponFields(body) {
  const { code, discountType, discountValue } = body;
  if (!code || typeof code !== 'string' || !code.trim()) {
    return 'Coupon code is required.';
  }
  if (!['FLAT', 'PERCENTAGE'].includes(discountType)) {
    return 'discountType must be FLAT or PERCENTAGE.';
  }
  if (typeof discountValue !== 'number' || discountValue <= 0) {
    return 'discountValue must be a positive number.';
  }
  if (discountType === 'PERCENTAGE' && discountValue > 100) {
    return 'Percentage discount cannot exceed 100.';
  }
  return null;
}

function checkCouponValidity(coupon, orderAmount, userId) {
  if (!coupon.isActive) {
    return { valid: false, reason: 'This coupon is inactive.' };
  }
  if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
    return { valid: false, reason: 'This coupon has expired.' };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, reason: 'This coupon has reached its usage limit.' };
  }
  if (orderAmount < coupon.minOrderAmount) {
    return {
      valid: false,
      reason: `Minimum order amount of OMR ${coupon.minOrderAmount.toFixed(3)} required.`,
    };
  }
  if (userId) {
    const userUses = coupon.usedBy.filter(
      (u) => u.userId.toString() === userId.toString()
    ).length;
    if (userUses >= coupon.maxUsesPerUser) {
      return {
        valid: false,
        reason: `You have already used this coupon ${coupon.maxUsesPerUser} time(s).`,
      };
    }
  }
  return { valid: true };
}

// ─── Admin Controllers ───────────────────────────────────────────────────────

async function createCoupon(req, res) {
  const error = validateCouponFields(req.body);
  if (error) return res.status(400).json({ error });

  const {
    code,
    description,
    discountType,
    discountValue,
    maxDiscountCap,
    minOrderAmount,
    maxUses,
    maxUsesPerUser,
    isPublic,
    isActive,
    expiresAt,
  } = req.body;

  const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (existing) {
    return res.status(409).json({ error: 'A coupon with this code already exists.' });
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    description: description || '',
    discountType,
    discountValue,
    maxDiscountCap: maxDiscountCap ?? null,
    minOrderAmount: minOrderAmount ?? 0,
    maxUses: maxUses ?? null,
    maxUsesPerUser: maxUsesPerUser ?? 1,
    isPublic: !!isPublic,
    isActive: isActive !== undefined ? !!isActive : true,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    createdBy: req.auth.sub,
  });

  return res.status(201).json({ coupon: Coupon.toPublic(coupon) });
}

async function listCoupons(req, res) {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
  return res.json({
    coupons: coupons.map((c) => ({
      ...Coupon.toPublic(c),
      usedCount: c.usedCount,
    })),
  });
}

async function updateCoupon(req, res) {
  const { couponId } = req.params;
  const coupon = await Coupon.findById(couponId);
  if (!coupon) return res.status(404).json({ error: 'Coupon not found.' });

  const allowed = [
    'description',
    'discountType',
    'discountValue',
    'maxDiscountCap',
    'minOrderAmount',
    'maxUses',
    'maxUsesPerUser',
    'isPublic',
    'isActive',
    'expiresAt',
  ];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) {
      coupon[key] = req.body[key];
    }
  });

  // Allow code update only if no one has used the coupon yet
  if (req.body.code && coupon.usedCount === 0) {
    coupon.code = req.body.code.toUpperCase().trim();
  }

  await coupon.save();
  return res.json({ coupon: Coupon.toPublic(coupon) });
}

async function deleteCoupon(req, res) {
  const { couponId } = req.params;
  const coupon = await Coupon.findByIdAndDelete(couponId);
  if (!coupon) return res.status(404).json({ error: 'Coupon not found.' });
  return res.json({ success: true });
}

// ─── User-Facing Controllers ─────────────────────────────────────────────────

/**
 * GET /api/me/coupons/public
 * Returns all active, non-expired public coupons for display in the checkout.
 */
async function listPublicCoupons(req, res) {
  const now = new Date();
  const coupons = await Coupon.find({
    isPublic: true,
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  })
    .select('-usedBy -createdBy')
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ coupons: coupons.map(Coupon.toPublic) });
}

/**
 * POST /api/me/coupons/validate
 * Preview the discount for a coupon code — does NOT consume usage.
 * Body: { code, orderAmount }
 */
async function validateCoupon(req, res) {
  const { code, orderAmount } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code is required.' });
  if (typeof orderAmount !== 'number' || orderAmount < 0) {
    return res.status(400).json({ error: 'orderAmount must be a non-negative number.' });
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon) return res.status(404).json({ error: 'Invalid coupon code.' });

  const validity = checkCouponValidity(coupon, orderAmount, req.auth?.sub);
  if (!validity.valid) {
    return res.status(400).json({ error: validity.reason });
  }

  const discountAmount = coupon.computeDiscount(orderAmount);
  const finalAmount = Math.max(0, orderAmount - discountAmount);

  return res.json({
    valid: true,
    coupon: Coupon.toPublic(coupon),
    discountAmount: parseFloat(discountAmount.toFixed(3)),
    finalAmount: parseFloat(finalAmount.toFixed(3)),
  });
}

/**
 * Internal service used by booking/payment controllers to atomically apply a coupon.
 * Returns { discountAmount, finalAmount } or throws.
 */
async function applyCouponInternal({ code, orderAmount, userId }) {
  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon) throw new Error('Invalid coupon code.');

  const validity = checkCouponValidity(coupon, orderAmount, userId);
  if (!validity.valid) throw new Error(validity.reason);

  const discountAmount = coupon.computeDiscount(orderAmount);

  await Coupon.findByIdAndUpdate(coupon._id, {
    $inc: { usedCount: 1 },
    $push: { usedBy: { userId, usedAt: new Date() } },
  });

  return {
    discountAmount: parseFloat(discountAmount.toFixed(3)),
    finalAmount: parseFloat(Math.max(0, orderAmount - discountAmount).toFixed(3)),
  };
}

module.exports = {
  createCoupon,
  listCoupons,
  updateCoupon,
  deleteCoupon,
  listPublicCoupons,
  validateCoupon,
  applyCouponInternal,
};
