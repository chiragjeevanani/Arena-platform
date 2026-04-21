const Payment = require('../models/Payment');

const ALLOWED_PURPOSES = ['top_up'];

async function createPaymentIntent(req, res) {
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

  const payment = await Payment.create({
    userId: req.auth.sub,
    amount: n,
    purpose,
    status: 'pending',
    provider: 'mock',
    meta: {},
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
