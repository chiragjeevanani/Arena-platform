const admin = require('firebase-admin');

let messaging = null;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Replace escaped newlines from env variables
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    messaging = admin.messaging();
    // eslint-disable-next-line no-console
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      'Firebase config variables missing in environment. Push notifications will run in Mock mode.'
    );
  }
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Error initializing Firebase Admin SDK:', error);
}

module.exports = {
  admin,
  messaging,
};
