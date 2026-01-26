import { API_URL } from "@/utils/api/config";
import { io, Socket } from "socket.io-client";

/**
 * يوصّل على /support/socket ويضم المستخدم إلى غرفة التذكرة
 * onMessage يُستدعى عند كل رسالة جديدة (الأحدث أولاً)
 */
export function connectTicketSocket(
  token: string,
  ticketId: string,
  onMessage: (m: any) => void
) {
  const socket: Socket = io(API_URL, {
    path: "/support/socket",
    auth: { token }, // Firebase ID token
    transports: ["websocket"], // يسرّع على شبكات الجوال
  });

  socket.on("connect", () => {
    socket.emit("support:join", { ticketId });
  });

  socket.on("support:msg:new", onMessage);

  return () => {
    socket.emit("support:leave", { ticketId });
    socket.disconnect();
  };
}
