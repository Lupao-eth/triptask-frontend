// src/lib/socket.ts
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './tokenStore';

let socket: Socket | null = null;

export const connectSocket = () => {
  if (!socket || !socket.connected) {
    const token = getAccessToken();

    socket = io(process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000', {
      auth: {
        token,
      },
      transports: ['websocket'], // recommended
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('⚠️ Socket connection error:', err.message);
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket manually disconnected');
  }
};
