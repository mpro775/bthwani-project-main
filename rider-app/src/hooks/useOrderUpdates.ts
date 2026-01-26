import { useEffect, useCallback } from 'react';
import { ensureSocket } from '../realtime/socket';
import Toast from 'react-native-toast-message';

interface OrderUpdateData {
  orderId: string;
  [key: string]: any;
}

export const useOrderUpdates = (driverId?: string) => {
  const joinDriverRoom = useCallback(async () => {
    if (!driverId) return;

    try {
      const socket = await ensureSocket();
      socket.emit('join:driver', { driverId });
    } catch (error) {
      console.error('Failed to join driver room:', error);
    }
  }, [driverId]);

  const leaveDriverRoom = useCallback(async () => {
    if (!driverId) return;

    try {
      const socket = await ensureSocket();
      socket.emit('leave:driver', { driverId });
    } catch (error) {
      console.error('Failed to leave driver room:', error);
    }
  }, [driverId]);

  useEffect(() => {
    if (!driverId) return;

    joinDriverRoom();

    return () => {
      leaveDriverRoom();
    };
  }, [driverId, joinDriverRoom, leaveDriverRoom]);

  // Set up event listeners
  useEffect(() => {
    const setupListeners = async () => {
      try {
        const socket = await ensureSocket();

        // Order assigned to driver
        socket.on('order.driver.assigned', (data: OrderUpdateData) => {
          Toast.show({
            type: 'info',
            text1: 'طلب جديد مُسند إليك',
            text2: `طلب رقم ${data.orderId}`,
          });

          // Refresh orders list if needed
          // You can emit an event or use a callback here
        });

        // Order status changed
        socket.on('order.status', (data: OrderUpdateData) => {
          Toast.show({
            type: 'info',
            text1: 'تحديث حالة طلب',
            text2: `طلب رقم ${data.orderId}`,
          });
        });

        // Order note added
        socket.on('order.note.added', (data: OrderUpdateData) => {
          Toast.show({
            type: 'info',
            text1: 'ملاحظة جديدة',
            text2: `طلب رقم ${data.orderId}`,
          });
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
    joinDriverRoom,
    leaveDriverRoom,
  };
};
