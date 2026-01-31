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

/** استخراج data من استجابة الباكند الموحدة { success, data, meta } */
const unwrap = <T>(res: { data?: T } & Record<string, unknown>): T =>
  (res?.data !== undefined ? res.data : res) as T;

// ==================== Types ====================

export interface KawaderConversation {
  _id: string;
  kawaderId: {
    _id: string;
    title: string;
    budget?: number;
    scope?: string;
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

export interface KawaderMessage {
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

export interface KawaderChatListResponse {
  items: KawaderConversation[];
  nextCursor?: string;
}

export interface KawaderMessageListResponse {
  items: KawaderMessage[];
  nextCursor?: string;
}

// ==================== API Functions ====================

/**
 * إنشاء محادثة جديدة
 */
export const createConversation = async (
  kawaderId: string
): Promise<KawaderConversation> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(
    "/kawader-chat/conversations",
    { kawaderId },
    { headers }
  );
  return unwrap(response.data);
};

/**
 * جلب محادثات المستخدم
 */
export const getConversations = async (
  cursor?: string,
  limit?: number
): Promise<KawaderChatListResponse> => {
  const headers = await getAuthHeaders();
  const params: any = {};
  if (cursor) params.cursor = cursor;
  if (limit) params.limit = limit;

  const response = await axiosInstance.get("/kawader-chat/conversations", {
    headers,
    params,
  });
  const raw = unwrap(response.data) as KawaderChatListResponse;
  return {
    items: Array.isArray(raw?.items) ? raw.items : [],
    nextCursor: raw?.nextCursor,
  };
};

/**
 * جلب محادثة معينة
 */
export const getConversation = async (
  conversationId: string
): Promise<KawaderConversation> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(
    `/kawader-chat/conversations/${conversationId}`,
    { headers }
  );
  return unwrap(response.data);
};

/**
 * إرسال رسالة
 */
export const sendMessage = async (
  conversationId: string,
  text: string
): Promise<KawaderMessage> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(
    `/kawader-chat/conversations/${conversationId}/messages`,
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
): Promise<KawaderMessageListResponse> => {
  const headers = await getAuthHeaders();
  const params: any = {};
  if (cursor) params.cursor = cursor;
  if (limit) params.limit = limit;

  const response = await axiosInstance.get(
    `/kawader-chat/conversations/${conversationId}/messages`,
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
    `/kawader-chat/conversations/${conversationId}/read`,
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
  const response = await axiosInstance.get("/kawader-chat/unread-count", {
    headers,
  });
  return response.data;
};
