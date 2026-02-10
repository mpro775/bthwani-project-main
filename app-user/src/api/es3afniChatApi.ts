import axiosInstance from "../utils/api/axiosInstance";
import { refreshIdToken } from "./authService";

const getAuthHeaders = async () => {
  try {
    const token = await refreshIdToken();
    return { Authorization: `Bearer ${token}` };
  } catch (error) {
    console.warn("⚠️ فشل في جلب التوكن:", error);
    return {};
  }
};

export interface Es3afniConversation {
  _id: string;
  requestId: { _id: string; title?: string; bloodType?: string; urgency?: string; status?: string };
  requesterId: { _id: string; name?: string; email?: string; phone?: string };
  donorId: { _id: string; name?: string; email?: string; phone?: string };
  lastMessage?: string;
  lastMessageAt?: Date | string;
  unreadCountRequester: number;
  unreadCountDonor: number;
  status: string;
  closesAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Es3afniChatMessage {
  _id: string;
  conversationId: string;
  senderId: { _id: string; name?: string; email?: string; phone?: string };
  text: string;
  readAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export const createEs3afniConversation = async (
  requestId: string
): Promise<Es3afniConversation> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(
    "/es3afni-chat/conversations",
    { requestId },
    { headers }
  );
  return (response.data as any)?.data ?? response.data;
};

export const getEs3afniConversations = async (
  cursor?: string,
  limit = 25
): Promise<{ items: Es3afniConversation[]; nextCursor?: string }> => {
  const headers = await getAuthHeaders();
  const params: Record<string, string | number> = { limit };
  if (cursor) params.cursor = cursor;
  const response = await axiosInstance.get("/es3afni-chat/conversations", {
    headers,
    params,
  });
  const data = (response.data as any)?.data ?? response.data;
  return { items: data?.items ?? [], nextCursor: data?.nextCursor };
};

export const getEs3afniConversation = async (
  conversationId: string
): Promise<Es3afniConversation> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(
    `/es3afni-chat/conversations/${conversationId}`,
    { headers }
  );
  return (response.data as any)?.data ?? response.data;
};

export const getEs3afniMessages = async (
  conversationId: string,
  cursor?: string,
  limit = 25
): Promise<{ items: Es3afniChatMessage[]; nextCursor?: string }> => {
  const headers = await getAuthHeaders();
  const params: Record<string, string | number> = { limit };
  if (cursor) params.cursor = cursor;
  const response = await axiosInstance.get(
    `/es3afni-chat/conversations/${conversationId}/messages`,
    { headers, params }
  );
  const data = (response.data as any)?.data ?? response.data;
  return { items: data?.items ?? [], nextCursor: data?.nextCursor };
};

export const sendEs3afniMessage = async (
  conversationId: string,
  text: string
): Promise<Es3afniChatMessage> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(
    `/es3afni-chat/conversations/${conversationId}/messages`,
    { text },
    { headers }
  );
  return (response.data as any)?.data ?? response.data;
};

export const markEs3afniChatAsRead = async (
  conversationId: string
): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.patch(
    `/es3afni-chat/conversations/${conversationId}/read`,
    {},
    { headers }
  );
};
