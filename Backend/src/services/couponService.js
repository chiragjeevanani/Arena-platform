/**
 * Coupons on court bookings.
 *
 * A coupon applies to a whole checkout (one or many bookings). It is validated when the
 * checkout is created and *redeemed* (usage counted) only once that checkout is paid.
 * Unpaid checkouts that still hold the coupon count toward the per-user / total limits, so a
 * user can't open several checkouts with a one-time code and pay for all of them.
 */
const Coupon = require('../models/Coupon');
const Booking = require('../models/Booking');
const { roundMoney } = require('./pricing');

function couponError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/** Checkouts (distinct checkoutIds) still waiting for payment that use this coupon. */
async function pendingCheckouts(couponId, userId) {
  const q = { couponId, status: 'pending', paymentStatus: 'pending' };
  if (userId) q.userId = userId;
  const ids = await Booking.distinct('checkoutId', q);
  return ids.filter(Boolean).length;
}

/**
 * Finds the coupon and checks it can be used on an order of `orderAmount` by `userId`.
 * Returns { coupon, discount } or throws a 400 with a customer-facing reason.
 */
async function resolveCoupon(code, orderAmount, userId) {
  const clean = String(code || '').trim().toUpperCase();
  if (!clean) throw couponError('Enter a coupon code');
  const coupon = await Coupon.findOne({ code: clean });
  if (!coupon) throw couponError('Invalid coupon code.', 404);

  if (!coupon.isActive) throw couponError('This coupon is inactive.');
  if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) throw couponError('This coupon has expired.');
  if (orderAmount < (coupon.minOrderAmount || 0)) {
    throw couponError(`Minimum order amount of OMR ${Number(coupon.minOrderAmount).toFixed(3)} required.`);
  }

  if (coupon.maxUses !== null && coupon.maxUses !== undefined) {
    const inFlight = await pendingCheckouts(coupon._id);
    if (coupon.usedCount + inFlight >= coupon.maxUses) {
      throw couponError('This coupon has reached its usage limit.');
    }
  }
  if (userId) {
    const used = (coupon.usedBy || []).filter((u) => String(u.userId) === String(userId)).length;
    const inFlight = await pendingCheckouts(coupon._id, userId);
    const limit = coupon.maxUsesPerUser || 1;
    if (used + inFlight >= limit) {
      throw couponError(
        inFlight > 0
          ? 'You already have an unpaid booking using this coupon. Complete or cancel it first.'
          : `You have already used this coupon ${limit} time(s).`
      );
    }
  }

  const discount = roundMoney(Math.min(orderAmount, Math.max(0, coupon.computeDiscount(orderAmount))));
  if (!(discount > 0)) throw couponError('This coupon gives no discount on this order.');
  return { coupon, discount };
}

/**
 * Splits an order-level discount across lines in proportion to their price, so each booking
 * records what it actually cost (refunds and receipts stay correct per booking).
 */
function splitDiscount(amounts, discount) {
  const total = amounts.reduce((s, a) => s + a, 0);
  if (!(total > 0) || !(discount > 0)) return amounts.map(() => 0);
  const shares = amounts.map((a) => roundMoney((discount * a) / total));
  // Put any rounding remainder on the largest line.
  const diff = roundMoney(discount - shares.reduce((s, x) => s + x, 0));
  if (diff !== 0) {
    const i = amounts.indexOf(Math.max(...amounts));
    shares[i] = roundMoney(Math.min(amounts[i], shares[i] + diff));
  }
  return shares;
}

/**
 * Counts one use of the coupon for a paid checkout. Idempotent per checkoutId (a cart has
 * several bookings but is one redemption).
 */
async function redeemCouponForBooking(booking) {
  if (!booking?.couponId || !booking.checkoutId) return;
  await Coupon.updateOne(
    { _id: booking.couponId, 'usedBy.checkoutId': { $ne: booking.checkoutId } },
    {
      $inc: { usedCount: 1 },
      $push: { usedBy: { userId: booking.userId, usedAt: new Date(), checkoutId: booking.checkoutId } },
    }
  );
}

module.exports = { resolveCoupon, splitDiscount, redeemCouponForBooking };
