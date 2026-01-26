import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";

let socket: Socket | null = null;

export async function getAuthToken(): Promise<string> {
  // This should be implemented based on your auth system
  // For now, return a placeholder
  return "your-auth-token-here";
}

export async function ensureSocket(): Promise<Socket> {
  if (socket?.connected) return socket;

  const token = await getAuthToken();
  const API_BASE = Constants.expoConfig?.extra?.apiBase || "https://api.bthwani.com";

  socket = io(API_BASE, {
    transports: ["websocket"],
    auth: { token },
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
