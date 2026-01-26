import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

let socket: Socket | null = null;

export async function getAuthToken(): Promise<string> {
  // جلب التوكن من التخزين المحلي
  try {
    const token = await AsyncStorage.getItem("token");
    return token || "";
  } catch (error) {
    console.error("Error getting auth token:", error);
    return "";
  }
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
