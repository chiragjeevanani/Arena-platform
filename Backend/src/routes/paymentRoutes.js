const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  createPayment,
  handleCallback,
  getStatus,
  getGatewayDiagnostics,
} = require('../controllers/bankMuscatPaymentController');

const router = express.Router();

// Public: Bank Muscat SmartPay browser return (no auth — bank posts here)
router.post('/bank-muscat/callback', asyncHandler(handleCallback));
// Public: safe config check (no secrets) — confirm live deploy/env
router.get('/bank-muscat/diagnostics', asyncHandler(getGatewayDiagnostics));

router.use(requireAuth);
router.use(requireRole('CUSTOMER', 'COACH', 'ARENA_ADMIN'));

router.post('/bank-muscat/create', asyncHandler(createPayment));
router.get('/bank-muscat/status/:paymentId', asyncHandler(getStatus));

module.exports = router;
