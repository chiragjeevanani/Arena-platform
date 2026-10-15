const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const MembershipPlan = require('../models/MembershipPlan');
const UserMembership = require('../models/UserMembership');
const CoachingBatch = require('../models/CoachingBatch');
const BatchEnrollment = require('../models/BatchEnrollment');
const EventRegistration = require('../models/EventRegistration');
const { getOrCreateWallet, refundBookingWallet, rechargeBookingWallet } = require('./walletService');
const { onBookingConfirmed } = require('./bookingConfirmationService');

const TERMINAL_SUCCESS = 'succeeded';
const OPEN = ['created', 'initiated', 'pending'];
// A verified gateway success can still arrive after we gave up on a payment (user closed the
// tab, hit back, cancelled the booking, or the hold expired). The money was captured, so it
// must still be recorded — never for payments we failed on a security/amount check.
const LATE_SUCCESS_FROM = ['failed', 'cancelled', 'expired'];

function buildSet(fields) {
  const $set = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) $set[k] = v;
  }
  return $set;
}

/**
 * Idempotent successful-payment finalization.
 * Safe under duplicate callbacks / retries / double-submit.
 */
async function finalizeSuccessfulPayment(paymentId, extras = {}) {
  const $set = buildSet({
    status: TERMINAL_SUCCESS,
    completedAt: new Date(),
    verifiedAt: new Date(),
    providerTransactionId: extras.providerTransactionId,
    providerResponseCode: extras.providerResponseCode,
    providerResponseMessage: extras.providerResponseMessage,
    failureReason: null,
    'meta.finalizedAt': new Date().toISOString(),
  });

  if (extras.safeMeta && typeof extras.safeMeta === 'object') {
    for (const [k, v] of Object.entries(extras.safeMeta)) {
      if (v !== undefined) $set[`meta.${k}`] = v;
    }
  }

  let claimed = await Payment.findOneAndUpdate(
    { _id: paymentId, status: { $in: OPEN } },
    { $set },
    { new: true }
  );

  if (!claimed) {
    $set['meta.lateSuccess'] = true;
    claimed = await Payment.findOneAndUpdate(
      {
        _id: paymentId,
        status: { $in: LATE_SUCCESS_FROM },
        'meta.amountMismatch': { $ne: true },
        'meta.securityError': { $ne: true },
      },
      { $set },
      { new: true }
    );
    if (claimed) {
      console.warn(`[PaymentFinalize] Late gateway success recorded for payment ${paymentId}`);
    }
  }

  if (!claimed) {
    const existing = await Payment.findById(paymentId);
    if (existing?.status === TERMINAL_SUCCESS) {
      return { payment: existing, alreadyProcessed: true };
    }
    const err = new Error('Payment cannot be finalized (not open or missing)');
    err.status = 409;
    throw err;
  }

  if (claimed.purpose === 'top_up') {
    await creditWalletOnce(claimed, extras);
  }

  if (claimed.purpose === 'booking') {
    await markBookingPaidOnce(claimed);
  }

  if (claimed.purpose === 'membership') {
    await activateMembershipOnce(claimed);
  }

  if (claimed.purpose === 'enrollment') {
    await createEnrollmentOnce(claimed);
  }

  if (claimed.meta?.eventId) {
    await finalizeEventRegistrationOnce(claimed);
  }

  const fresh = await Payment.findById(claimed._id);
  return { payment: fresh, alreadyProcessed: false };
}

async function creditWalletOnce(payment, extras = {}) {
  const already = await WalletTransaction.findOne({
    userId: payment.userId,
    reason: 'top_up',
    'meta.paymentId': payment._id.toString(),
  }).lean();
  if (already) return;

  const wallet = await getOrCreateWallet(payment.userId);
  const updated = await Wallet.findByIdAndUpdate(
    wallet._id,
    { $inc: { balance: payment.amount } },
    { new: true }
  );
  await WalletTransaction.create({
    walletId: wallet._id,
    userId: payment.userId,
    type: 'credit',
    amount: payment.amount,
    reason: 'top_up',
    balanceAfter: updated.balance,
    meta: {
      paymentId: payment._id.toString(),
      source: 'bank_muscat_finalize',
      trackingId: extras.providerTransactionId,
    },
  });

  await Payment.findByIdAndUpdate(payment._id, {
    $set: { 'meta.walletCredited': true },
  });
}

