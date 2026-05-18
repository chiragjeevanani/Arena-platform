const ReferralSettings = require('../models/ReferralSettings');
const Referral = require('../models/Referral');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const { getOrCreateWallet } = require('../services/walletService');

// Fetch singleton settings
async function getReferralSettings(req, res) {
  const settings = await ReferralSettings.getSettings();
  return res.json({ settings: ReferralSettings.toPublic(settings) });
}

// Update settings
async function updateReferralSettings(req, res) {
  const { referralSystemEnabled, referrerReward, newuserReward, referralExpiryDays, minBookingAmountRequired, walletUsageEnabled } = req.body;

  const settings = await ReferralSettings.getSettings();

  if (referralSystemEnabled !== undefined) settings.referralSystemEnabled = !!referralSystemEnabled;
  if (walletUsageEnabled !== undefined) settings.walletUsageEnabled = !!walletUsageEnabled;
  if (referrerReward !== undefined) settings.referrerReward = Number(referrerReward);
  if (newuserReward !== undefined) settings.newuserReward = Number(newuserReward);
  if (referralExpiryDays !== undefined) settings.referralExpiryDays = Number(referralExpiryDays);
  if (minBookingAmountRequired !== undefined) settings.minBookingAmountRequired = Number(minBookingAmountRequired);

  await settings.save();

  return res.json({ settings: ReferralSettings.toPublic(settings) });
}

// Get all referrals with details for admin panel
async function getReferralsList(req, res) {
  const list = await Referral.find()
    .populate('referrerId', 'name email')
    .populate('referredUserId', 'name email')
    .populate('bookingId', 'amount date timeSlot')
    .sort({ createdAt: -1 })
    .lean();

  const formatted = list.map((r) => ({
    id: r._id.toString(),
    referrer: {
      id: r.referrerId?._id?.toString() || '',
      name: r.referrerId?.name || 'Unknown',
      email: r.referrerId?.email || '',
    },
    referredUser: {
      id: r.referredUserId?._id?.toString() || '',
      name: r.referredUserId?.name || 'Unknown',
      email: r.referredUserId?.email || '',
    },
    referralCode: r.referralCode,
    status: r.status,
    rewardAmountReferrer: r.rewardAmountReferrer,
    rewardAmountReferred: r.rewardAmountReferred,
    expiryDate: r.expiryDate,
    createdAt: r.createdAt,
    booking: r.bookingId ? {
      id: r.bookingId._id.toString(),
      amount: r.bookingId.amount,
      date: r.bookingId.date,
      timeSlot: r.bookingId.timeSlot,
    } : null,
  }));

  return res.json({ referrals: formatted });
}

// List all wallets
async function getWalletsList(req, res) {
  const list = await Wallet.find()
    .populate('userId', 'name email role')
    .sort({ balance: -1 })
    .lean();

  const formatted = list.map((w) => ({
    id: w._id.toString(),
    userId: w.userId?._id?.toString() || String(w.userId),
    userName: w.userId?.name || 'Unknown User',
    userEmail: w.userId?.email || '',
    userRole: w.userId?.role || 'CUSTOMER',
    balance: w.balance,
    createdAt: w.createdAt,
    updatedAt: w.updatedAt,
  }));

  return res.json({ wallets: formatted });
}

// Adjust balance manually
async function adjustWalletBalance(req, res) {
  const { userId, amount, type, reason } = req.body; // type: 'credit' | 'debit'

  if (!userId || !amount || !type) {
    return res.status(400).json({ error: 'userId, amount, and type are required' });
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  if (!['credit', 'debit'].includes(type)) {
    return res.status(400).json({ error: 'type must be credit or debit' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const wallet = await getOrCreateWallet(userId);

  if (type === 'debit' && wallet.balance < numericAmount) {
    return res.status(400).json({ error: 'Insufficient wallet balance for this debit adjustment' });
  }

  const increment = type === 'credit' ? numericAmount : -numericAmount;
  const updated = await Wallet.findByIdAndUpdate(
    wallet._id,
    { $inc: { balance: increment } },
    { new: true }
  );

  // Log in wallet transactions
  await WalletTransaction.create({
    walletId: wallet._id,
    userId,
    type,
    amount: numericAmount,
    reason: 'admin_adjustment',
    balanceAfter: updated.balance,
    meta: {
      reason: reason || 'Manual Admin Balance Adjustment',
      adjustedBy: req.auth.sub,
    },
  });

  return res.json({
    wallet: Wallet.toPublic(updated),
  });
}

module.exports = {
  getReferralSettings,
  updateReferralSettings,
  getReferralsList,
  getWalletsList,
  adjustWalletBalance,
};
