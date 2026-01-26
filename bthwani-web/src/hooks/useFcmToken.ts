import { useEffect, useState } from 'react';
import { requestFcmToken, listenForegroundMessages } from '../utils/firebase';
import { registerPushToken } from '../api/notifications';

export function useFcmToken(userId?: string | null) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const t = await requestFcmToken();
        if (mounted) setToken(t);
        if (t && userId) {
          await registerPushToken({ token: t, platform: 'web', userId });
        }
      } catch (e: unknown) {
        setError((e as Error)?.message || 'FCM token error');
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  useEffect(() => {
    listenForegroundMessages((payload) => {
      // App-level toast/snackbar can be triggered here.
      console.debug('Foreground push', payload);
    });
  }, []);

  return { token, error };
}
