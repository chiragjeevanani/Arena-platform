const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const MembershipPlan = require('../models/MembershipPlan');
const UserMembership = require('../models/UserMembership');
const CoachingBatch = require('../models/CoachingBatch');
const BatchEnrollment = require('../models/BatchEnrollment');
const { getOrCreateWallet } = require('./walletService');

const TERMINAL_SUCCESS = 'succeeded';
const OPEN = ['created', 'initiated', 'pending'];

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

  const claimed = await Payment.findOneAndUpdate(
    { _id: paymentId, status: { $in: OPEN } },
    { $set },
    { new: true }
  );

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

async function markBookingPaidOnce(payment) {
  const bookingId = payment.meta?.bookingId;
  if (!bookingId) return;

  await Booking.findOneAndUpdate(
    { _id: bookingId, paymentStatus: { $ne: 'paid' } },
    {
      $set: {
        paymentStatus: 'paid',
        paymentMethod: 'online',
      },
    }
  );

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

  if (updated) return updated;
  return Payment.findById(paymentId);
}

module.exports = {
  finalizeSuccessfulPayment,
  markPaymentTerminalFailure,
};
