/**
 * Booking refunds.
 *
 * Policy (matches the Terms printed on every booking receipt): a paid booking cancelled at
 * least CANCELLATION_REFUND_HOURS (default 24) before the slot starts gets a full refund;
 * later cancellations forfeit the booking fee. Unpaid (pending) bookings always get back
 * any wallet amount they took.
 *
 * Bank Muscat's refund API is not available, so customer refunds are paid as Arena Wallet
 * credit (the Terms allow "refund or account credit"). Staff can instead record a refund
 * they made through the bank's merchant portal ("bank" method).
 */
const Booking = require('../models/Booking');
const WalletTransaction = require('../models/WalletTransaction');
const { creditWallet, refundBookingWallet } = require('./walletService');
const { slotStartInstant } = require('./slotAvailability');
const { roundMoney } = require('./pricing');

function refundWindowHours() {
  const n = Number(process.env.CANCELLATION_REFUND_HOURS);
  return Number.isFinite(n) && n >= 0 ? n : 24;
}

/** What a customer would get back if they cancelled this booking now. */
function cancellationQuote(booking, now = new Date()) {
  const policyHours = refundWindowHours();
  const start = slotStartInstant(booking.date, booking.timeSlot);
  const hoursBeforeStart = start ? (start.getTime() - now.getTime()) / 3600e3 : null;

  if (booking.paymentStatus !== 'paid') {
    // Not paid yet: nothing was charged except a possible wallet part, which always comes back.
    return { policyHours, hoursBeforeStart, eligible: true, refundAmount: roundMoney(booking.walletUsed || 0), paid: false };
  }
  // Grace period right after booking: covers the app rolling back a cart checkout that
  // failed part-way, and genuine mis-taps, without forfeiting the fee.
  const graceMs = (Number(process.env.CANCELLATION_GRACE_MINUTES) || 10) * 60 * 1000;
  const justBooked = booking.createdAt && now.getTime() - new Date(booking.createdAt).getTime() <= graceMs;
  const eligible = justBooked || (hoursBeforeStart !== null && hoursBeforeStart >= policyHours);
  return {
    policyHours,
    hoursBeforeStart,
    eligible,
    refundAmount: eligible ? roundMoney(booking.amount || 0) : 0,
    paid: true,
  };
}

/** Card (gateway) part of a paid booking: what the customer paid outside the wallet. */
function cardPart(booking) {
  return roundMoney(Math.max(0, Number(booking.amount || 0) - Number(booking.walletUsed || 0)));
}

/**
 * Refunds everything a paid booking took. The booking row is claimed first
 * (refundedAt: null → now) so a refund can never be paid twice.
 *
 * method 'wallet': wallet part + card part credited to the customer's wallet.
 * method 'bank':   wallet part back to wallet; card part recorded as refunded by the bank
 *                  (staff did it in the Bank Muscat portal, `reference` = bank ref).
 */
async function refundPaidBooking(bookingId, { method = 'wallet', reference = '', by = 'staff', reason = 'refund' } = {}) {
  if (!['wallet', 'bank'].includes(method)) {
    const err = new Error('method must be wallet or bank');
    err.status = 400;
    throw err;
  }
  const claimed = await Booking.findOneAndUpdate(
    { _id: bookingId, refundedAt: null, paymentStatus: { $in: ['paid', 'refunded'] } },
    { $set: { refundedAt: new Date() } },
    { new: true }
  );
  if (!claimed) {
    const existing = await Booking.findById(bookingId).lean();
    const err = new Error(existing?.refundedAt ? 'This booking has already been refunded' : 'Only paid bookings can be refunded');
    err.status = existing ? 409 : 404;
    throw err;
  }

  try {
    const walletBack = await refundBookingWallet(claimed, reason);
    const card = cardPart(claimed);
    if (card > 0 && method === 'wallet') {
      // Guard against a credit already made for this booking's card part (e.g. a retry).
      const already = await WalletTransaction.findOne({
        'meta.bookingId': String(claimed._id),
        'meta.source': 'card_to_wallet',
      }).lean();
      if (!already) {
        await creditWallet(claimed.userId, card, 'refund', {
          bookingId: String(claimed._id),
          source: 'card_to_wallet',
          reason,
        });
      }
    }
    // Total returned to the customer: wallet part (now or earlier) + card part.
    const refundedAmount = roundMoney(claimed.amount || walletBack + card);
    const updated = await Booking.findByIdAndUpdate(
      claimed._id,
      {
        $set: {
          paymentStatus: 'refunded',
          refundedAmount,
          refundMethod: method,
          refundReference: String(reference || '').slice(0, 120),
          ...(claimed.status !== 'cancelled'
            ? { status: 'cancelled', cancelledAt: new Date(), cancelledBy: by }
            : {}),
        },
      },
      { new: true }
    );
    return { booking: updated, refundedAmount, walletAmount: method === 'wallet' ? refundedAmount : walletBack };
  } catch (err) {
    // Release the claim so the refund can be retried.
    await Booking.updateOne({ _id: claimed._id }, { $set: { refundedAt: null } });
    throw err;
  }
}

module.exports = { cancellationQuote, refundPaidBooking, refundWindowHours, cardPart };
