import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export const initSocket = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Restaurant room mein join karo
    socket.on('joinRestaurant', (restaurantId: string) => {
      socket.join(restaurantId);
      console.log(`Socket ${socket.id} joined restaurant: ${restaurantId}`);
    });

    // Kitchen room mein join karo
    socket.on('joinKitchen', (restaurantId: string) => {
      socket.join(`kitchen_${restaurantId}`);
      console.log(`Kitchen joined: ${restaurantId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
