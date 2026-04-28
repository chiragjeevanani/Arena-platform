const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  requireArenaStaff,
  requireQueryArenaMatchesScope,
  requireBodyArenaIdMatchesScope,
  requireBookingInArenaScope,
  requireCoachingBatchInArenaScope,
  requireInventoryItemInArenaScope,
  requireCmsContentInArenaScope,
  requireCourtInArenaScope,
  requireBlockInArenaScope,
  requireSaleInArenaScope,
} = require('../middleware/arenaStaffScope');
const {
  listAdminBookings,
  updateAdminBooking,
} = require('../controllers/adminBookingController');
const { uploadArenaImage } = require('../controllers/adminUploadController');
const {
  createMembershipPlan,
  listMembershipPlans,
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
  getMyArena,
  patchMyArena
} = require('../controllers/arenaAdminArenaController');
const {
  listMyCourts,
  createMyCourt,
  patchMyCourt,
  deleteMyCourt,
  listMyCourtSlots,
  createMyCourtSlot,
  deleteMyCourtSlot
} = require('../controllers/arenaAdminCourtController');
const {
  listMyBlocks,
  createMyBlock,
  deleteMyBlock,
  getBlockSummary
} = require('../controllers/arenaAdminBlockController');
const {
  getWalkinCourts,
  getWalkinSlots,
  createWalkinBooking,
  searchWalkinCustomers,
  createWalkinCustomer,
} = require('../controllers/arenaAdminWalkinController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();

router.use(requireAuth);
router.use(asyncHandler(requireArenaStaff));

router.get('/bookings', requireQueryArenaMatchesScope, asyncHandler(listAdminBookings));
router.patch(
  '/bookings/:bookingId',
  asyncHandler(requireBookingInArenaScope),
  asyncHandler(updateAdminBooking)
);

router.post(
  '/membership-plans',
  requireBodyArenaIdMatchesScope,
  asyncHandler(createMembershipPlan)
);
router.get(
  '/membership-plans',
  requireQueryArenaMatchesScope,
  asyncHandler(listMembershipPlans)
);

router.post(
  '/coaching-batches',
  requireBodyArenaIdMatchesScope,
  asyncHandler(createCoachingBatch)
);
router.get(
  '/coaching-batches',
  requireQueryArenaMatchesScope,
  asyncHandler(listCoachingBatches)
);
router.patch(
  '/coaching-batches/:batchId',
  asyncHandler(requireCoachingBatchInArenaScope),
  asyncHandler(updateCoachingBatch)
);

router.post('/inventory', requireBodyArenaIdMatchesScope, asyncHandler(createInventoryItem));
router.get('/inventory', requireQueryArenaMatchesScope, asyncHandler(listInventoryItems));
router.patch(
  '/inventory/:itemId',
  asyncHandler(requireInventoryItemInArenaScope),
  asyncHandler(updateInventoryItem)
);
router.delete(
  '/inventory/:itemId',
  asyncHandler(requireInventoryItemInArenaScope),
  asyncHandler(deleteInventoryItem)
);

router.post('/pos/sales', requireBodyArenaIdMatchesScope, asyncHandler(createPosSale));
router.get('/pos/sales', requireQueryArenaMatchesScope, asyncHandler(listPosSales));
router.get(
  '/pos/sales/:saleId',
  asyncHandler(requireSaleInArenaScope),
  asyncHandler(getPosSaleById)
);

router.post('/cms', requireBodyArenaIdMatchesScope, asyncHandler(createCmsContent));
router.get('/cms', requireQueryArenaMatchesScope, asyncHandler(listCmsContent));
router.patch(
  '/cms/:contentId',
  asyncHandler(requireCmsContentInArenaScope),
  asyncHandler(updateCmsContent)
);
router.delete(
  '/cms/:contentId',
  asyncHandler(deleteCmsContent)
);

// Arena self-management
router.get('/arena', asyncHandler(getMyArena));
router.patch('/arena', asyncHandler(patchMyArena));
router.post('/upload/image', upload.single('file'), asyncHandler(uploadArenaImage));

// Courts
router.get('/courts', asyncHandler(listMyCourts));
router.post('/courts', asyncHandler(createMyCourt));
router.patch('/courts/:courtId', asyncHandler(requireCourtInArenaScope), asyncHandler(patchMyCourt));
router.delete('/courts/:courtId', asyncHandler(requireCourtInArenaScope), asyncHandler(deleteMyCourt));

// Slots
router.get('/courts/:courtId/slots', asyncHandler(listMyCourtSlots));
router.post('/courts/:courtId/slots', asyncHandler(createMyCourtSlot));
router.delete('/slots/:slotId', asyncHandler(deleteMyCourtSlot));

// Availability Blocks
router.get('/blocks', asyncHandler(listMyBlocks));
router.get('/blocks/summary', asyncHandler(getBlockSummary));
router.post('/blocks', asyncHandler(createMyBlock));
router.delete('/blocks/:blockId', asyncHandler(requireBlockInArenaScope), asyncHandler(deleteMyBlock));

// Walk-In Booking (staff can book on behalf of a customer)
router.get('/walkin/courts', asyncHandler(getWalkinCourts));
router.get('/walkin/slots', asyncHandler(getWalkinSlots));
router.get('/walkin/customers/search', asyncHandler(searchWalkinCustomers));
router.post('/walkin/customers', asyncHandler(createWalkinCustomer));
router.post('/walkin/book', asyncHandler(createWalkinBooking));

module.exports = router;
