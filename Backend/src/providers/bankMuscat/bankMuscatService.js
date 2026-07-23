const mongoose = require('mongoose');
const Payment = require('../../models/Payment');
const Booking = require('../../models/Booking');
const User = require('../../models/User');
const { getBankMuscatConfig } = require('./bankMuscatConfig');
const { encrypt, decryptQueryToObj } = require('./bankMuscatCrypto');
const {
  mapGatewayOrderStatus,
  parsePaymentIdFromOrderId,
  amountsEqualOmr,
  buildMerchantParamString,
} = require('./bankMuscatMapper');
const { finalizeSuccessfulPayment, markPaymentTerminalFailure } = require('../../services/paymentFinalizationService');

const PROVIDER = 'bank_muscat';
const OPEN_STATUSES = ['created', 'initiated', 'pending'];
const ALLOWED_PURPOSES = ['top_up', 'booking', 'membership', 'enrollment'];

function sanitizeClientMeta(meta = {}) {
  const out = {};
  if (!meta || typeof meta !== 'object') return out;
  if (meta.planId) out.planId = String(meta.planId);
  if (meta.batchId) out.batchId = String(meta.batchId);
  if (meta.bookingId) out.bookingId = String(meta.bookingId);
  if (meta.eventId) out.eventId = String(meta.eventId);
  if (meta.eventName) out.eventName = String(meta.eventName).slice(0, 200);
  if (meta.registrantName) out.registrantName = String(meta.registrantName).slice(0, 120);
  if (meta.registrantPhone) out.registrantPhone = String(meta.registrantPhone).slice(0, 40);
  return out;
}

function assertConfigured() {
  const cfg = getBankMuscatConfig();
  if (!cfg.configured) {
    const err = new Error('Bank Muscat SmartPay is not configured');
    err.status = 503;
    throw err;
  }
  if (!cfg.callbackUrl) {
    const err = new Error('BANK_MUSCAT_CALLBACK_URL or API_URL must be set for gateway return');
    err.status = 503;
    throw err;
  }
  return cfg;
}

/**
 * Resolve trusted amount from DB (never trust client for court bookings).
 * Client amount is allowed for top_up / membership / enrollment / event registration.
 */
async function resolveTrustedAmount({ purpose, userId, bookingId, requestedAmount, meta = {} }) {
  if (purpose === 'booking') {
    if (bookingId && mongoose.isValidObjectId(bookingId)) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        const err = new Error('Booking not found');
        err.status = 404;
        throw err;
      }
      if (String(booking.userId) !== String(userId)) {
        const err = new Error('Booking does not belong to this user');
        err.status = 403;
        throw err;
      }
      if (booking.paymentStatus === 'paid') {
        const err = new Error('Booking is already paid');
        err.status = 409;
        throw err;
      }
      if (booking.status === 'cancelled') {
        const err = new Error('Cannot pay for a cancelled booking');
        err.status = 400;
        throw err;
      }
      const due = Number(booking.paidAmount > 0 ? booking.paidAmount : Math.max(0, booking.amount - (booking.walletUsed || 0)));
      if (!Number.isFinite(due) || due <= 0) {
        const err = new Error('No outstanding amount on this booking');
        err.status = 400;
        throw err;
      }
      return { amount: due, booking, currency: 'OMR' };
    }

    // Paid event registration (no Booking document) — client amount + eventId in meta
    if (meta.eventId) {
      const n = Number(requestedAmount);
      if (!Number.isFinite(n) || n <= 0) {
        const err = new Error('amount must be a positive number for event payments');
        err.status = 400;
        throw err;
      }
      return { amount: n, booking: null, currency: 'OMR' };
    }

    const err = new Error('bookingId is required for booking payments');
    err.status = 400;
    throw err;
  }

  if (purpose === 'top_up' || purpose === 'membership' || purpose === 'enrollment') {
    const n = Number(requestedAmount);
    if (!Number.isFinite(n) || n <= 0) {
      const err = new Error(`amount must be a positive number for ${purpose}`);
      err.status = 400;
      throw err;
    }
    return { amount: n, booking: null, currency: 'OMR' };
  }

  const err = new Error('Unsupported payment purpose');
  err.status = 400;
  throw err;
}

async function findReusablePendingPayment({ userId, purpose, bookingId, amount }) {
  const query = {
    userId,
    purpose,
    provider: PROVIDER,
    status: { $in: OPEN_STATUSES },
    amount,
  };
  if (bookingId) {
    query['meta.bookingId'] = String(bookingId);
  }
  const since = new Date(Date.now() - 30 * 60 * 1000);
  query.createdAt = { $gte: since };
  return Payment.findOne(query).sort({ createdAt: -1 });
}

