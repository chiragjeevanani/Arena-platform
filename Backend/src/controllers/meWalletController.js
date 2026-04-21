const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const { getOrCreateWallet } = require('../services/walletService');

async function getMyWallet(req, res) {
  const userId = req.auth.sub;
  const wallet = await getOrCreateWallet(userId);
  const transactions = await WalletTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return res.json({
    wallet: Wallet.toPublic(wallet),
    transactions: transactions.map((t) => WalletTransaction.toPublic(t)),
  });
}

async function topUpMyWallet(req, res) {
  const userId = req.auth.sub;
  const { amount } = req.body;

  if (amount === undefined || amount === null) {
    return res.status(400).json({ error: 'amount is required' });
  }

  const credit = Number(amount);
  if (!Number.isFinite(credit) || credit <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  const wallet = await getOrCreateWallet(userId);
  const updated = await Wallet.findByIdAndUpdate(
    wallet._id,
    { $inc: { balance: credit } },
    { new: true }
  );

  await WalletTransaction.create({
    walletId: wallet._id,
    userId,
    type: 'credit',
    amount: credit,
    reason: 'top_up',
    balanceAfter: updated.balance,
    meta: {},
  });

  return res.status(201).json({
    wallet: Wallet.toPublic(updated),
  });
}

module.exports = { getMyWallet, topUpMyWallet };
