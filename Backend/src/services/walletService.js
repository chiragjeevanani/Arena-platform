const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');

async function getOrCreateWallet(userId) {
  // Upsert so two concurrent first-time requests can't both try to insert (unique userId).
  return Wallet.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, balance: 0 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function deductFromWallet(userId, amount, reason, meta = {}) {
  const wallet = await getOrCreateWallet(userId);
  // Conditional update: the balance check and the debit happen atomically.
  const updated = await Wallet.findOneAndUpdate(
    { _id: wallet._id, balance: { $gte: amount } },
    { $inc: { balance: -amount } },
    { new: true }
  );
  if (!updated) {
    const err = new Error('Insufficient wallet balance');
    err.status = 400;
    throw err;
  }

  await WalletTransaction.create({
    walletId: wallet._id,
    userId,
    type: 'debit',
    amount,
    reason,
    balanceAfter: updated.balance,
    meta,
  });

  return updated;
}

async function creditWallet(userId, amount, reason, meta = {}) {
  const wallet = await getOrCreateWallet(userId);
  const updated = await Wallet.findByIdAndUpdate(
    wallet._id,
    { $inc: { balance: amount } },
    { new: true }
  );
  await WalletTransaction.create({
    walletId: wallet._id,
    userId,
    type: 'credit',
    amount,
    reason,
    balanceAfter: updated.balance,
    meta,
  });
  return updated;
}

/**
 * Net wallet amount currently held by a booking: debits taken for it minus refunds
 * already returned. Lets refunds / re-debits stay idempotent across retries.
 */
async function bookingWalletHeld(bookingId) {
  const rows = await WalletTransaction.find({ 'meta.bookingId': String(bookingId) })
    .select('type amount reason')
    .lean();
  let held = 0;
  for (const r of rows) {
    if (r.reason === 'booking_payment' && r.type === 'debit') held += r.amount;
    if (r.reason === 'booking_payment' && r.type === 'credit') held -= r.amount;
    if (r.reason === 'refund' && r.type === 'credit') held -= r.amount;
  }
  return Math.max(0, Math.round(held * 1000) / 1000);
}

/** Returns any wallet money a booking still holds (cancelled / expired / failed payment). */
async function refundBookingWallet(booking, reason = 'booking_cancel') {
  if (!booking || !(booking.walletUsed > 0)) return 0;
  const held = await bookingWalletHeld(booking._id);
  if (held <= 0) return 0;
  await creditWallet(booking.userId, held, 'refund', {
    bookingId: String(booking._id),
    reason,
  });
  return held;
}

/**
 * A booking whose wallet part was refunded (e.g. expired while the user was still on the
 * gateway page) is being confirmed after all: take that wallet part again.
 * Returns false when the balance no longer covers it.
 */
async function rechargeBookingWallet(booking) {
  if (!booking || !(booking.walletUsed > 0)) return true;
  const held = await bookingWalletHeld(booking._id);
  const missing = Math.round((booking.walletUsed - held) * 1000) / 1000;
  if (missing <= 0) return true;
  try {
    await deductFromWallet(booking.userId, missing, 'booking_payment', {
      bookingId: String(booking._id),
      reason: 'late_payment_confirmation',
    });
    return true;
  } catch (err) {
    if (err.status === 400) return false;
    throw err;
  }
}

module.exports = {
  getOrCreateWallet,
  deductFromWallet,
  creditWallet,
  refundBookingWallet,
  rechargeBookingWallet,
};
