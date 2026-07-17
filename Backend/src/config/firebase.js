const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let messaging = null;

try {
  let cert = null;

  // 1. Try loading from service account JSON path
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const certPath = path.isAbsolute(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      ? process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      : path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      
    if (fs.existsSync(certPath)) {
      cert = admin.credential.cert(certPath);
    }
  }

  // 2. Fallback to individual environment variables
  if (!cert) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (projectId && clientEmail && privateKey) {
      cert = admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      });
    }
  }

  if (cert) {
    admin.initializeApp({
      credential: cert,
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
