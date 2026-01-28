// adminSocket.ts
import { io as socketIO, Socket } from "socket.io-client";

export async function getAdminSocket(): Promise<Socket> {
  const token = localStorage.getItem("adminToken");
  const socket = socketIO(import.meta.env.VITE_API_BASE, {
    transports: ["websocket"],
    auth: { token },
  });

  socket.on("connect", () => {
    socket.emit("admin:subscribe");
  });

  // أمثلة للأحداث
  socket.on("order.created", (p) => console.log("order.created", p));
  socket.on("order.status", (p) => console.log("order.status", p));
  socket.on("order.sub.status", (p) => console.log("order.sub.status", p));
  socket.on("order.note.added", (p) => console.log("order.note.added", p));

  return socket;
}
