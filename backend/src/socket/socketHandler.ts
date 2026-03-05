import { Server, Socket } from 'socket.io';

export const registerSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {

    // Restaurant Room Join
    socket.on('join_restaurant', (restaurantId: string) => {
      socket.join(`restaurant_${restaurantId}`);
      console.log(`Socket ${socket.id} joined restaurant_${restaurantId}`);
    });

    // KDS Room Join (Kitchen Screen)
    socket.on('join_kds', (restaurantId: string) => {
      socket.join(`kds_${restaurantId}`);
      console.log(`KDS joined: kds_${restaurantId}`);
    });

    // Waiter Room Join
    socket.on('join_waiter', (restaurantId: string) => {
      socket.join(`waiter_${restaurantId}`);
      console.log(`Waiter joined: waiter_${restaurantId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Disconnected: ${socket.id}`);
    });
  });
};

// KOT Events — Call from Controllers 
export const emitNewOrder = (io: Server, restaurantId: string, order: any) => {
  io.to(`kds_${restaurantId}`).emit('new_order', order);
  console.log(`New order emitted to kds_${restaurantId}`);
};

export const emitOrderAccepted = (io: Server, restaurantId: string, order: any) => {
  io.to(`waiter_${restaurantId}`).emit('order_accepted', order);
};

export const emitOrderReady = (io: Server, restaurantId: string, order: any) => {
  io.to(`waiter_${restaurantId}`).emit('order_ready', order);
};

export const emitOrderCancelled = (io: Server, restaurantId: string, order: any) => {
  io.to(`kds_${restaurantId}`).emit('order_cancelled', order);
  io.to(`waiter_${restaurantId}`).emit('order_cancelled', order);
};
