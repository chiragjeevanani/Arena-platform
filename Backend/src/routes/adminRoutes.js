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
} = require('../controllers/adminArenaController');
const {
  listCourtSlots,
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
} = require('../controllers/adminMembershipPlanController');
const {
  createCoachingBatch,
  listCoachingBatches,
  updateCoachingBatch,
} = require('../controllers/adminCoachingBatchController');
const {
  createInventoryItem,
  listInventoryItems,
  updateInventoryItem,
} = require('../controllers/adminInventoryController');
const { createPosSale, listPosSales } = require('../controllers/adminPosController');
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

router.post('/membership-plans', asyncHandler(createMembershipPlan));
router.get('/membership-plans', asyncHandler(listMembershipPlans));
router.patch('/membership-plans/:planId', asyncHandler(patchMembershipPlan));

router.post('/coaching-batches', asyncHandler(createCoachingBatch));
router.get('/coaching-batches', asyncHandler(listCoachingBatches));
router.patch('/coaching-batches/:batchId', asyncHandler(updateCoachingBatch));

router.post('/inventory', asyncHandler(createInventoryItem));
router.get('/inventory', asyncHandler(listInventoryItems));
router.patch('/inventory/:itemId', asyncHandler(updateInventoryItem));

router.post('/pos/sales', asyncHandler(createPosSale));
router.get('/pos/sales', asyncHandler(listPosSales));

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
router.get('/arenas/:arenaId/blocks', asyncHandler(listAdminArenaBlocks));
router.post('/arenas/:arenaId/courts', asyncHandler(createCourt));
router.patch('/courts/:courtId', asyncHandler(updateCourt));
router.delete('/courts/:courtId', asyncHandler(deleteCourt));

router.get('/arenas/:arenaId/courts/:courtId/slots', asyncHandler(listCourtSlots));
router.post('/arenas/:arenaId/courts/:courtId/slots', asyncHandler(createCourtSlot));
router.delete('/slots/:slotId', asyncHandler(deleteCourtSlot));

router.post(
  '/upload/image',
  upload.single('file'),
  asyncHandler(uploadArenaImage)
);

module.exports = router;
