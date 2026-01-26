import { API_URL } from "@/utils/api/config";
import { io, Socket } from "socket.io-client";
import { KenzMessage } from "@/api/kenzChatApi";

const getSocketBaseUrl = () =>
  API_URL.replace(/\/api\/v\d+(\/)?$/, "") || API_URL;

/**
 * يوصّل على namespace /kenz-chat ويضم المستخدم إلى غرفة المحادثة
 * onMessage يُستدعى عند كل رسالة جديدة
 */
export function connectKenzChatSocket(
  token: string,
  conversationId: string,
  onMessage: (m: KenzMessage) => void,
  onTyping?: (data: { userId: string; isTyping: boolean }) => void,
  onRead?: (data: { userId: string }) => void
) {
  const base = getSocketBaseUrl();
  const socket: Socket = io(`${base}/kenz-chat`, {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    socket.emit("kenz-chat:join", { conversationId });
  });

  socket.on("kenz-chat:message:new", (data: KenzMessage) => {
    onMessage(data);
  });

  if (onTyping) {
    socket.on("kenz-chat:typing", (data: { userId: string; isTyping: boolean }) => {
      onTyping(data);
    });
  }

  if (onRead) {
    socket.on("kenz-chat:read", (data: { userId: string }) => {
      onRead(data);
    });
  }

  return {
    socket,
    sendMessage: (text: string) => {
      socket.emit("kenz-chat:message", { conversationId, text });
    },
    sendTyping: (isTyping: boolean) => {
      socket.emit("kenz-chat:typing", { conversationId, isTyping });
    },
    markAsRead: () => {
      socket.emit("kenz-chat:read", { conversationId });
    },
    disconnect: () => {
      socket.emit("kenz-chat:leave", { conversationId });
      socket.disconnect();
    },
  };
}
