import { io, type Socket } from 'socket.io-client';
import { API_URL, getToken } from './http';

const SOCKET_ORIGIN = API_URL.replace(/\/api\/?$/, '');

let socket: Socket | null = null;

/** Instance unique Socket.IO, (re)créée à la connexion pour embarquer le token JWT courant. */
export function getSocket(): Socket | null {
  const token = getToken();
  if (!token) return null;

  if (!socket) {
    socket = io(SOCKET_ORIGIN, { auth: { token }, autoConnect: true });
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
