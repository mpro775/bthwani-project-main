import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketBaseUrl } from '../utils/api/axiosInstance';
import { refreshIdToken } from '../api/authService';
import { AmaniItem } from '../api/amaniApi';

export interface AmaniSocketCallbacks {
  onStatusUpdate?: (data: { amaniId: string; status: string; timestamp: Date }) => void;
  onDriverAssigned?: (data: { amaniId: string; driverId: string; driver?: any; timestamp: Date }) => void;
  onLocationUpdate?: (data: { amaniId: string; location: { lat: number; lng: number }; timestamp: Date }) => void;
  onError?: (error: { code: string; message: string; userMessage?: string }) => void;
}

export interface AmaniSocketConnection {
  socket: Socket | null;
  connected: boolean;
  joinRoom: (amaniId: string) => void;
  leaveRoom: (amaniId: string) => void;
  disconnect: () => void;
}

/**
 * Hook للاتصال بـ WebSocket لطلبات أماني
 * @param amaniId معرف طلب أماني (اختياري - يمكن الانضمام لاحقاً)
 * @param callbacks Callbacks للأحداث
 * @returns Connection object مع socket و functions
 */
export function useAmaniSocket(
  amaniId?: string,
  callbacks?: AmaniSocketCallbacks
): AmaniSocketConnection {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const mountedRef = useRef(true);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  const joinRoom = useCallback((id: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('amani:join', { amaniId: id });
    }
  }, []);

  const leaveRoom = useCallback((id: string) => {
    if (socketRef.current?.connected) {
      // Note: Gateway doesn't have leave event yet, but we can disconnect from room
      socketRef.current.emit('amani:leave', { amaniId: id });
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const setupSocket = async () => {
      try {
        const token = await refreshIdToken();
        if (!mountedRef.current) return;

        const base = getSocketBaseUrl();
        const socket: Socket = io(`${base}/amani`, {
          auth: { token },
          transports: ['websocket'],
        });

        socket.on('connect', () => {
          if (mountedRef.current) {
            setConnected(true);
            if (amaniId) {
              socket.emit('amani:join', { amaniId });
            }
          }
        });

        socket.on('disconnect', () => {
          if (mountedRef.current) {
            setConnected(false);
          }
        });

        socket.on('connected', (data) => {
          console.log('Amani socket connected:', data);
        });

        socket.on('error', (error) => {
          console.error('Amani socket error:', error);
          if (callbacks?.onError) {
            callbacks.onError(error);
          }
        });

        // Status updates
        socket.on('amani:status_updated', (data) => {
          if (callbacks?.onStatusUpdate) {
            callbacks.onStatusUpdate({
              ...data,
              timestamp: new Date(data.timestamp),
            });
          }
        });

        // Driver assigned
        socket.on('amani:driver_assigned', (data) => {
          if (callbacks?.onDriverAssigned) {
            callbacks.onDriverAssigned({
              ...data,
              timestamp: new Date(data.timestamp),
            });
          }
        });

        // Location updates
        socket.on('amani:location_updated', (data) => {
          if (callbacks?.onLocationUpdate) {
            callbacks.onLocationUpdate({
              ...data,
              timestamp: new Date(data.timestamp),
            });
          }
        });

        socketRef.current = socket;
      } catch (error) {
        console.error('خطأ في إعداد WebSocket لأماني:', error);
        if (callbacks?.onError) {
          callbacks.onError({
            code: 'SETUP_ERROR',
            message: 'Failed to setup socket',
            userMessage: 'فشل في الاتصال بالخادم',
          });
        }
      }
    };

    setupSocket();

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, []); // Setup once

  // Join room when amaniId changes
  useEffect(() => {
    if (amaniId && socketRef.current?.connected) {
      joinRoom(amaniId);
    }
  }, [amaniId, joinRoom]);

  return {
    socket: socketRef.current,
    connected,
    joinRoom,
    leaveRoom,
    disconnect,
  };
}
