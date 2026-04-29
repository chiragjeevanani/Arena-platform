const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');

async function getOrCreateWallet(userId) {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId, balance: 0 });
  }
  return wallet;
}

async function deductFromWallet(userId, amount, reason, meta = {}) {
  const wallet = await getOrCreateWallet(userId);
  if (wallet.balance < amount) {
    throw new Error('Insufficient wallet balance');
  }

  const updated = await Wallet.findByIdAndUpdate(
    wallet._id,
    { $inc: { balance: -amount } },
    { new: true }
  );

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

module.exports = { getOrCreateWallet, deductFromWallet };
