import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { KDSOrder } from '../types/kds';
import { useKDSStore } from '../store/kdsStore';

let socket: Socket | null = null;

export const useKitchenSocket = () => {
  const { session, addOrder, updateOrderStatus, removeOrder } = useKDSStore();

  useEffect(() => {
    if (!session) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('KDS Socket connected:', socket?.id);

      // Join restaurant room
      socket?.emit('join_restaurant', session.restaurantId);

      // Join KDS room
      socket?.emit('join_kds', session.restaurantId);

      // Join station specific room
      socket?.emit('join_kds_station', {
        restaurantId: session.restaurantId,
        stationType: session.station,
      });
    });

    // New order — only show if matches this station
    socket.on('new_station_order', (data: KDSOrder) => {
      const items = data.items?.filter(
        (item) => item.station === session.station
      );
      if (!items || items.length === 0) return;
      addOrder({ ...data, items });
    });

    // Fallback: full order broadcast
    socket.on('new_order', (data: KDSOrder) => {
      const items = data.items?.filter(
        (item) => item.station === session.station
      );
      if (!items || items.length === 0) return;
      addOrder({ ...data, items });
    });

    socket.on('order_accepted', (data: { orderId: string; status: KDSOrder['status'] }) => {
      updateOrderStatus(data.orderId, data.status);
    });

    socket.on('order_preparing', (data: { orderId: string; status: KDSOrder['status'] }) => {
      updateOrderStatus(data.orderId, data.status);
    });

    socket.on('order_ready', (data: { orderId: string; status: KDSOrder['status'] }) => {
      updateOrderStatus(data.orderId, data.status);
    });

    socket.on('order_cancelled', (data: { orderId: string }) => {
      removeOrder(data.orderId);
    });

    socket.on('order_billed', (data: { orderId: string }) => {
      removeOrder(data.orderId);
    });

    socket.on('disconnect', () => {
      console.log('KDS Socket disconnected');
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [session]);
};