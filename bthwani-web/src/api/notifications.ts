import axiosInstance from "./axios-instance";
import { getAuthHeader } from "./auth";
import type { Notification, NotificationSettings } from "../types";
import axios from "./axios-instance";

// Get user notifications
export const getUserNotifications = async (
  limit = 50,
  cursor?: string
): Promise<Notification[]> => {
  const headers = await getAuthHeader();
  const params: any = { limit };
  if (cursor) params.cursor = cursor;
  
  const response = await axiosInstance.get<{ data: Notification[] }>("/notifications/my", {
    params,
    headers,
  });
  return response.data.data;
};
export async function registerPushToken(payload: {
  token: string;
  platform: "web";
  userId: string;
}) {
  // Adjust the endpoint to your backend's actual route if different
  return axios.post("/notifications/register", payload);
}

// Get unread notifications count
export const getUnreadNotificationsCount = async (): Promise<number> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get<{ count: number }>(
    "/notifications/unread/count",
    { headers }
  );
  return response.data.count;
};

// Mark notification as read
export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  const headers = await getAuthHeader();
  await axiosInstance.post(
    `/notifications/${notificationId}/read`,
    {},
    { headers }
  );
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  const headers = await getAuthHeader();
  await axiosInstance.post("/notifications/read-all", {}, { headers });
};

// Delete notification
export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  const headers = await getAuthHeader();
  await axiosInstance.delete(`/notifications/${notificationId}`, { headers });
};

// Get notification suppression settings (channels)
export const getNotificationSettings =
  async (): Promise<NotificationSettings> => {
    const headers = await getAuthHeader();
    const response = await axiosInstance.get<{ data: NotificationSettings }>(
      "/notifications/suppression/channels",
      { headers }
    );
    return response.data.data;
  };

// Update notification settings (suppression)
export const updateNotificationSettings = async (
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> => {
  const headers = await getAuthHeader();
  
  // Create suppression for channels
  const channels: string[] = [];
  if ('pushNotifications' in settings && settings.pushNotifications === false) channels.push('push');
  if ('emailNotifications' in settings && settings.emailNotifications === false) channels.push('email');
  if ('smsNotifications' in settings && settings.smsNotifications === false) channels.push('sms');
  
  const response = await axiosInstance.post<{ data: NotificationSettings }>(
    "/notifications/suppression",
    { channels },
    { headers }
  );
  return response.data.data;
};

// Send test notification (for development) - NOT IMPLEMENTED IN BACKEND
export const sendTestNotification = async (
  type: Notification["type"],
  title: string,
  message: string
): Promise<Notification> => {
  const headers = await getAuthHeader();
  // Note: This endpoint doesn't exist in backend, creating notification instead
  const response = await axiosInstance.post<Notification>(
    "/notifications",
    {
      type,
      title,
      message: { title, body: message },
    },
    { headers }
  );
  return response.data;
};

export default {
  getUserNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
  sendTestNotification,
};
