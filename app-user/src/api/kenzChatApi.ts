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

export interface KenzConversation {
  _id: string;
  kenzId: {
    _id: string;
    title: string;
    price?: number;
    category?: string;
    status: string;
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

export interface KenzMessage {
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

export interface KenzChatListResponse {
  items: KenzConversation[];
  nextCursor?: string;
}

export interface KenzMessageListResponse {
  items: KenzMessage[];
  nextCursor?: string;
}

// ==================== API Functions ====================

/**
 * إنشاء محادثة جديدة
 */
export const createConversation = async (
  kenzId: string
): Promise<KenzConversation> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(
    "/kenz-chat/conversations",
    { kenzId },
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
): Promise<KenzChatListResponse> => {
  const headers = await getAuthHeaders();
  const params: any = {};
  if (cursor) params.cursor = cursor;
  if (limit) params.limit = limit;

  const response = await axiosInstance.get("/kenz-chat/conversations", {
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
): Promise<KenzConversation> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(
    `/kenz-chat/conversations/${conversationId}`,
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
): Promise<KenzMessage> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(
    `/kenz-chat/conversations/${conversationId}/messages`,
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
): Promise<KenzMessageListResponse> => {
  const headers = await getAuthHeaders();
  const params: any = {};
  if (cursor) params.cursor = cursor;
  if (limit) params.limit = limit;

  const response = await axiosInstance.get(
    `/kenz-chat/conversations/${conversationId}/messages`,
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
    `/kenz-chat/conversations/${conversationId}/read`,
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
  const response = await axiosInstance.get("/kenz-chat/unread-count", {
    headers,
  });
  return response.data;
};
