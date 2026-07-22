const Payment = require('../models/Payment');
const {
  createBankMuscatPayment,
  getBankMuscatConfig,
} = require('../providers/bankMuscat/bankMuscatService');

const ALLOWED_PURPOSES = ['top_up', 'booking'];

/**
 * Legacy intent endpoint — prefers Bank Muscat SmartPay when configured, else mock.
 * Prefer POST /api/payments/bank-muscat/create for new clients.
 */
async function createPaymentIntent(req, res) {
  const { purpose, amount, bookingId } = req.body || {};
  if (!purpose || !ALLOWED_PURPOSES.includes(purpose)) {
    return res.status(400).json({ error: `purpose must be one of: ${ALLOWED_PURPOSES.join(', ')}` });
  }

  const cfg = getBankMuscatConfig();
  if (cfg.configured) {
    try {
      const payload = await createBankMuscatPayment({
        userId: req.auth.sub,
        purpose,
        bookingId,
        amount,
        req,
      });
      // Keep ccavenue alias so older frontend branches still redirect.
      return res.status(201).json({
        ...payload,
        provider: payload.provider,
        // dual-compat
        providers: ['bank_muscat', 'ccavenue'],
      });
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message || 'Failed to initiate payment' });
    }
  }

  if (amount === undefined || amount === null) {
    return res.status(400).json({ error: 'amount is required' });
  }
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  const meta = {};
  if (purpose === 'booking' && bookingId) {
    meta.bookingId = String(bookingId);
  }

  const payment = await Payment.create({
    userId: req.auth.sub,
    amount: n,
    purpose,
    status: 'pending',
    provider: 'mock',
    meta,
  });

  return res.status(201).json({
    payment: Payment.toPublic(payment),
    clientSecret: `mock_${payment._id.toString()}`,
    provider: 'mock',
  });
}

async function listMyPayments(req, res) {
  const list = await Payment.find({ userId: req.auth.sub }).sort({ createdAt: -1 }).limit(50).lean();
  return res.json({ payments: list.map((p) => Payment.toPublic(p)) });
}

module.exports = { createPaymentIntent, listMyPayments };
