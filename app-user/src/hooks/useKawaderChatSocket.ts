import { io, Socket } from "socket.io-client";
import { getSocketBaseUrl } from "../utils/api/axiosInstance";
import { KawaderMessage } from "../types/types";

/**
 * يوصّل على namespace /kawader-chat ويضم المستخدم إلى غرفة المحادثة
 * onMessage يُستدعى عند كل رسالة جديدة
 */
export function connectKawaderChatSocket(
  token: string,
  conversationId: string,
  onMessage: (m: KawaderMessage) => void,
  onTyping?: (data: { userId: string; isTyping: boolean }) => void,
  onRead?: (data: { userId: string }) => void
) {
  const base = getSocketBaseUrl();
  const socket: Socket = io(`${base}/kawader-chat`, {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    socket.emit("kawader-chat:join", { conversationId });
  });

  socket.on("kawader-chat:message:new", (data: KawaderMessage) => {
    onMessage(data);
  });

  if (onTyping) {
    socket.on("kawader-chat:typing", (data: { userId: string; isTyping: boolean }) => {
      onTyping(data);
    });
  }

  if (onRead) {
    socket.on("kawader-chat:read", (data: { userId: string }) => {
      onRead(data);
    });
  }

  return {
    socket,
    sendMessage: (text: string) => {
      socket.emit("kawader-chat:message", { conversationId, text });
    },
    sendTyping: (isTyping: boolean) => {
      socket.emit("kawader-chat:typing", { conversationId, isTyping });
    },
    markAsRead: () => {
      socket.emit("kawader-chat:read", { conversationId });
    },
    disconnect: () => {
      socket.emit("kawader-chat:leave", { conversationId });
      socket.disconnect();
    },
  };
}