function buildRedirectPayload(payment, cfg, encRequest) {
  return {
    payment: Payment.toPublic(payment),
    provider: PROVIDER,
    // Legacy alias for existing frontend branches
    legacyProvider: 'ccavenue',
    paymentUrl: cfg.gatewayUrl,
    encRequest,
    accessCode: cfg.accessCode,
    merchantId: cfg.merchantId,
    orderId: payment.merchantTransactionReference || `BM_${payment._id.toString()}`,
  };
}

/**
 * Create (or reuse) a pending Bank Muscat payment and return redirect fields.
 * Access code is returned for the browser form POST only (not the working key).
 */
async function createBankMuscatPayment({ userId, purpose, bookingId, amount, meta = {}, req }) {
  if (!ALLOWED_PURPOSES.includes(purpose)) {
    const err = new Error(`purpose must be one of: ${ALLOWED_PURPOSES.join(', ')}`);
    err.status = 400;
    throw err;
  }
  const cfg = assertConfigured();
  const safeMeta = sanitizeClientMeta(meta);
  const trusted = await resolveTrustedAmount({
    purpose,
    userId,
    bookingId,
    requestedAmount: amount,
    meta: safeMeta,
  });

  let payment = await findReusablePendingPayment({
    userId,
    purpose,
    bookingId: trusted.booking?._id?.toString() || bookingId,
    amount: trusted.amount,
  });

  if (!payment) {
    payment = await Payment.create({
      userId,
      amount: trusted.amount,
      currency: trusted.currency,
      purpose,
      status: 'created',
      provider: PROVIDER,
      merchantId: cfg.merchantId,
      initiatedAt: new Date(),
      meta: {
        ...safeMeta,
        bookingId: trusted.booking ? trusted.booking._id.toString() : safeMeta.bookingId,
      },
    });
    const merchantRef = `BM_${payment._id.toString()}`;
    payment.merchantTransactionReference = merchantRef;
    payment.internalTransactionId = merchantRef;
    payment.status = 'initiated';
    await payment.save();
  }

  const user = await User.findById(userId).lean();
  const callbackUrl = cfg.callbackUrl;

  const paramString = buildMerchantParamString({
    tid: String(Date.now()),
    merchant_id: cfg.merchantId,
    order_id: payment.merchantTransactionReference,
    amount: Number(trusted.amount).toFixed(3),
    currency: 'OMR',
    redirect_url: callbackUrl,
    cancel_url: callbackUrl,
    language: 'EN',
    billing_name: user?.name || '',
    billing_email: user?.email || '',
    billing_tel: user?.phone || '',
    billing_country: 'Oman',
  });

  const encRequest = encrypt(paramString, cfg.workingKey);

  payment.status = 'pending';
  payment.meta = {
    ...(payment.meta || {}),
    gatewayEnv: cfg.env,
    lastInitiatedAt: new Date().toISOString(),
  };
  await payment.save();

  return buildRedirectPayload(payment, cfg, encRequest);
}

/**
 * Handle SmartPay browser POST callback (encResp / enc_response).
 * Never trusts frontend; verifies decrypt + amount + order mapping.
 */
