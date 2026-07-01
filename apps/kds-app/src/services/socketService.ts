import { io as socketIO, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = socketIO(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const connectSocket = (
  restaurantId: string,
  stationType?: string
): Socket => {
  const s = getSocket();

  s.on('connect', () => {
    console.log('KDS socket connected:', s.id);
    s.emit('join_restaurant', restaurantId);
    s.emit('join_kds', restaurantId);

    if (stationType) {
      s.emit('join_kds_station', { restaurantId, stationType });
    }
  });

  s.on('disconnect', (reason) => {
    console.warn('KDS socket disconnected:', reason);
  });

  s.on('reconnect', () => {
    console.log('KDS socket reconnected — rejoining rooms');
    s.emit('join_restaurant', restaurantId);
    s.emit('join_kds', restaurantId);

    if (stationType) {
      s.emit('join_kds_station', { restaurantId, stationType });
    }
  });

  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};