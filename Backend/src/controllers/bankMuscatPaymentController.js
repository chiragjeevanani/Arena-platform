const bankMuscat = require('../providers/bankMuscat/bankMuscatService');
const { getBankMuscatConfig } = require('../providers/bankMuscat/bankMuscatConfig');

function frontendRedirect(result) {
  const cfg = getBankMuscatConfig();
  const base = cfg.returnUrl || `${cfg.frontendUrl}/payment/bank-muscat/return`;
  const url = new URL(base);
  url.searchParams.set('paymentId', result.paymentId);
  url.searchParams.set('status', result.status);
  if (result.purpose) url.searchParams.set('purpose', result.purpose);
  if (result.amount != null) url.searchParams.set('amount', String(result.amount));
  if (result.reason) url.searchParams.set('reason', String(result.reason).slice(0, 200));
  return url.toString();
}

async function createPayment(req, res) {
  const { purpose, bookingId, amount } = req.body || {};
  if (!purpose || !['top_up', 'booking'].includes(purpose)) {
    return res.status(400).json({ error: 'purpose must be top_up or booking' });
  }

  try {
    const payload = await bankMuscat.createBankMuscatPayment({
      userId: req.auth.sub,
      purpose,
      bookingId,
      amount,
      req,
    });
    return res.status(201).json(payload);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Failed to create payment' });
  }
}

async function handleCallback(req, res) {
  const cfg = getBankMuscatConfig();
  try {
    const result = await bankMuscat.handleBankMuscatCallback(req);
    return res.redirect(frontendRedirect(result));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Bank Muscat callback error:', err.message);
    const fallback = `${cfg.frontendUrl}/payment/bank-muscat/return?status=failed&reason=${encodeURIComponent(err.message || 'callback_failed')}`;
    return res.redirect(fallback);
  }
}

async function getStatus(req, res) {
  try {
    const payment = await bankMuscat.getPaymentStatusForUser(req.params.paymentId, req.auth.sub);
    return res.json({ payment });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Failed to load payment status' });
  }
}

module.exports = {
  createPayment,
  handleCallback,
  getStatus,
};
