const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const { getOrCreateWallet } = require('../services/walletService');

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

  const claimed = await Payment.findOneAndUpdate(
    { _id: paymentId, status: 'pending' },
    { $set: { status: 'succeeded' } },
    { new: true }
  );

  if (!claimed) {
    const existing = await Payment.findById(paymentId).lean();
    if (existing?.status === 'succeeded') {
      return res.status(200).json({
        alreadyProcessed: true,
        payment: Payment.toPublic(existing),
      });
    }
    return res.status(404).json({ error: 'Payment not found' });
  }

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
      meta: { paymentId: claimed._id.toString(), source: 'mock_webhook' },
    });
  }

  const fresh = await Payment.findById(claimed._id).lean();
  return res.status(200).json({ payment: Payment.toPublic(fresh) });
}

module.exports = { confirmMockPayment };
