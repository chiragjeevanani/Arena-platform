const Referral = require('../models/Referral');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const ReferralSettings = require('../models/ReferralSettings');
const { getOrCreateWallet } = require('../services/walletService');

async function getMyReferrals(req, res) {
  const userId = req.auth.sub;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Ensure user has a referral code generated if they are an existing user
  if (!user.referralCode) {
    let code = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const prefix = (user.name || 'ARENA').replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || 'ARENA';
      const suffix = Math.floor(1000 + Math.random() * 9000);
      code = `${prefix}${suffix}`;
      const existing = await User.findOne({ referralCode: code });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }
    user.referralCode = code;
    await user.save();
  }

  // Get user's wallet
  const wallet = await getOrCreateWallet(userId);
  const settings = await ReferralSettings.getSettings();

  // Find all referrals where this user is the referrer
  const referrals = await Referral.find({ referrerId: userId })
    .populate('referredUserId', 'name email createdAt')
    .sort({ createdAt: -1 })
    .lean();

  // Aggregate stats
  let pendingCount = 0;
  let completedCount = 0;
  let expiredCount = 0;
  let totalEarned = 0;

  const referralList = referrals.map((r) => {
    if (r.status === 'completed') {
      completedCount++;
      totalEarned += r.rewardAmountReferrer;
    } else if (r.status === 'pending') {
      if (new Date() > new Date(r.expiryDate)) {
        r.status = 'expired';
        expiredCount++;
      } else {
        pendingCount++;
      }
    } else if (r.status === 'expired') {
      expiredCount++;
    }

    return {
      id: r._id.toString(),
      referredUser: {
        id: r.referredUserId?._id?.toString() || '',
        name: r.referredUserId?.name || 'Referred User',
        email: r.referredUserId?.email || '',
        joinedAt: r.referredUserId?.createdAt || null,
      },
      status: r.status,
      rewardAmount: r.rewardAmountReferrer,
      expiryDate: r.expiryDate,
      createdAt: r.createdAt,
    };
  });

  // Unique referral link
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const referralLink = `${frontendUrl}/auth/register?ref=${user.referralCode}`;

  return res.json({
    referralCode: user.referralCode,
    referralLink,
    walletBalance: wallet.balance,
    settings: ReferralSettings.toPublic(settings),
    stats: {
      totalReferrals: referrals.length,
      pendingCount,
      completedCount,
      expiredCount,
      totalEarned,
    },
    referrals: referralList,
  });
}

module.exports = { getMyReferrals };
