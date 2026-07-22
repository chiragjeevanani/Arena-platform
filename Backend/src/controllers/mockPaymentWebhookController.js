const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const { finalizeSuccessfulPayment } = require('../services/paymentFinalizationService');

function getMockSecret() {
  return process.env.MOCK_PAYMENT_WEBHOOK_SECRET || '';
}

async function confirmMockPayment(req, res) {
  const secret = (req.headers['x-mock-payment-secret'] || '').trim();
  if (!getMockSecret() || secret !== getMockSecret()) {
    return res.status(401).json({ error: 'Invalid webhook secret' });
  }

  const { paymentId } = req.body;
  if (!paymentId || !mongoose.isValidObjectId(paymentId)) {
    return res.status(400).json({ error: 'paymentId is required' });
  }

  try {
    const result = await finalizeSuccessfulPayment(paymentId, {
      providerResponseMessage: 'mock_success',
      safeMeta: { source: 'mock_webhook' },
    });
    return res.status(200).json({
      alreadyProcessed: Boolean(result.alreadyProcessed),
      payment: Payment.toPublic(result.payment),
    });
  } catch (err) {
    if (err.status === 409) {
      const existing = await Payment.findById(paymentId).lean();
      if (existing) {
        return res.status(200).json({
          alreadyProcessed: true,
          payment: Payment.toPublic(existing),
        });
      }
    }
    return res.status(err.status || 500).json({ error: err.message || 'Mock confirm failed' });
  }
}

module.exports = { confirmMockPayment };
