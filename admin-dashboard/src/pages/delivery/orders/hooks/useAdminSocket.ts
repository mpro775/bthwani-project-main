import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "../../../../utils/axios";
import { auth } from "../../../../config/firebaseConfig";
import { useQueryClient } from "react-query";

export function useAdminSocket() {
  const ref = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [currentOrderRooms, setCurrentOrderRooms] = useState<Set<string>>(new Set());

  const ensure = useCallback(async (): Promise<Socket> => {
    if (ref.current?.connected) return ref.current;
    const token = await auth.currentUser?.getIdToken(true);
    const baseURL = (axios.defaults as { baseURL: string }).baseURL || "";
    const s = io(baseURL, { transports: ["websocket"], auth: { token } });
    ref.current = s;

    s.on("connect", () => {
      setIsConnected(true);
      s.emit("admin:subscribe");
    });

    s.on("disconnect", () => {
      setIsConnected(false);
    });

    // الاستماع لأحداث الطلبات وتحديث الـ cache
    s.on("order.created", () => {
      queryClient.invalidateQueries(['orders']);
    });

    s.on("order.updated", (data) => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['order', data.orderId]);
    });

    s.on("order.status", (data) => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['order', data.orderId]);
    });

    s.on("order.sub.status", (data) => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['order', data.orderId]);
    });

    s.on("order.driver.assigned", (data) => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['order', data.orderId]);
    });

    s.on("order.pod.set", (data) => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['order', data.orderId]);
    });

    s.on("order.note.added", (data) => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['order', data.orderId]);
    });

    return s;
  }, [queryClient]);

  const joinOrderRoom = useCallback((orderId: string) => {
    if (ref.current?.connected) {
      ref.current.emit("join:order", { orderId });
      setCurrentOrderRooms(prev => new Set(prev).add(orderId));
    }
  }, []);

  const leaveOrderRoom = useCallback((orderId: string) => {
    if (ref.current?.connected) {
      ref.current.emit("leave:order", { orderId });
      setCurrentOrderRooms(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  }, []);

  const leaveAllOrderRooms = useCallback(() => {
    currentOrderRooms.forEach(orderId => {
      if (ref.current?.connected) {
        ref.current.emit("leave:order", { orderId });
      }
    });
    setCurrentOrderRooms(new Set());
  }, [currentOrderRooms]);

  useEffect(() => {
    return () => {
      leaveAllOrderRooms();
      if (ref.current?.connected) {
        ref.current.disconnect();
      }
    };
  }, [leaveAllOrderRooms]);

  return {
    ensure,
    socketRef: ref,
    isConnected,
    joinOrderRoom,
    leaveOrderRoom,
    leaveAllOrderRooms
  };
}
