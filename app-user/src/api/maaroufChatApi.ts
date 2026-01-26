import axiosInstance from "../utils/api/axiosInstance";
import { refreshIdToken } from "./authService";

/**
 * Helper لجلب headers المصادقة
 */
const getAuthHeaders = async () => {
  try {
    const token = await refreshIdToken();
    return { Authorization: `Bearer ${token}` };
  } catch (error) {
    console.warn("⚠️ فشل في جلب التوكن:", error);
    return {};
  }
};

// ==================== Types ====================

export interface MaaroufConversation {
  _id: string;
  maaroufId: {
    _id: string;
    title: string;
    kind?: string;
    status: string;
    description?: string;
    metadata?: Record<string, any>;
    tags?: string[];
  };
  ownerId: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  interestedUserId: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  lastMessage?: string;
  lastMessageAt?: Date | string;
  unreadCountOwner: number;
  unreadCountInterested: number;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MaaroufMessage {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  text: string;
  readAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MaaroufChatListResponse {
  items: MaaroufConversation[];
  nextCursor?: string;
}

export interface MaaroufMessageListResponse {
  items: MaaroufMessage[];
  nextCursor?: string;
}

// ==================== API Functions ====================

/**
 * إنشاء محادثة جديدة
 */
export const createConversation = async (
  maaroufId: string
): Promise<MaaroufConversation> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(
    "/maarouf-chat/conversations",
    { maaroufId },
    { headers }
  );
  return response.data;
};

/**
 * جلب محادثات المستخدم
 */
export const getConversations = async (
  cursor?: string,
  limit?: number
): Promise<MaaroufChatListResponse> => {
  const headers = await getAuthHeaders();
  const params: any = {};
  if (cursor) params.cursor = cursor;
  if (limit) params.limit = limit;

  const response = await axiosInstance.get("/maarouf-chat/conversations", {
    headers,
    params,
  });
  return response.data;
};

/**
 * جلب محادثة معينة
 */
export const getConversation = async (
  conversationId: string
): Promise<MaaroufConversation> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(
    `/maarouf-chat/conversations/${conversationId}`,
    { headers }
  );
  return response.data;
};

/**
 * إرسال رسالة
 */
export const sendMessage = async (
  conversationId: string,
  text: string
): Promise<MaaroufMessage> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(
    `/maarouf-chat/conversations/${conversationId}/messages`,
    { text },
    { headers }
  );
  return response.data;
};

/**
 * جلب رسائل محادثة
 */
export const getMessages = async (
  conversationId: string,
  cursor?: string,
  limit?: number
): Promise<MaaroufMessageListResponse> => {
  const headers = await getAuthHeaders();
  const params: any = {};
  if (cursor) params.cursor = cursor;
  if (limit) params.limit = limit;

  const response = await axiosInstance.get(
    `/maarouf-chat/conversations/${conversationId}/messages`,
    { headers, params }
  );
  return response.data;
};

/**
 * تحديد المحادثة كمقروءة
 */
export const markAsRead = async (
  conversationId: string
): Promise<{ success: boolean }> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.patch(
    `/maarouf-chat/conversations/${conversationId}/read`,
    {},
    { headers }
  );
  return response.data;
};

/**
 * جلب عدد الرسائل غير المقروءة
 */
export const getUnreadCount = async (): Promise<{ unreadCount: number }> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get("/maarouf-chat/unread-count", {
    headers,
  });
  return response.data;
};
