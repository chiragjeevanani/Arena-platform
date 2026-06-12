const crypto = require('crypto');

let _instance = null;

function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function getRazorpayInstance() {
  if (!isRazorpayConfigured()) {
    throw new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
  if (!_instance) {
    const Razorpay = require('razorpay');
    _instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _instance;
}

/**
 * Create a Razorpay order.
 * @param {object} opts
 * @param {number} opts.amountInSmallestUnit - e.g. paise for INR, 1000x for OMR
 * @param {string} opts.currency
 * @param {string} opts.receipt - unique receipt id
 * @param {object} [opts.notes]
 */
async function createOrder({ amountInSmallestUnit, currency = 'INR', receipt, notes = {} }) {
  const rzp = getRazorpayInstance();
  const order = await rzp.orders.create({
    amount: Math.round(amountInSmallestUnit),
    currency,
    receipt,
    notes,
  });
  return order;
}

/**
 * Verify Razorpay payment signature (HMAC-SHA256).
 * Throws if invalid.
 */
function verifySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSig = crypto.createHmac('sha256', secret).update(body).digest('hex');
  if (expectedSig !== razorpaySignature) {
    const err = new Error('Payment signature verification failed');
    err.status = 400;
    throw err;
  }
}

module.exports = { isRazorpayConfigured, createOrder, verifySignature };
