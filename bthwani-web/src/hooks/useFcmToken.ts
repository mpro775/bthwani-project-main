import { useEffect, useState } from 'react';
// FCM: استخدام Firebase Cloud Messaging للإشعارات (المصادقة JWT فقط)
// import { requestFcmToken, listenForegroundMessages } from '../utils/firebase';
// import { registerPushToken } from '../api/notifications';

export function useFcmToken(userId?: string | null) {
  const [token] = useState<string | null>(null);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // TODO: طلب FCM token وإرساله للـ backend للإشعارات
    // requestFcmToken().then(registerPushToken);
  }, [userId]);

  return { token, error };
}
