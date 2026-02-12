import { useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { ensureSocket, getSocket } from '../realtime/socket';

interface OrderUpdateData {
  orderId: string;
  [key: string]: any;
}

export const useOrderUpdates = (vendorId?: string) => {
  const joinVendorRoom = useCallback(async () => {
    if (!vendorId) return;

    try {
      const socket = await ensureSocket();
      socket.emit('join:vendor', { vendorId });
    } catch (error) {
      console.error('Failed to join vendor room:', error);
    }
  }, [vendorId]);

  const leaveVendorRoom = useCallback(async () => {
    if (!vendorId) return;

    try {
      const socket = await ensureSocket();
      socket.emit('leave:vendor', { vendorId });
    } catch (error) {
      console.error('Failed to leave vendor room:', error);
    }
  }, [vendorId]);

  useEffect(() => {
    if (!vendorId) return;

    joinVendorRoom();

    return () => {
      leaveVendorRoom();
    };
  }, [vendorId, joinVendorRoom, leaveVendorRoom]);

  // Set up event listeners
  useEffect(() => {
    const setupListeners = async () => {
      try {
        const socket = await ensureSocket();

        // Order created (new order for vendor)
        socket.on('order.created', (data: OrderUpdateData) => {
          Alert.alert('طلب جديد', `طلب رقم ${data.orderId}`);
        });

        // Order status changed (vendor accepted, preparing, etc.)
        socket.on('order.status', (data: OrderUpdateData) => {
          Alert.alert('تحديث حالة طلب', `طلب رقم ${data.orderId}`);
        });

        // Sub-order status changed (specific to vendor's products)
        socket.on('order.sub.status', (data: OrderUpdateData) => {
          Alert.alert('تحديث حالة منتج', `طلب رقم ${data.orderId}`);
        });

        // Order note added
        socket.on('order.note.added', (data: OrderUpdateData) => {
          Alert.alert('ملاحظة جديدة', `طلب رقم ${data.orderId}`);
        });

      } catch (error) {
        console.error('Failed to setup socket listeners:', error);
      }
    };

    setupListeners();

    return () => {
      // Cleanup listeners if needed
      getSocket()?.removeAllListeners();
    };
  }, []);

  return {
    joinVendorRoom,
    leaveVendorRoom,
  };
};
