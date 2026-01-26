import { useEffect } from 'react';
import { getSocket } from './socket';

type OrderEvent =
  | { type: 'statusChanged'; orderId: string; status: string; etaMinutes?: number }
  | { type: 'assigned'; orderId: string; driverId: string }
  | { type: 'delivered'; orderId: string }
  | { type: 'canceled'; orderId: string; reason?: string };

export function useOrdersRealtime(userId?: string | null, onEvent?: (e: OrderEvent) => void) {
  useEffect(() => {
    if (!userId) return;
    const s = getSocket();
    const channel = `orders:${userId}`;
    s.emit('subscribe', { channel });
    const handler = (e: OrderEvent) => onEvent?.(e);
    s.on(channel, handler);
    return () => {
      s.emit('unsubscribe', { channel });
      s.off(channel, handler);
    };
  }, [userId, onEvent]);
}
