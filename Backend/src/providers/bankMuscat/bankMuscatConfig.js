/**
 * Bank Muscat SmartPay configuration.
 * Prefer BANK_MUSCAT_* env vars; CCAVENUE_* kept as aliases for existing deployments.
 *
 * Official Python kit ("Non Seamless 256 Bit Python 3 Muscat"):
 *   Test action URL:
 *   https://spayuattrns.bmtest.om/transaction.do?command=initiateTransaction
 */

function pick(...values) {
  for (const v of values) {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      return String(v).trim();
    }
  }
  return '';
}

function getBankMuscatConfig() {
  const env = pick(process.env.BANK_MUSCAT_ENV, process.env.NODE_ENV === 'production' ? 'production' : 'test') || 'test';
  const isProduction = env === 'production' || env === 'live';

  const merchantId = pick(process.env.BANK_MUSCAT_MID, process.env.CCAVENUE_MERCHANT_ID);
  const accessCode = pick(process.env.BANK_MUSCAT_ACCESS_CODE, process.env.CCAVENUE_ACCESS_CODE);
  const workingKey = pick(process.env.BANK_MUSCAT_WORKING_KEY, process.env.CCAVENUE_WORKING_KEY);

  // Exact UAT URL from official PHP NON_SEAMLESS_KIT + Python kit
  const testUrl = pick(
    process.env.BANK_MUSCAT_TEST_URL,
    process.env.CCAVENUE_GATEWAY_URL,
    'https://spayuattrns.bmtest.om/transaction.do?command=initiateTransaction'
  );

  // Alternate UAT host seen in PHP IFRAME / CUSTOM kits (not used unless set explicitly):
  // https://mti.bankmuscat.com:6443/transaction.do?command=initiateTransaction


  // Production URL must come from Bank Muscat live credentials / kit — do not invent.
  const productionUrl = pick(process.env.BANK_MUSCAT_PRODUCTION_URL);

  // In production mode, never fall back to the UAT gateway (spayuattrns.bmtest.om).
  // Doing so silently sends production-labeled credentials to Bank Muscat's UAT
  // servers, which reject them with "Merchant Authentication failed" (Error 10002)
  // instead of a clear config error.
  const gatewayUrl = isProduction
    ? pick(process.env.BANK_MUSCAT_GATEWAY_URL, productionUrl)
    : pick(process.env.BANK_MUSCAT_GATEWAY_URL, testUrl);

  const apiBase = pick(process.env.API_URL);
  const frontendUrl = pick(process.env.FRONTEND_URL, 'http://localhost:5173');

  const callbackUrl = pick(
    process.env.BANK_MUSCAT_CALLBACK_URL,
    apiBase ? `${apiBase.replace(/\/$/, '')}/payments/bank-muscat/callback` : ''
  );

  // If API_URL is https://ammarena.com/api, callback must be .../api/payments/...
  // Prefer explicit BANK_MUSCAT_CALLBACK_URL. Fallback above assumes routes live under API_URL.
  // When API_URL already ends with /api, do NOT append another /api.

  const returnUrl = pick(
    process.env.BANK_MUSCAT_RETURN_URL,
    `${frontendUrl.replace(/\/$/, '')}/payment/bank-muscat/return`
  );

  const configured = Boolean(merchantId && accessCode && workingKey && gatewayUrl);
  const cryptoRaw = pick(process.env.BANK_MUSCAT_CRYPTO, 'aes-256-gcm').toLowerCase();
  const cryptoMode =
    cryptoRaw.includes('cbc') || cryptoRaw === '128' ? 'aes-128-cbc' : 'aes-256-gcm';

  const defaultStatusApiUrl = isProduction
    ? 'https://smartpayapi.bankmuscat.com/apis/servlet/DoWebTrans'
    : 'https://spayuatapi.bmtest.om/apis/servlet/DoWebTrans';

  const statusApiUrl = pick(process.env.BANK_MUSCAT_STATUS_API_URL, defaultStatusApiUrl).replace(/\?$/, '');
  const refundApiUrl = pick(process.env.BANK_MUSCAT_REFUND_API_URL).replace(/\?$/, '');

  return {
    env,
    isProduction,
    merchantId,
    accessCode,
    workingKey,
    gatewayUrl,
    testUrl,
    productionUrl,
    callbackUrl,
    returnUrl,
    frontendUrl,
    apiBase,
    currency: 'OMR',
    configured,
    crypto: cryptoMode,
    statusApiUrl,
    refundApiUrl,
  };
}

module.exports = { getBankMuscatConfig };
