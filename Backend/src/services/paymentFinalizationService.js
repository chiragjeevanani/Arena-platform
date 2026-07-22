const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
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
