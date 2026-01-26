import { useEffect } from 'react';
import { getSocket } from './socket';

type TicketEvent =
  | { type: 'message'; ticketId: string; text: string; by: 'agent' | 'user'; at: string }
  | { type: 'status'; ticketId: string; status: 'open' | 'pending' | 'closed' };

export function useTicketSocket(userId?: string | null, onEvent?: (e: TicketEvent) => void) {
  useEffect(() => {
    if (!userId) return;
    const s = getSocket();
    const channel = `tickets:${userId}`;
    s.emit('subscribe', { channel });
    const handler = (e: TicketEvent) => onEvent?.(e);
    s.on(channel, handler);
    return () => {
      s.emit('unsubscribe', { channel });
      s.off(channel, handler);
    };
  }, [userId, onEvent]);
}
