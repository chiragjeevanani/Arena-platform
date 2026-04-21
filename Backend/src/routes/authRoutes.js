const express = require('express');
const {
  register,
  login,
  me,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  verifyOtp,
  coachRegister,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { createAuthIpRateLimiter } = require('../middleware/rateLimitAuth');

const router = express.Router();
const authRateLimit = createAuthIpRateLimiter();

router.post('/register', authRateLimit, asyncHandler(register));
router.post('/coach-register', authRateLimit, asyncHandler(coachRegister));
router.post('/login', authRateLimit, asyncHandler(login));
router.post('/refresh', authRateLimit, asyncHandler(refresh));
router.post('/logout', authRateLimit, asyncHandler(logout));
router.post('/forgot-password', authRateLimit, asyncHandler(forgotPassword));
router.post('/reset-password', authRateLimit, asyncHandler(resetPassword));
router.post('/verify-otp', authRateLimit, asyncHandler(verifyOtp));
router.get('/me', requireAuth, asyncHandler(me));

module.exports = router;
