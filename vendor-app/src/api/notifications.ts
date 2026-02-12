import axiosInstance from "./axiosInstance";
import { unwrapResponse } from "../utils/apiHelpers";

export interface VendorNotification {
  _id: string;
  title: string;
  message: {
    title: string;
    body: string;
  };
  type: string;
  status: string;
  createdAt: string;
}

type NotificationsResponse = {
  data: VendorNotification[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
};

// Get vendor notifications
export const getMyNotifications = async (limit = 20, cursor?: string) => {
  const params: any = { limit };
  if (cursor) params.cursor = cursor;
  const res = await axiosInstance.get("/notifications/my", { params });
  return unwrapResponse<NotificationsResponse>(res);
};

// Get unread count
export const getUnreadCount = async () => {
  const res = await axiosInstance.get("/notifications/unread/count");
  const data = unwrapResponse<{ count: number }>(res);
  return typeof data === "object" && data?.count !== undefined
    ? data.count
    : 0;
};

// Mark notification as read
export const markAsRead = async (notificationId: string) => {
  const res = await axiosInstance.post(
    `/notifications/${notificationId}/read`
  );
  return unwrapResponse<any>(res);
};

// Mark all as read
export const markAllAsRead = async () => {
  const res = await axiosInstance.post("/notifications/read-all");
  return unwrapResponse<any>(res);
};

// Delete notification
export const deleteNotification = async (notificationId: string) => {
  const res = await axiosInstance.delete(`/notifications/${notificationId}`);
  return unwrapResponse<any>(res);
};

// Suppression management
export const getSuppressedChannels = async () => {
  const res = await axiosInstance.get("/notifications/suppression/channels");
  const data = unwrapResponse<any>(res);
  return data?.data ?? data ?? [];
};

export const createSuppression = async (channels: string[]) => {
  const res = await axiosInstance.post("/notifications/suppression", {
    channels,
  });
  const data = unwrapResponse<any>(res);
  return data?.data ?? data;
};

export const removeSuppression = async (suppressionId: string) => {
  const res = await axiosInstance.delete(
    `/notifications/suppression/${suppressionId}`
  );
  return unwrapResponse<any>(res);
};

export const removeChannelSuppression = async (channel: string) => {
  const res = await axiosInstance.delete(
    `/notifications/suppression/channel/${channel}`
  );
  return unwrapResponse<any>(res);
};

