const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  listMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(listMyNotifications));
router.patch('/read-all', asyncHandler(markAllAsRead));
router.patch('/:id/read', asyncHandler(markAsRead));
router.delete('/:id', asyncHandler(deleteNotification));

module.exports = router;
