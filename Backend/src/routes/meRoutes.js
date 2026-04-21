const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  createMyBooking,
  listMyBookings,
  cancelMyBooking,
} = require('../controllers/meBookingController');
const { getMyWallet, topUpMyWallet } = require('../controllers/meWalletController');
const { listMyMemberships, purchaseMembership } = require('../controllers/meMembershipController');
const {
  createMyEnrollment,
  listMyEnrollments,
  cancelMyEnrollment,
} = require('../controllers/meEnrollmentController');
const { createPaymentIntent, listMyPayments } = require('../controllers/mePaymentController');
const { patchMyProfile } = require('../controllers/meProfileController');
const { listMyAttendance } = require('../controllers/meAttendanceController');
const { listMyEventRegistrations } = require('../controllers/meEventController');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('CUSTOMER'));

router.post('/bookings', asyncHandler(createMyBooking));
router.get('/bookings', asyncHandler(listMyBookings));
router.patch('/bookings/:id/cancel', asyncHandler(cancelMyBooking));

router.get('/wallet', asyncHandler(getMyWallet));
router.post('/wallet/top-up', asyncHandler(topUpMyWallet));

router.get('/memberships', asyncHandler(listMyMemberships));
router.post('/memberships/purchase', asyncHandler(purchaseMembership));

router.post('/enrollments', asyncHandler(createMyEnrollment));
router.get('/enrollments', asyncHandler(listMyEnrollments));
router.patch('/enrollments/:id/cancel', asyncHandler(cancelMyEnrollment));

router.post('/payments/intent', asyncHandler(createPaymentIntent));
router.get('/payments', asyncHandler(listMyPayments));

router.patch('/profile', asyncHandler(patchMyProfile));
router.get('/attendance', asyncHandler(listMyAttendance));
router.get('/event-registrations', asyncHandler(listMyEventRegistrations));

module.exports = router;
