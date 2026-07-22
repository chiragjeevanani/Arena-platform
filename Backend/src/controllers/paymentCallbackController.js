/**
 * Legacy CCAvenue callback path — delegates to Bank Muscat SmartPay handler.
 * Prefer /api/payments/bank-muscat/callback going forward.
 */
const { handleCallback } = require('./bankMuscatPaymentController');

async function handleCcavenueCallback(req, res) {
  return handleCallback(req, res);
}

module.exports = {
  handleCcavenueCallback,
};