/** Bookings a payment settles: `meta.bookingIds` for cart checkouts, else the single `meta.bookingId`. */
function paymentBookingIds(payment) {
  const ids = payment.meta?.bookingIds;
  if (Array.isArray(ids) && ids.length) return ids.map(String);
  return payment.meta?.bookingId ? [String(payment.meta.bookingId)] : [];
}

async function markBookingPaidOnce(payment) {
  const bookingIds = paymentBookingIds(payment);
  if (!bookingIds.length) return;

  const conflicted = [];
  for (const bookingId of bookingIds) {
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.paymentStatus === 'paid') continue;

    // The booking may have been cancelled/expired (and its wallet part refunded) while the
    // user was still on the gateway page. Take the wallet part again before reviving it.
    if (booking.status === 'cancelled') {
      const recharged = await rechargeBookingWallet(booking);
      if (!recharged) {
        console.error(
          `[BookingConflict] Payment ${payment._id} succeeded but booking ${bookingId} can no longer cover its wallet part — needs manual refund.`
        );
        await Booking.findByIdAndUpdate(bookingId, { $set: { paymentStatus: 'paid' } });
        conflicted.push(bookingId);
        continue;
      }
    }

    // Since a 'pending' booking no longer holds the slot, another user's booking
    // for the same court/date/timeSlot may have been confirmed in the meantime.
    // The DB's partial unique index (status in confirmed/rescheduled) is the
    // real guard here: this update is rejected with E11000 if that happened.
    try {
      const confirmed = await Booking.findOneAndUpdate(
        { _id: bookingId, paymentStatus: { $ne: 'paid' } },
        {
          $set: {
            status: 'confirmed',
            paymentStatus: 'paid',
            // Keep 'partial_wallet' so receipts still show the wallet part.
            paymentMethod: booking.walletUsed > 0 ? 'partial_wallet' : 'online',
          },
        },
        { new: true }
      );
      if (confirmed) await onBookingConfirmed(confirmed);
    } catch (err) {
      if (err.code !== 11000) throw err;
      // Money was captured by the gateway but the slot was taken by someone
      // else's payment first — flag for manual refund, do not confirm this one.
      console.error(
        `[BookingConflict] Payment ${payment._id} succeeded but booking ${bookingId} lost the slot race — needs manual refund.`
      );
      const lost = await Booking.findByIdAndUpdate(
        bookingId,
        { $set: { status: 'cancelled', paymentStatus: 'paid' } },
        { new: true }
      );
      // The wallet part can be returned right away; the card part needs a manual refund.
      await refundBookingWallet(lost, 'booking_slot_conflict');
      conflicted.push(bookingId);
    }
  }

  if (conflicted.length) {
    await Payment.findByIdAndUpdate(payment._id, {
      $set: {
        'meta.bookingMarkedPaid': conflicted.length < bookingIds.length,
        'meta.slotConflict': true,
        'meta.needsManualRefund': true,
        'meta.conflictedBookingIds': conflicted,
      },
    });
    return;
  }

  await Payment.findByIdAndUpdate(payment._id, {
    $set: { 'meta.bookingMarkedPaid': true },
  });
}

async function activateMembershipOnce(payment) {
  if (payment.meta?.membershipActivated) return;

  const planId = payment.meta?.planId;
  if (!planId) return;

  const plan = await MembershipPlan.findOne({ _id: planId, isActive: true });
  if (!plan || plan.slotBased) {
    // Slot-based plans still need bookedSlots from the client; leave for a follow-up purchase call.
    return;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + Number(plan.durationDays) * 86400000);
  await UserMembership.create({
    userId: payment.userId,
    membershipPlanId: plan._id,
    arenaId: plan.isGlobal ? null : plan.arenaId,
    startsAt: now,
    expiresAt,
    status: 'active',
    amountPaid: payment.amount,
  });

  await Payment.findByIdAndUpdate(payment._id, {
    $set: { 'meta.membershipActivated': true, 'meta.membershipPlanId': plan._id.toString() },
  });
}

async function createEnrollmentOnce(payment) {
  if (payment.meta?.enrollmentCreated) return;

  const batchId = payment.meta?.batchId;
  if (!batchId) return;

  const existing = await BatchEnrollment.findOne({
    batchId,
    userId: payment.userId,
    status: { $in: ['pending', 'confirmed'] },
  }).lean();
  if (existing) {
    await Payment.findByIdAndUpdate(payment._id, {
      $set: { 'meta.enrollmentCreated': true, 'meta.enrollmentId': existing._id.toString() },
    });
    return;
  }

  const batch = await CoachingBatch.findById(batchId);
  if (!batch || !batch.isPublished) return;

  const taken = await BatchEnrollment.countDocuments({
    batchId: batch._id,
    status: { $in: ['pending', 'confirmed'] },
  });
  if (taken >= batch.capacity) return;

  const enrollment = await BatchEnrollment.create({
    batchId: batch._id,
    userId: payment.userId,
    status: 'confirmed',
  });

  await Payment.findByIdAndUpdate(payment._id, {
    $set: {
      'meta.enrollmentCreated': true,
      'meta.enrollmentId': enrollment._id.toString(),
    },
  });
}