async function handleBankMuscatCallback(req) {
  const cfg = assertConfigured();
  const encResp = req.body.encResp || req.body.enc_response || req.body.encResponse;
  if (!encResp) {
    const err = new Error('Missing encrypted gateway response (encResp)');
    err.status = 400;
    throw err;
  }

  let params;
  try {
    params = decryptQueryToObj(encResp, cfg.workingKey);
  } catch (e) {
    const err = new Error('Failed to decrypt SmartPay response');
    err.status = 400;
    err.cause = e;
    throw err;
  }

  // Never log full decrypted payload (may contain PII); keep only safe refs in meta later.
  const orderId = params.order_id;
  const orderStatus = params.order_status;
  const trackingId = params.tracking_id;
  const bankRef = params.bank_ref_no;
  const failureMessage = params.failure_message || params.status_message || '';
  const responseCode = params.response_code || params.status_code || '';

  const paymentIdStr = parsePaymentIdFromOrderId(orderId);
  if (!paymentIdStr || !mongoose.isValidObjectId(paymentIdStr)) {
    const err = new Error('Invalid order_id in gateway response');
    err.status = 400;
    throw err;
  }

  const payment = await Payment.findById(paymentIdStr);
  if (!payment) {
    const err = new Error('Payment record not found');
    err.status = 404;
    throw err;
  }

  if (payment.provider !== PROVIDER && payment.provider !== 'ccavenue') {
    const err = new Error('Payment provider mismatch');
    err.status = 400;
    throw err;
  }

  if (!amountsEqualOmr(params.amount, payment.amount)) {
    await markPaymentTerminalFailure(payment._id, {
      status: 'failed',
      failureReason: 'Amount mismatch between gateway response and payment record',
      providerResponseCode: responseCode,
      providerResponseMessage: failureMessage,
      providerTransactionId: trackingId || bankRef,
      safeMeta: {
        order_status: orderStatus,
        amountMismatch: true,
        gatewayAmount: params.amount,
      },
    });
    return { paymentId: payment._id.toString(), status: 'failed', reason: 'amount_mismatch' };
  }

  const mapped = mapGatewayOrderStatus(orderStatus);

  // PHP kit validates order_id + currency + amount on Success
  if (mapped === 'succeeded') {
    const currencyOk = !params.currency || String(params.currency).toUpperCase() === 'OMR';
    const orderOk =
      !params.order_id ||
      String(params.order_id) === String(payment.merchantTransactionReference) ||
      String(params.order_id) === `BM_${payment._id.toString()}` ||
      String(params.order_id) === payment._id.toString();

    if (!currencyOk || !orderOk || !amountsEqualOmr(params.amount, payment.amount)) {
      await markPaymentTerminalFailure(payment._id, {
        status: 'failed',
        failureReason: 'Security check failed (order/currency/amount mismatch)',
        providerResponseCode: responseCode,
        providerResponseMessage: failureMessage,
        providerTransactionId: trackingId || bankRef,
        safeMeta: {
          order_status: orderStatus,
          securityError: true,
          gatewayAmount: params.amount,
          gatewayCurrency: params.currency,
          gatewayOrderId: params.order_id,
        },
      });
      return { paymentId: payment._id.toString(), status: 'failed', reason: 'security_mismatch' };
    }

    const result = await finalizeSuccessfulPayment(payment._id, {
      providerTransactionId: trackingId || bankRef || '',
      providerResponseCode: responseCode,
      providerResponseMessage: params.status_message || 'Success',
      safeMeta: {
        order_status: orderStatus,
        tracking_id: trackingId,
        bank_ref_no: bankRef,
        payment_mode: params.payment_mode,
        card_name: params.card_name ? '[redacted]' : undefined,
      },
    });
    return {
      paymentId: payment._id.toString(),
      status: 'succeeded',
      alreadyProcessed: Boolean(result.alreadyProcessed),
      purpose: payment.purpose,
      amount: payment.amount,
    };
  }

  if (mapped === 'pending') {
    await Payment.findByIdAndUpdate(payment._id, {
      $set: {
        status: 'pending',
        providerTransactionId: trackingId || bankRef || payment.providerTransactionId,
        providerResponseCode: responseCode,
        providerResponseMessage: failureMessage || orderStatus,
        'meta.order_status': orderStatus,
      },
    });
    return { paymentId: payment._id.toString(), status: 'pending', purpose: payment.purpose, amount: payment.amount };
  }

  await markPaymentTerminalFailure(payment._id, {
    status: mapped,
    failureReason: failureMessage || orderStatus || 'Payment failed',
    providerResponseCode: responseCode,
    providerResponseMessage: failureMessage || orderStatus,
    providerTransactionId: trackingId || bankRef,
    safeMeta: { order_status: orderStatus },
  });

  return {
    paymentId: payment._id.toString(),
    status: mapped,
    purpose: payment.purpose,
    amount: payment.amount,
    reason: failureMessage || orderStatus,
  };
}

async function getPaymentStatusForUser(paymentId, userId) {
  if (!mongoose.isValidObjectId(paymentId)) {
    const err = new Error('Invalid paymentId');
    err.status = 400;
    throw err;
  }
  const payment = await Payment.findById(paymentId).lean();
  if (!payment) {
    const err = new Error('Payment not found');
    err.status = 404;
    throw err;
  }
  if (String(payment.userId) !== String(userId)) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  return Payment.toPublic(payment);
}

/**
 * Remote order-status API — only when BANK_MUSCAT_STATUS_API_URL is provided by the bank kit.
 * Do not invent request shapes; leave unimplemented until kit fields are confirmed.
 */
async function queryRemotePaymentStatus(_paymentId) {
  const cfg = getBankMuscatConfig();
  if (!cfg.statusApiUrl) {
    const err = new Error(
      'Remote SmartPay status API is not configured. Set BANK_MUSCAT_STATUS_API_URL from the official kit before enabling reconciliation.'
    );
    err.status = 501;
    throw err;
  }
  const err = new Error(
    'Remote SmartPay status API URL is set, but request/response mapping from the official kit is not yet wired. Do not invent parameters.'
  );
  err.status = 501;
  throw err;
}

async function refundPayment() {
  const err = new Error(
    'Bank Muscat refund API is not implemented: official kit refund endpoint/credentials were not provided in-repo. Do not mark refunded locally without bank confirmation.'
  );
  err.status = 501;
  throw err;
}

async function voidPayment() {
  const err = new Error(
    'Bank Muscat void/reversal API is not implemented: official kit void endpoint was not provided in-repo.'
  );
  err.status = 501;
  throw err;
}

module.exports = {
  PROVIDER,
  createBankMuscatPayment,
  handleBankMuscatCallback,
  getPaymentStatusForUser,
  queryRemotePaymentStatus,
  refundPayment,
  voidPayment,
  getBankMuscatConfig,
};
