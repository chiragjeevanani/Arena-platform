const Notification = require('../models/Notification');

async function listMyNotifications(req, res) {
  const notifications = await Notification.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);
  return res.json({ notifications });
}

async function markAsRead(req, res) {
  const { id } = req.params;
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: req.user.id },
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
    { userId: req.user.id, isRead: false },
    { isRead: true }
  );
  return res.json({ message: 'All notifications marked as read' });
}

async function deleteNotification(req, res) {
  const { id } = req.params;
  const notification = await Notification.findOneAndDelete({
    _id: id,
    userId: req.user.id,
  });
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  return res.json({ message: 'Notification deleted' });
}

module.exports = {
  listMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
