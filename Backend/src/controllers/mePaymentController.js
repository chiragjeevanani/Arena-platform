const Payment = require('../models/Payment');
const User = require('../models/User');
const ccavenue = require('../utils/ccavenue');

const ALLOWED_PURPOSES = ['top_up', 'booking'];

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

  const merchantId = process.env.CCAVENUE_MERCHANT_ID;
  const accessCode = process.env.CCAVENUE_ACCESS_CODE;
  const workingKey = process.env.CCAVENUE_WORKING_KEY;
  const gatewayUrl = process.env.CCAVENUE_GATEWAY_URL;

  const isCcavenueConfigured = merchantId && accessCode && workingKey && gatewayUrl;
  const provider = isCcavenueConfigured ? 'ccavenue' : 'mock';

  const meta = {};
  if (purpose === 'booking' && req.body.bookingId) {
    meta.bookingId = String(req.body.bookingId);
  }

  const payment = await Payment.create({
    userId: req.auth.sub,
    amount: n,
    purpose,
    status: 'pending',
    provider,
    meta,
  });

  if (isCcavenueConfigured) {
    const user = await User.findById(req.auth.sub).lean();
    const apiBase = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUrl = `${apiBase}/api/me/payments/ccavenue/callback`;

    // Construct parameter string for CCAvenue
    const params = [
      `merchant_id=${encodeURIComponent(merchantId)}`,
      `order_id=BM_${payment._id.toString()}`,
      `amount=${n.toFixed(3)}`,
      `currency=OMR`,
      `redirect_url=${encodeURIComponent(redirectUrl)}`,
      `cancel_url=${encodeURIComponent(redirectUrl)}`,
      `language=EN`,
      `billing_name=${encodeURIComponent(user?.name || '')}`,
      `billing_email=${encodeURIComponent(user?.email || '')}`,
      `billing_tel=${encodeURIComponent(user?.phone || '')}`,
    ].join('&');

    try {
      const encRequest = ccavenue.encrypt(params, workingKey);
      return res.status(201).json({
        payment: Payment.toPublic(payment),
        provider: 'ccavenue',
        paymentUrl: gatewayUrl,
        encRequest,
        accessCode,
      });
    } catch (encryptErr) {
      console.error('CCAvenue encryption error:', encryptErr);
      // Fallback to error
      return res.status(500).json({ error: 'Failed to initiate secure bank payment' });
    }
  }

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

