const Notification = require('../models/Notification');

async function listMyNotifications(req, res) {
  const notifications = await Notification.find({ userId: req.auth.sub })
    .sort({ createdAt: -1 })
    .limit(50);
  return res.json({ notifications });
}

async function markAsRead(req, res) {
  const { id } = req.params;
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: req.auth.sub },
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  return res.json({ notification });
}

async function markAllAsRead(req, res) {
  await Notification.updateMany(
    { userId: req.auth.sub, isRead: false },
    { isRead: true }
  );
  return res.json({ message: 'All notifications marked as read' });
}

async function deleteNotification(req, res) {
  const { id } = req.params;
  const notification = await Notification.findOneAndDelete({
    _id: id,
    userId: req.auth.sub,
  });
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  return res.json({ message: 'Notification deleted' });
}

const User = require('../models/User');

async function registerFcmToken(req, res) {
  const { token, platform } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  const platformValue = platform === 'app' ? 'app' : 'web';
  // Avoid duplicate registration by pulling any existing entry with this token first
  await User.findByIdAndUpdate(req.auth.sub, {
    $pull: { fcmTokens: { token } },
  });
  // Push the new token with its platform
  await User.findByIdAndUpdate(req.auth.sub, {
    $push: { fcmTokens: { token, platform: platformValue } },
  });
  return res.json({ message: 'FCM token registered successfully' });
}

async function deregisterFcmToken(req, res) {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  await User.findByIdAndUpdate(req.auth.sub, {
    $pull: { fcmTokens: { token } },
  });
  return res.json({ message: 'FCM token deregistered successfully' });
}

async function testRoute(req, res) {
  return res.json({ message: 'Notification route is working' });
}

module.exports = {
  listMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  registerFcmToken,
  deregisterFcmToken,
  testRoute,
};
