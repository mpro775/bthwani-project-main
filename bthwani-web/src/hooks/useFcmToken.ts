import { useEffect, useState } from 'react';
// Firebase messaging removed - using backend push notifications instead
// import { requestFcmToken, listenForegroundMessages } from '../utils/firebase';
// import { registerPushToken } from '../api/notifications';

export function useFcmToken(userId?: string | null) {
  const [token] = useState<string | null>(null);
  const [error] = useState<string | null>(null);

  // Firebase messaging removed - this hook is now a placeholder
  // Push notifications are handled by the backend
  useEffect(() => {
    // TODO: Implement web push notifications using Web Push API or similar
    // For now, this is a no-op
    console.log('useFcmToken: Firebase messaging removed, using backend push notifications');
  }, [userId]);

  return { token, error };
}
