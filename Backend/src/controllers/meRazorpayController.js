const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const { getOrCreateWallet } = require('../services/walletService');
const { isRazorpayConfigured, createOrder, verifySignature } = require('../services/razorpayService');

const ALLOWED_PURPOSES = ['top_up', 'membership', 'booking', 'enrollment'];

// ── Create Razorpay Order ─────────────────────────────────────────────────────

async function createRazorpayOrder(req, res) {
  if (!isRazorpayConfigured()) {
    return res.status(503).json({ error: 'Razorpay is not configured on this server' });
  }

  const { purpose, amount } = req.body;

  if (!purpose || !ALLOWED_PURPOSES.includes(purpose)) {
    return res.status(400).json({ error: `purpose must be one of: ${ALLOWED_PURPOSES.join(', ')}` });
  }
  if (amount === undefined || amount === null) {
    return res.status(400).json({ error: 'amount is required' });
  }
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  // Build meta from optional body fields
  const meta = {};
  if (req.body.planId) meta.planId = String(req.body.planId);
  if (req.body.bookingId) meta.bookingId = String(req.body.bookingId);
  if (req.body.batchId) meta.batchId = String(req.body.batchId);

  // Save a pending payment record
  const payment = await Payment.create({
    userId: req.auth.sub,
    amount: n,
    currency: 'OMR',
    purpose,
    status: 'pending',
    provider: 'razorpay',
    meta,
  });

  // Razorpay expects integer amount in smallest currency unit.
  // We multiply OMR by 1000 to get the integer representation (3 decimal places).
  const amountInSmallestUnit = Math.round(n * 1000);

  const receipt = `rcpt_${payment._id.toString().slice(-8)}`;

  const order = await createOrder({
    amountInSmallestUnit,
    currency: 'INR', // Test mode uses INR; swap to OMR when Razorpay approves it for your account
    receipt,
    notes: { paymentRecordId: payment._id.toString(), purpose, userId: req.auth.sub.toString() },
  });

  return res.status(201).json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    paymentRecordId: payment._id.toString(),
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    originalAmount: n,
  });
}

// ── Verify Razorpay Payment ───────────────────────────────────────────────────

async function verifyRazorpayPayment(req, res) {
  if (!isRazorpayConfigured()) {
    return res.status(503).json({ error: 'Razorpay is not configured on this server' });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, paymentRecordId } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ error: 'razorpay_payment_id, razorpay_order_id, and razorpay_signature are required' });
  }
  if (!paymentRecordId || !mongoose.isValidObjectId(paymentRecordId)) {
    return res.status(400).json({ error: 'Valid paymentRecordId is required' });
  }

  // 1. Verify HMAC signature
  verifySignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  // 2. Claim the pending payment record (idempotent)
  const claimed = await Payment.findOneAndUpdate(
    { _id: paymentRecordId, userId: req.auth.sub, status: 'pending', provider: 'razorpay' },
    { $set: { status: 'succeeded', meta: { razorpay_payment_id, razorpay_order_id } } },
    { new: true }
  );

  if (!claimed) {
    const existing = await Payment.findById(paymentRecordId).lean();
    if (existing?.status === 'succeeded') {
      return res.status(200).json({ alreadyProcessed: true, payment: Payment.toPublic(existing) });
    }
    return res.status(404).json({ error: 'Payment record not found or already processed' });
  }

  // 3. Dispatch purpose-specific logic
  if (claimed.purpose === 'top_up') {
    const wallet = await getOrCreateWallet(claimed.userId);
    const updated = await Wallet.findByIdAndUpdate(
      wallet._id,
      { $inc: { balance: claimed.amount } },
      { new: true }
    );
    await WalletTransaction.create({
      walletId: wallet._id,
      userId: claimed.userId,
      type: 'credit',
      amount: claimed.amount,
      reason: 'top_up',
      balanceAfter: updated.balance,
      meta: { paymentId: claimed._id.toString(), provider: 'razorpay', razorpay_payment_id },
    });

    return res.status(200).json({
      success: true,
      payment: Payment.toPublic(claimed),
      wallet: Wallet.toPublic(updated),
    });
  }

  // For membership / booking / enrollment — payment is recorded as succeeded.
  // The actual purchase step is handled by the existing purchase endpoints.
  // Frontend should call those endpoints after verification.
  return res.status(200).json({
    success: true,
    payment: Payment.toPublic(claimed),
  });
}

module.exports = { createRazorpayOrder, verifyRazorpayPayment };
