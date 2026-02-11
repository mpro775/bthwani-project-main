import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const SOCKET_BASE =
  Constants.expoConfig?.extra?.apiBase ||
  "https://api.btwani.smartagency-ye.com";

export interface AmaniDriverSocketCallbacks {
  onNewAssignment?: (data: { amaniId: string; timestamp: Date }) => void;
  onError?: (error: { code: string; message: string }) => void;
}

/**
 * Hook للاتصال بـ WebSocket لطلبات أماني (للسائقة)
 * - يستمع لـ amani:new_assignment عند تعيين طلب جديد
 * - يمكن إرسال الموقع عبر sendLocation
 */
export function useAmaniDriverSocket(callbacks?: AmaniDriverSocketCallbacks) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const mountedRef = useRef(true);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  const sendLocation = useCallback(
    (amaniId: string, lat: number, lng: number) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("driver:update_location", {
          amaniId,
          lat,
          lng,
        });
      }
    },
    []
  );

  useEffect(() => {
    mountedRef.current = true;

    const setupSocket = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token || !mountedRef.current) return;

        const socket: Socket = io(`${SOCKET_BASE}/amani`, {
          auth: { token },
          transports: ["websocket"],
        });

        socket.on("connect", () => {
          if (mountedRef.current) {
            setConnected(true);
          }
        });

        socket.on("disconnect", () => {
          if (mountedRef.current) {
            setConnected(false);
          }
        });

        socket.on("connected", () => {
          // تسجيل دخول ناجح
        });

        socket.on("error", (error) => {
          if (callbacksRef.current?.onError) {
            callbacksRef.current.onError(error);
          }
        });

        socket.on("amani:new_assignment", (data: { amaniId: string; timestamp?: string }) => {
          if (callbacksRef.current?.onNewAssignment) {
            callbacksRef.current.onNewAssignment({
              amaniId: data.amaniId,
              timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            });
          }
        });

        socketRef.current = socket;
      } catch (error) {
        console.error("خطأ في إعداد WebSocket لأماني (السائقة):", error);
        if (callbacksRef.current?.onError) {
          callbacksRef.current.onError({
            code: "SETUP_ERROR",
            message: "فشل في الاتصال بالخادم",
          });
        }
      }
    };

    setupSocket();

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [disconnect]);

  return {
    connected,
    sendLocation,
    disconnect,
  };
}
