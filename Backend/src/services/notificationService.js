const Notification = require('../models/Notification');

async function createNotification(userId, title, message, type = 'info', metadata = {}) {
  try {
    await Notification.create({
      userId,
      title,
      message,
      type,
      metadata,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to create notification:', err);
  }
}

module.exports = { createNotification };
