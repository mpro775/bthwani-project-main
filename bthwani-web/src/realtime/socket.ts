import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function getAccessToken(): string | null {
  // TODO: Replace with your actual auth token retrieval
  try { return localStorage.getItem('access_token'); } catch { return null; }
}

export function getSocket(): Socket {
  if (socket) return socket;
  const url = import.meta.env.VITE_REALTIME_URL || import.meta.env.VITE_API_URL;
  socket = io(url, {
    transports: ['websocket'],
    autoConnect: true,
    auth: (cb) => cb({ token: getAccessToken() }),
  });
  socket.on('connect_error', (err) => console.warn('[socket] connect_error', err.message));
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}
