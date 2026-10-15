const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { refundBookingWallet } = require('./walletService');

/**
 * Periodically auto-expires abandoned pending bookings whose payment hold window has passed.
 */
async function cleanupStalePendingBookings() {
  try {
    const holdMinutes = Number(process.env.BOOKING_PAYMENT_HOLD_MINUTES) || 15;
    const holdCutoff = new Date(Date.now() - holdMinutes * 60 * 1000);

    const stale = await Booking.find({
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: { $lt: holdCutoff },
    })
      .select('_id')
      .lean();

    let expired = 0;
    for (const { _id } of stale) {
      const booking = await Booking.findOneAndUpdate(
        { _id, status: 'pending', paymentStatus: 'pending' },
        { $set: { status: 'cancelled', paymentStatus: 'expired' } },
        { new: true }
      );
      if (!booking) continue;
      expired += 1;
      // Give back any wallet part taken at checkout. If the gateway payment still succeeds
      // later, payment finalization takes it again before re-confirming the booking.
      try {
        await refundBookingWallet(booking, 'booking_expired');
      } catch (err) {
        console.error(`[BookingCleanup] Wallet refund failed for booking ${_id}:`, err.message);
      }
    }

    if (expired > 0) {
      console.log(`[BookingCleanup] Auto-expired ${expired} stale pending booking(s).`);
    }
  } catch (err) {
    console.error('[BookingCleanup] Error cleaning up stale bookings:', err.message);
  }
}

/**
 * One-time migration to release legacy orphaned bookings created under the previous flow
 * where status = 'confirmed' and paymentStatus = 'pending'.
 */
async function migrateOrphanedLegacyBookings() {
  try {
    const holdMinutes = Number(process.env.BOOKING_PAYMENT_HOLD_MINUTES) || 15;
    const holdCutoff = new Date(Date.now() - holdMinutes * 60 * 1000);

    const legacyUnpaid = await Booking.find({
      status: 'confirmed',
      paymentStatus: 'pending',
    }).select('_id createdAt').lean();

    if (legacyUnpaid.length === 0) return;

    let releasedCount = 0;
    for (const b of legacyUnpaid) {
      const associatedPayment = await Payment.findOne({ 'meta.bookingId': String(b._id) }).lean();
      const isPaymentTerminalFail = associatedPayment && ['cancelled', 'failed', 'expired'].includes(associatedPayment.status);
      const isOlderThanHold = b.createdAt && new Date(b.createdAt) < holdCutoff;

      if (isPaymentTerminalFail || isOlderThanHold) {
        await Booking.findByIdAndUpdate(b._id, {
          $set: {
            status: 'cancelled',
            paymentStatus: 'cancelled',
          },
        });
        releasedCount += 1;
      }
    }

    if (releasedCount > 0) {
      console.log(`[LegacyMigration] Cleaned up ${releasedCount} legacy orphaned booking(s).`);
    }
  } catch (err) {
    console.error('[LegacyMigration] Error migrating orphaned bookings:', err.message);
  }
}

module.exports = {
  cleanupStalePendingBookings,
  migrateOrphanedLegacyBookings,
};
