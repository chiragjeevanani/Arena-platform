const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const {
  listPublishedArenas,
  getPublishedArenaById,
} = require('../controllers/publicArenaController');
const { getCourtAvailability } = require('../controllers/publicAvailabilityController');
const { listPublishedArenaMembershipPlans } = require('../controllers/publicMembershipPlansController');
const { listPublishedArenaCoachingBatches } = require('../controllers/publicCoachingBatchController');
const { listPublishedCms, getPublishedCmsById } = require('../controllers/publicCmsController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/arenas', asyncHandler(listPublishedArenas));
router.get('/arenas/:id', asyncHandler(getPublishedArenaById));
router.get('/arenas/:arenaId/membership-plans', asyncHandler(listPublishedArenaMembershipPlans));
router.get('/arenas/:arenaId/coaching-batches', asyncHandler(listPublishedArenaCoachingBatches));
router.get('/courts/:courtId/availability', asyncHandler(getCourtAvailability));
router.get('/cms', asyncHandler(listPublishedCms));
router.get('/cms/:id', asyncHandler(getPublishedCmsById));

const { registerForEvent } = require('../controllers/publicEventController');
router.post('/events/register', optionalAuth, asyncHandler(registerForEvent));

module.exports = router;
