import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "FIREBASE_API_KEY_NOT_SET",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "FIREBASE_AUTH_DOMAIN_NOT_SET",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "FIREBASE_PROJECT_ID_NOT_SET",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "FIREBASE_STORAGE_BUCKET_NOT_SET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "FIREBASE_MESSAGING_SENDER_ID_NOT_SET",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "FIREBASE_APP_ID_NOT_SET"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export async function getMessagingIfSupported(): Promise<Messaging | null> {
  try {
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch {
    return null;
  }
}

export async function requestFcmToken(): Promise<string | null> {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return null;
  if (Notification.permission === 'default') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return null;
  }
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string;
  try {
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: await navigator.serviceWorker.getRegistration() ?? undefined });
    return token ?? null;
  } catch (err) {
    console.error('FCM getToken error', err);
    return null;
  }
}

export function listenForegroundMessages(cb: (payload: { data?: Record<string, string>; notification?: { title?: string; body?: string } }) => void) {
  getMessagingIfSupported().then((messaging) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => cb(payload));
  });
}
export default app;
