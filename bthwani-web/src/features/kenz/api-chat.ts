// محادثات كنز — استخدام نفس axiosInstance (يرسل التوكن تلقائياً)
import axiosInstance from "../../api/axios-instance";

export interface KenzConversation {
  _id: string;
  kenzId: {
    _id: string;
    title: string;
    price?: number;
    category?: string;
    status: string;
  };
  ownerId: { _id: string; name?: string; email?: string; phone?: string };
  interestedUserId: { _id: string; name?: string; email?: string; phone?: string };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCountOwner: number;
  unreadCountInterested: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface KenzMessage {
  _id: string;
  conversationId: string;
  senderId: { _id: string; name?: string; email?: string; phone?: string };
  text: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KenzChatListResponse {
  items: KenzConversation[];
  nextCursor?: string;
}

export interface KenzMessageListResponse {
  items: KenzMessage[];
  nextCursor?: string;
}

export async function createConversation(kenzId: string): Promise<KenzConversation> {
  const { data } = await axiosInstance.post("/kenz-chat/conversations", { kenzId });
  return data;
}

export async function getConversations(params?: {
  cursor?: string;
  limit?: number;
}): Promise<KenzChatListResponse> {
  const { data } = await axiosInstance.get("/kenz-chat/conversations", { params });
  return Array.isArray(data) ? { items: data, nextCursor: undefined } : data;
}

export async function getConversation(conversationId: string): Promise<KenzConversation> {
  const { data } = await axiosInstance.get(`/kenz-chat/conversations/${conversationId}`);
  return data;
}

export async function getMessages(
  conversationId: string,
  params?: { cursor?: string; limit?: number }
): Promise<KenzMessageListResponse> {
  const { data } = await axiosInstance.get(
    `/kenz-chat/conversations/${conversationId}/messages`,
    { params }
  );
  return Array.isArray(data) ? { items: data, nextCursor: undefined } : data;
}

export async function sendMessage(
  conversationId: string,
  text: string
): Promise<KenzMessage> {
  const { data } = await axiosInstance.post(
    `/kenz-chat/conversations/${conversationId}/messages`,
    { text }
  );
  return data;
}

export async function markAsRead(conversationId: string): Promise<void> {
  await axiosInstance.patch(`/kenz-chat/conversations/${conversationId}/read`, {});
}

export async function getUnreadCount(): Promise<{ unreadCount: number }> {
  const { data } = await axiosInstance.get("/kenz-chat/unread-count");
  return data ?? { unreadCount: 0 };
}
