const Booking = require('../models/Booking');
const Arena = require('../models/Arena');
const User = require('../models/User');
const Referral = require('../models/Referral');
const { creditWallet } = require('./walletService');
const { createNotification } = require('./notificationService');
const { redeemCouponForBooking } = require('./couponService');

/**
 * Pays out a pending referral when the referred user's first booking is confirmed (paid).
 * The status flip is atomic so a referral can only ever be paid once.
 */
async function payReferralOnFirstBooking(userId, booking) {
  const otherConfirmed = await Booking.countDocuments({
    userId,
    status: { $in: ['confirmed', 'completed', 'rescheduled'] },
    _id: { $ne: booking._id },
  });
  if (otherConfirmed > 0) return;

  const referral = await Referral.findOneAndUpdate(
    { referredUserId: userId, status: 'pending', expiryDate: { $gt: new Date() } },
    { $set: { status: 'completed', bookingId: booking._id } },
    { new: true }
  );
  if (!referral) return;

  const bookingId = booking._id.toString();
  if (referral.rewardAmountReferrer > 0) {
    await creditWallet(referral.referrerId, referral.rewardAmountReferrer, 'referral_reward', {
      bookingId,
      referredUserId: String(userId),
    });
  }
  if (referral.rewardAmountReferred > 0) {
    await creditWallet(userId, referral.rewardAmountReferred, 'welcome_reward', { bookingId });
  }

  const [user, referrer] = await Promise.all([
    User.findById(userId).lean(),
    User.findById(referral.referrerId).lean(),
  ]);
  if (referrer) {
    await createNotification(
      referral.referrerId,
      'Referral Reward Credited!',
      `Congratulations! You earned OMR ${Number(referral.rewardAmountReferrer).toFixed(3)} wallet credit as your referred friend ${user?.name || 'a friend'} made their first booking.`,
      'success',
      { bookingId }
    );
  }
  await createNotification(
    userId,
    'Welcome Reward Credited!',
    `Welcome to Arena! You've received OMR ${Number(referral.rewardAmountReferred).toFixed(3)} welcome wallet credit for signing up with a referral code.`,
    'success',
    { bookingId }
  );
}

/** Side effects of a booking becoming confirmed (paid). Never throws — the booking is already confirmed. */
async function onBookingConfirmed(booking) {
  try {
    // A coupon counts as used once its checkout is actually paid.
    await redeemCouponForBooking(booking);
  } catch (err) {
    console.error('[BookingConfirmed] coupon redemption failed:', err.message);
  }
  try {
    await payReferralOnFirstBooking(booking.userId, booking);
  } catch (err) {
    console.error('[BookingConfirmed] referral payout failed:', err.message);
  }
  try {
    const arena = await Arena.findById(booking.arenaId).select('name').lean();
    await createNotification(
      booking.userId,
      'Booking Confirmed',
      `Your booking at ${arena?.name || 'the arena'} on ${booking.date} at ${booking.timeSlot} is confirmed.`,
      'success',
      { bookingId: booking._id.toString() }
    );
  } catch (err) {
    console.error('[BookingConfirmed] notification failed:', err.message);
  }
}

module.exports = { onBookingConfirmed };
