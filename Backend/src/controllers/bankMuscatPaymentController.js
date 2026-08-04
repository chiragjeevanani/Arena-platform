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
  const { purpose, bookingId, amount, planId, batchId, eventId, eventName, registrantName, registrantPhone, registrationId } =
    req.body || {};
  if (!purpose || !['top_up', 'booking', 'membership', 'enrollment'].includes(purpose)) {
    return res.status(400).json({ error: 'purpose must be top_up, booking, membership, or enrollment' });
  }

  try {
    const payload = await bankMuscat.createBankMuscatPayment({
      userId: req.auth.sub,
      purpose,
      bookingId,
      amount,
      meta: {
        planId,
        batchId,
        bookingId,
        eventId,
        eventName,
        registrantName,
        registrantPhone,
        registrationId,
      },
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
    const hintStatus = req.query.status || req.query.hintStatus;
    const payment = await bankMuscat.getPaymentStatusForUser(req.params.paymentId, req.auth.sub, { hintStatus });
    return res.json({ payment });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Failed to load payment status' });
  }
}

/**
 * Second-leg security: call SmartPay Status/Inquiry API and sync local payment.
 * Mandatory per Bank Muscat go-live checklist when real-time response is unclear.
 */
async function inquireStatus(req, res) {
  try {
    // Ensure the payment belongs to the caller first
    await bankMuscat.getPaymentStatusForUser(req.params.paymentId, req.auth.sub);
    const result = await bankMuscat.queryRemotePaymentStatus(req.params.paymentId);
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Status inquiry failed' });
  }
}

/** Non-secret diagnostics so you can verify live server env/crypto without exposing keys. */
async function getGatewayDiagnostics(_req, res) {
  const cfg = getBankMuscatConfig();
  const hostOf = (u) => {
    try {
      return new URL(u).host;
    } catch {
      return null;
    }
  };
  return res.json({
    configured: cfg.configured,
    env: cfg.env,
    crypto: cfg.crypto,
    mid: cfg.merchantId || null,
    accessCodeLength: (cfg.accessCode || '').length,
    workingKeyLength: (cfg.workingKey || '').length,
    gatewayHost: hostOf(cfg.gatewayUrl),
    callbackHost: hostOf(cfg.callbackUrl),
    returnHost: hostOf(cfg.returnUrl),
    statusApiHost: hostOf(cfg.statusApiUrl),
    inquiryApiImplemented: Boolean(cfg.statusApiUrl),
    note: 'Error 10002 is Bank Muscat merchant auth (access_code / URL whitelist / encrypt mismatch). Console CSP errors on transaction.do are Bank Muscat page bugs — ignore them.',
  });
}

module.exports = {
  createPayment,
  handleCallback,
  getStatus,
  inquireStatus,
  getGatewayDiagnostics,
};
