import { useEffect, useState } from 'react';
import { ensureSocket, getSocket, disconnectSocket } from '../realtime/socket';

export const useSocketStatus = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initSocket = async () => {
      try {
        const socket = await ensureSocket();

        socket.on('connect', () => {
          if (mounted) setIsConnected(true);
        });

        socket.on('disconnect', () => {
          if (mounted) setIsConnected(false);
        });

        // Set initial state
        if (mounted) {
          setIsConnected(socket.connected);
        }
      } catch (error) {
        console.error('Socket initialization error:', error);
        if (mounted) setIsConnected(false);
      }
    };

    initSocket();

    return () => {
      mounted = false;
      disconnectSocket();
    };
  }, []);

  return { isConnected };
};
