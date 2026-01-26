import { API_URL } from "@/utils/api/config";
import { io, Socket } from "socket.io-client";
import { MaaroufMessage } from "@/api/maaroufChatApi";

const getSocketBaseUrl = () =>
  API_URL.replace(/\/api\/v\d+(\/)?$/, "") || API_URL;

/**
 * يوصّل على namespace /maarouf-chat ويضم المستخدم إلى غرفة المحادثة
 * onMessage يُستدعى عند كل رسالة جديدة
 */
export function connectMaaroufChatSocket(
  token: string,
  conversationId: string,
  onMessage: (m: MaaroufMessage) => void,
  onTyping?: (data: { userId: string; isTyping: boolean }) => void,
  onRead?: (data: { userId: string }) => void
) {
  const base = getSocketBaseUrl();
  const socket: Socket = io(`${base}/maarouf-chat`, {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    socket.emit("maarouf-chat:join", { conversationId });
  });

  socket.on("maarouf-chat:message:new", (data: MaaroufMessage) => {
    onMessage(data);
  });

  if (onTyping) {
    socket.on("maarouf-chat:typing", (data: { userId: string; isTyping: boolean }) => {
      onTyping(data);
    });
  }

  if (onRead) {
    socket.on("maarouf-chat:read", (data: { userId: string }) => {
      onRead(data);
    });
  }

  return {
    socket,
    sendMessage: (text: string) => {
      socket.emit("maarouf-chat:message", { conversationId, text });
    },
    sendTyping: (isTyping: boolean) => {
      socket.emit("maarouf-chat:typing", { conversationId, isTyping });
    },
    markAsRead: () => {
      socket.emit("maarouf-chat:read", { conversationId });
    },
    disconnect: () => {
      socket.emit("maarouf-chat:leave", { conversationId });
      socket.disconnect();
    },
  };
}
