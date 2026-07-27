/**
 * Maps SmartPay (CCAvenue-compatible) response fields to internal payment states.
 * Official order_status values observed in SmartPay/CCAvenue kits:
 * Success | Failure | Aborted | Timeout | Invalid | Awaited
 */

const SUCCESS_STATUSES = new Set(['Success', 'Successful', 'success']);
const CANCEL_STATUSES = new Set(['Aborted', 'aborted', 'Cancelled', 'Canceled']);
const EXPIRED_STATUSES = new Set(['Timeout', 'timeout', 'Expired']);
const PENDING_STATUSES = new Set(['Awaited', 'Pending', 'pending', 'Initiated']);

function mapGatewayOrderStatus(orderStatus) {
  const raw = String(orderStatus || '').trim();
  if (SUCCESS_STATUSES.has(raw)) return 'succeeded';
  if (CANCEL_STATUSES.has(raw)) return 'cancelled';
  if (EXPIRED_STATUSES.has(raw)) return 'expired';
  if (PENDING_STATUSES.has(raw)) return 'pending';
  if (!raw) return 'failed';
  return 'failed';
}

function parsePaymentIdFromOrderId(orderId) {
  if (!orderId) return null;
  const raw = String(orderId).trim();
  if (raw.startsWith('BM_')) return raw.slice(3);
  return raw;
}

function amountsEqualOmr(a, b) {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isFinite(na) || !Number.isFinite(nb)) return false;
  return Math.abs(na - nb) < 0.001;
}

function phpUrlEncode(value) {
  // Matches PHP urlencode() used in NON_SEAMLESS_KIT/ccavRequestHandler.php
  return encodeURIComponent(String(value))
    .replace(/%20/g, '+')
    .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function buildMerchantParamString(fields) {
  // Official PHP NON_SEAMLESS kit always appends trailing '&' after each pair:
  // foreach ($_POST as $key => $value) { $merchant_data .= $key.'='.urlencode($value).'&'; }
  let out = '';
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null) continue;
    out += `${k}=${phpUrlEncode(v)}&`;
  }
  return out;
}

module.exports = {
  mapGatewayOrderStatus,
  parsePaymentIdFromOrderId,
  amountsEqualOmr,
  buildMerchantParamString,
  phpUrlEncode,
  SUCCESS_STATUSES,
};
