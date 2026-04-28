const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  createArena,
  createCourt,
  deleteCourt,
  patchArena,
  listAdminArenas,
  getAdminArena,
  updateCourt,
  deleteArena,
} = require('../controllers/adminArenaController');
const {
  listCourtSlots,
  listArenaSlots,
  createCourtSlot,
  deleteCourtSlot,
} = require('../controllers/adminSlotController');
const { uploadArenaImage } = require('../controllers/adminUploadController');
const {
  listAdminBookings,
  updateAdminBooking,
} = require('../controllers/adminBookingController');
const {
  createMembershipPlan,
  listMembershipPlans,
  patchMembershipPlan,
  deleteMembershipPlan,
  adminMembershipStats,
  listUserMemberships,
} = require('../controllers/adminMembershipPlanController');
const {
  createCoachingBatch,
  listCoachingBatches,
  updateCoachingBatch,
  deleteCoachingBatch,
} = require('../controllers/adminCoachingBatchController');
const {
  createInventoryItem,
  listInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
} = require('../controllers/adminInventoryController');
const { createPosSale, listPosSales, getPosSaleById } = require('../controllers/adminPosController');
const {
  createCmsContent,
  listCmsContent,
  updateCmsContent,
  deleteCmsContent,
} = require('../controllers/adminCmsController');
const { 
  listAdminUsers, 
  patchAdminUser, 
  createAdminUser 
} = require('../controllers/adminUserController');
const { adminReportSummary } = require('../controllers/adminReportController');
const {
  listSponsors,
  createSponsor,
  patchSponsor,
  deleteSponsor,
} = require('../controllers/adminSponsorController');
const { 
  listEventRegistrations, 
  updateRegistrationStatus 
} = require('../controllers/adminEventController');
const { listAdminArenaBlocks } = require('../controllers/adminAvailabilityController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('SUPER_ADMIN'));

router.get('/users', asyncHandler(listAdminUsers));
router.post('/users', asyncHandler(createAdminUser));
router.patch('/users/:id', asyncHandler(patchAdminUser));

router.get('/reports/summary', asyncHandler(adminReportSummary));

router.get('/sponsors', asyncHandler(listSponsors));
router.post('/sponsors', asyncHandler(createSponsor));
router.patch('/sponsors/:id', asyncHandler(patchSponsor));
router.delete('/sponsors/:id', asyncHandler(deleteSponsor));

router.get('/bookings', asyncHandler(listAdminBookings));
router.patch('/bookings/:bookingId', asyncHandler(updateAdminBooking));

router.get('/membership-plans/stats', asyncHandler(adminMembershipStats));
router.get('/memberships', asyncHandler(listUserMemberships));
router.post('/membership-plans', asyncHandler(createMembershipPlan));
router.get('/membership-plans', asyncHandler(listMembershipPlans));
router.patch('/membership-plans/:planId', asyncHandler(patchMembershipPlan));
router.delete('/membership-plans/:planId', asyncHandler(deleteMembershipPlan));

router.post('/coaching-batches', asyncHandler(createCoachingBatch));
router.get('/coaching-batches', asyncHandler(listCoachingBatches));
router.patch('/coaching-batches/:batchId', asyncHandler(updateCoachingBatch));
router.delete('/coaching-batches/:batchId', asyncHandler(deleteCoachingBatch));

router.post('/inventory', asyncHandler(createInventoryItem));
router.get('/inventory', asyncHandler(listInventoryItems));
router.patch('/inventory/:itemId', asyncHandler(updateInventoryItem));
router.delete('/inventory/:itemId', asyncHandler(deleteInventoryItem));

router.post('/pos/sales', asyncHandler(createPosSale));
router.get('/pos/sales', asyncHandler(listPosSales));
router.get('/pos/sales/:saleId', asyncHandler(getPosSaleById));

router.post('/cms', asyncHandler(createCmsContent));
router.get('/cms', asyncHandler(listCmsContent));
router.patch('/cms/:contentId', asyncHandler(updateCmsContent));
router.delete('/cms/:contentId', asyncHandler(deleteCmsContent));

router.get('/events/registrations', asyncHandler(listEventRegistrations));
router.patch('/events/registrations/:id', asyncHandler(updateRegistrationStatus));

router.get('/arenas', asyncHandler(listAdminArenas));
router.get('/arenas/:arenaId', asyncHandler(getAdminArena));
router.post('/arenas', asyncHandler(createArena));
router.patch('/arenas/:arenaId', asyncHandler(patchArena));
router.delete('/arenas/:arenaId', asyncHandler(deleteArena));
router.get('/arenas/:arenaId/blocks', asyncHandler(listAdminArenaBlocks));
router.post('/arenas/:arenaId/courts', asyncHandler(createCourt));
router.patch('/courts/:courtId', asyncHandler(updateCourt));
router.delete('/courts/:courtId', asyncHandler(deleteCourt));

router.get('/arenas/:arenaId/slots', asyncHandler(listArenaSlots));
router.get('/arenas/:arenaId/courts/:courtId/slots', asyncHandler(listCourtSlots));
router.post('/arenas/:arenaId/courts/:courtId/slots', asyncHandler(createCourtSlot));
router.delete('/slots/:slotId', asyncHandler(deleteCourtSlot));

router.post(
  '/upload/image',
  upload.single('file'),
  asyncHandler(uploadArenaImage)
);

module.exports = router;
