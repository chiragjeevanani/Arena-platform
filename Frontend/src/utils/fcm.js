import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { apiJson } from '../services/apiClient';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let messaging = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId) {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } else {
    console.warn('Firebase client configuration is incomplete. FCM push notifications are in mock mode.');
  }
} catch (error) {
  console.error('Error initializing Firebase SDK:', error);
}

export async function registerServiceWorker() {
  if (!messaging) return null;
  if ('serviceWorker' in navigator) {
    const params = new URLSearchParams({
      apiKey: firebaseConfig.apiKey || '',
      authDomain: firebaseConfig.authDomain || '',
      projectId: firebaseConfig.projectId || '',
      storageBucket: firebaseConfig.storageBucket || '',
      messagingSenderId: firebaseConfig.messagingSenderId || '',
      appId: firebaseConfig.appId || '',
    });

    try {
      const registration = await navigator.serviceWorker.register(
        `/firebase-messaging-sw.js?${params.toString()}`,
        { scope: '/' }
      );
      console.log('FCM Service Worker registered successfully with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
}

export async function requestNotificationPermissionAndGetToken(registration) {
  if (!messaging) {
    console.log('[MOCK FCM] Requesting notification permission...');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration || undefined,
      });
      return token;
    } else {
      console.warn('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
}

export async function registerFcmTokenOnServer(token) {
  try {
    await apiJson('/api/notifications/register-token', {
      method: 'POST',
      body: { token },
    });
    console.log('FCM Token registered successfully on backend.');
  } catch (error) {
    console.error('Failed to register FCM Token on backend:', error);
  }
}

export async function deregisterFcmTokenOnServer(token) {
  try {
    await apiJson('/api/notifications/deregister-token', {
      method: 'POST',
      body: { token },
    });
    console.log('FCM Token deregistered successfully on backend.');
  } catch (error) {
    console.error('Failed to deregister FCM Token on backend:', error);
  }
}

// Set up foreground message listener
if (messaging) {
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground: ', payload);
    // Display standard browser notification in foreground if permission is granted
    if (Notification.permission === 'granted') {
      new Notification(payload.notification.title || 'New Message', {
        body: payload.notification.body,
        icon: payload.notification.image || '/logo.png',
      });
    }
  });
}
