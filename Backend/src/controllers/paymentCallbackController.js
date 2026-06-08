const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const { getOrCreateWallet } = require('../services/walletService');
const { decryptQueryToObj } = require('../utils/ccavenue');

async function handleCcavenueCallback(req, res) {
  const workingKey = process.env.CCAVENUE_WORKING_KEY;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!workingKey) {
    console.error('CCAVENUE_WORKING_KEY is not configured');
    return res.redirect(`${frontendUrl}/payment?error=Gateway+configuration+missing`);
  }

  const encResp = req.body.enc_response || req.body.encResponse || req.body.encResp;
  if (!encResp) {
    console.error('Missing encrypted response (enc_response/encResponse/encResp) in callback payload');
    return res.redirect(`${frontendUrl}/payment?error=Missing+gateway+response`);
  }

  let params;
  try {
    params = decryptQueryToObj(encResp, workingKey);
  } catch (err) {
    console.error('Failed to decrypt CCAvenue response:', err);
    return res.redirect(`${frontendUrl}/payment?error=Decryption+failed`);
  }

  const { order_id, order_status, amount, tracking_id, failure_message } = params;

  // Extract payment ID from order_id (format: BM_${paymentId})
  const paymentIdStr = order_id && order_id.startsWith('BM_') ? order_id.slice(3) : order_id;

  if (!paymentIdStr || !mongoose.isValidObjectId(paymentIdStr)) {
    console.error('Invalid order_id or paymentId in response:', order_id);
    return res.redirect(`${frontendUrl}/payment?error=Invalid+order+id`);
  }

  const status = order_status === 'Success' ? 'succeeded' : 'failed';

  // Find payment and update status if pending
  const claimed = await Payment.findOneAndUpdate(
    { _id: paymentIdStr, status: 'pending' },
    { $set: { status, meta: params } },
    { new: true }
  );

  if (!claimed) {
    const existing = await Payment.findById(paymentIdStr).lean();
    if (!existing) {
      console.error('Payment not found:', paymentIdStr);
      return res.redirect(`${frontendUrl}/payment?error=Payment+record+not+found`);
    }
    
    // If it was already marked succeeded, redirect to success
    if (existing.status === 'succeeded') {
      return res.redirect(`${frontendUrl}/booking-success?type=wallet_top_up&amount=${existing.amount}`);
    }
    
    return res.redirect(`${frontendUrl}/payment?error=Transaction+failed+or+already+processed`);
  }

  if (status === 'succeeded') {
    if (claimed.purpose === 'top_up') {
      try {
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
          meta: { paymentId: claimed._id.toString(), source: 'ccavenue_callback', trackingId: tracking_id },
        });
      } catch (walletErr) {
        console.error('Failed to credit wallet during callback:', walletErr);
        // Payment itself succeeded, but wallet credit failed. This requires admin intervention.
        return res.redirect(`${frontendUrl}/booking-success?type=wallet_top_up&amount=${claimed.amount}&warning=Wallet+credit+pending+validation`);
      }
    }
    
    return res.redirect(`${frontendUrl}/booking-success?type=wallet_top_up&amount=${claimed.amount}`);
  } else {
    const errMsg = failure_message ? encodeURIComponent(failure_message) : 'Payment+failed';
    return res.redirect(`${frontendUrl}/payment?error=${errMsg}`);
  }
}

module.exports = {
  handleCcavenueCallback,
};
