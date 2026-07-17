const User = require('../models/User');
const { messaging } = require('../config/firebase');

async function sendPushNotification(userId, title, body, data = {}) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      return;
    }

    // Extract token strings from the objects (supporting both string array and object array formats)
    const tokenStrings = user.fcmTokens
      .map((t) => (typeof t === 'string' ? t : t?.token))
      .filter(Boolean);

    if (tokenStrings.length === 0) {
      return;
    }

    if (!messaging) {
      // eslint-disable-next-line no-console
      console.log(`[MOCK PUSH] Sent to user ${userId} (${user.email}): Title: "${title}", Body: "${body}", Data:`, data);
      return;
    }

    // FCM payload
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        click_action: data.click_action || '/notifications',
      },
      tokens: tokenStrings,
    };

    const response = await messaging.sendEachForMulticast(message);

    // Clean up stale/invalid tokens
    const tokensToRemove = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const error = resp.error;
        if (
          error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered'
        ) {
          tokensToRemove.push(tokenStrings[idx]);
        }
      }
    });

    if (tokensToRemove.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $pull: { fcmTokens: { token: { $in: tokensToRemove } } },
      });
      // eslint-disable-next-line no-console
      console.log(`Cleaned up ${tokensToRemove.length} stale FCM tokens for user ${userId}`);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error sending push notification:', err);
  }
}

module.exports = {
  sendPushNotification,
};
