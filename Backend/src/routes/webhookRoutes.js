const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { confirmMockPayment } = require('../controllers/mockPaymentWebhookController');

const router = express.Router();

router.post('/payments/mock', asyncHandler(confirmMockPayment));

module.exports = router;