async function finalizeEventRegistrationOnce(payment) {
  if (payment.meta?.eventRegistrationFinalized) return;

  const eventId = payment.meta?.eventId;
  const registrantPhone = payment.meta?.registrantPhone;
  const registrantName = payment.meta?.registrantName;
  const registrationId = payment.meta?.registrationId;

  if (!eventId) return;

  let registration = null;
  if (registrationId) {
    registration = await EventRegistration.findById(registrationId);
  }
  if (!registration && registrantPhone) {
    registration = await EventRegistration.findOne({
      eventId,
      phone: String(registrantPhone).trim(),
    });
  }

  if (registration) {
    registration.status = 'Approved';
    registration.paymentId = payment._id;
    if (payment.userId) registration.userId = payment.userId;
    if (registrantName) registration.name = String(registrantName).trim();
    await registration.save();
  } else {
    registration = await EventRegistration.create({
      eventId,
      name: registrantName || 'Participant',
      phone: registrantPhone || '',
      userId: payment.userId || null,
      status: 'Approved',
      paymentId: payment._id,
    });
  }

  await Payment.findByIdAndUpdate(payment._id, {
    $set: {
      'meta.eventRegistrationFinalized': true,
      'meta.eventRegistrationId': registration._id.toString(),
    },
  });
}

async function handleEventRegistrationPaymentFailure(payment) {
  const eventId = payment.meta?.eventId;
  const registrantPhone = payment.meta?.registrantPhone;
  const registrationId = payment.meta?.registrationId;

  if (!eventId) return;

  let registration = null;
  if (registrationId) {
    registration = await EventRegistration.findById(registrationId);
  }
  if (!registration && registrantPhone) {
    registration = await EventRegistration.findOne({
      eventId,
      phone: String(registrantPhone).trim(),
    });
  }

  if (registration && (registration.status === 'PAYMENT_PENDING' || registration.status === 'Pending')) {
    registration.status = 'FAILED_PAYMENT';
    await registration.save();
  }
}

async function markPaymentTerminalFailure(paymentId, opts = {}) {
  const allowed = new Set(['failed', 'cancelled', 'expired']);
  const next = allowed.has(opts.status) ? opts.status : 'failed';

  const $set = buildSet({
    status: next,
    completedAt: new Date(),
    failureReason: opts.failureReason,
    providerResponseCode: opts.providerResponseCode,
    providerResponseMessage: opts.providerResponseMessage,
    providerTransactionId: opts.providerTransactionId,
  });

  if (opts.safeMeta && typeof opts.safeMeta === 'object') {
    for (const [k, v] of Object.entries(opts.safeMeta)) {
      if (v !== undefined) $set[`meta.${k}`] = v;
    }
  }

  const updated = await Payment.findOneAndUpdate(
    { _id: paymentId, status: { $in: OPEN } },
    { $set },
    { new: true }
  );

  if (updated && updated.meta?.eventId) {
    await handleEventRegistrationPaymentFailure(updated);
  }

  const failedBookingIds = updated ? paymentBookingIds(updated) : [];
  if (failedBookingIds.length) {
    const nextPayStatus = next === 'cancelled' ? 'cancelled' : 'failed';
    // Only bookings still waiting on this payment — never touch confirmed/completed ones.
    const toCancel = await Booking.find({ _id: { $in: failedBookingIds }, status: 'pending' });
    for (const booking of toCancel) {
      const cancelled = await Booking.findOneAndUpdate(
        { _id: booking._id, status: 'pending' },
        { $set: { status: 'cancelled', paymentStatus: nextPayStatus } },
        { new: true }
      );
      // Return any wallet part taken when the booking was created.
      if (cancelled) await refundBookingWallet(cancelled, `payment_${next}`);
    }
  }

  if (updated) return updated;
  return Payment.findById(paymentId);
}

module.exports = {
  finalizeSuccessfulPayment,
  markPaymentTerminalFailure,
};
