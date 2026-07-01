import { Server, Socket } from 'socket.io';

export const registerSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    socket.on('join_restaurant', (restaurantId: string) => {
      socket.join(`restaurant_${restaurantId}`);
      console.log(`Socket ${socket.id} joined restaurant_${restaurantId}`);
    });

    socket.on('join_kds', (restaurantId: string) => {
      socket.join(`kds_${restaurantId}`);
      console.log(`KDS joined: kds_${restaurantId}`);
    });

    socket.on('join_waiter', (restaurantId: string) => {
      socket.join(`waiter_${restaurantId}`);
      console.log(`Waiter joined: waiter_${restaurantId}`);
    });

    socket.on(
      'join_kds_station',
      (data: { restaurantId: string; stationType: string }) => {
        const room = `kds_${data.restaurantId}_${data.stationType}`;
        socket.join(room);
        console.log(`KDS Station joined: ${room}`);
      }
    );

    socket.on('disconnect', () => {
      console.log(`Disconnected: ${socket.id}`);
    });
  });
};

export const emitNewOrder = (io: Server, restaurantId: string, order: any) => {
  io.to(`kds_${restaurantId}`).emit('new_order', order);
  console.log(`New order emitted to kds_${restaurantId}`);
};

export const emitOrderAccepted = (
  io: Server,
  restaurantId: string,
  order: any
) => {
  io.to(`waiter_${restaurantId}`).emit('order_accepted', order);
  io.to(`restaurant_${restaurantId}`).emit('order_accepted', order);
};

export const emitOrderReady = (
  io: Server,
  restaurantId: string,
  order: any
) => {
  io.to(`waiter_${restaurantId}`).emit('order_ready', order);
  io.to(`restaurant_${restaurantId}`).emit('order_ready', order);
};

export const emitOrderCancelled = (
  io: Server,
  restaurantId: string,
  order: any
) => {
  io.to(`kds_${restaurantId}`).emit('order_cancelled', order);
  io.to(`waiter_${restaurantId}`).emit('order_cancelled', order);
  io.to(`restaurant_${restaurantId}`).emit('order_cancelled', order);
};

export const emitToStation = (
  io: Server,
  restaurantId: string,
  stationType: string,
  event: string,
  data: any
) => {
  const room = `kds_${restaurantId}_${stationType}`;
  io.to(room).emit(event, data);
  console.log(`Emitted '${event}' to ${room}`);
};

// NEW — item-level KDS update helper
export const emitStationItemStatusUpdated = (
  io: Server,
  restaurantId: string,
  stationType: string,
  data: any
) => {
  const room = `kds_${restaurantId}_${stationType}`;
  io.to(room).emit('item_status_updated', data);
  io.to(`kds_${restaurantId}`).emit('item_status_updated', data);
  console.log(`Emitted 'item_status_updated' to ${room} and kds_${restaurantId}`);
};

// NEW — station order-level KDS update helper
export const emitStationOrderStatusUpdated = (
  io: Server,
  restaurantId: string,
  stationType: string,
  data: any
) => {
  const room = `kds_${restaurantId}_${stationType}`;
  io.to(room).emit('station_order_status_updated', data);
  io.to(`kds_${restaurantId}`).emit('order_status_updated', data);
  console.log(
    `Emitted 'station_order_status_updated' to ${room} and 'order_status_updated' to kds_${restaurantId}`
  );
};

// NEW — targeted station cancel helper
export const emitKDSOrderCancelled = (
  io: Server,
  restaurantId: string,
  stationType: string,
  data: any
) => {
  const room = `kds_${restaurantId}_${stationType}`;
  io.to(room).emit('order_cancelled', data);
  io.to(`kds_${restaurantId}`).emit('order_cancelled', data);
  console.log(`Emitted 'order_cancelled' to ${room} and kds_${restaurantId}`);
};

export const emitTableStatusChanged = (
  io: Server,
  restaurantId: string,
  data: any
) => {
  io.to(`restaurant_${restaurantId}`).emit('table_status_changed', data);
};

export const emitTablesMerged = (
  io: Server,
  restaurantId: string,
  data: any
) => {
  io.to(`restaurant_${restaurantId}`).emit('tables_merged', data);
};