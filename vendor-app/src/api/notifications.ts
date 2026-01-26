import axiosInstance from "./axiosInstance";

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

// Get vendor notifications
export const getMyNotifications = async (limit = 20, cursor?: string) => {
  const params: any = { limit };
  if (cursor) params.cursor = cursor;
  
  const { data } = await axiosInstance.get<{
    data: VendorNotification[];
    pagination: {
      nextCursor: string | null;
      hasMore: boolean;
      limit: number;
    };
  }>("/notifications/my", { params });
  
  return data;
};

// Get unread count
export const getUnreadCount = async () => {
  const { data } = await axiosInstance.get<{ count: number }>(
    "/notifications/unread/count"
  );
  return data.count;
};

// Mark notification as read
export const markAsRead = async (notificationId: string) => {
  const { data } = await axiosInstance.post(
    `/notifications/${notificationId}/read`
  );
  return data;
};

// Mark all as read
export const markAllAsRead = async () => {
  const { data } = await axiosInstance.post("/notifications/read-all");
  return data;
};

// Delete notification
export const deleteNotification = async (notificationId: string) => {
  const { data } = await axiosInstance.delete(`/notifications/${notificationId}`);
  return data;
};

// Suppression management
export const getSuppressedChannels = async () => {
  const { data } = await axiosInstance.get("/notifications/suppression/channels");
  return data.data;
};

export const createSuppression = async (channels: string[]) => {
  const { data } = await axiosInstance.post("/notifications/suppression", {
    channels,
  });
  return data.data;
};

export const removeSuppression = async (suppressionId: string) => {
  const { data } = await axiosInstance.delete(
    `/notifications/suppression/${suppressionId}`
  );
  return data;
};

export const removeChannelSuppression = async (channel: string) => {
  const { data } = await axiosInstance.delete(
    `/notifications/suppression/channel/${channel}`
  );
  return data;
};

