import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket } from '../services/socketService';
import { useKDSStore } from '../store/kdsStore';
import type {
  NewStationOrderPayload,
  OrderStatusUpdatedPayload,
  ItemStatusUpdatedPayload,
  OrderCancelledPayload,
  IOrder,
} from '../types/kds.types';

export const useKDSSocket = (
  restaurantId: string,
  stationType?: string
) => {
  const {
    addOrUpdateOrder,
    removeOrder,
    updateOrderStatus,
    updateItemStatus,
    setIsConnected,
  } = useKDSStore();

  const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null);

  useEffect(() => {
    if (!restaurantId) return;

    const socket = connectSocket(restaurantId, stationType);
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // New order aaya station par
    socket.on('new_station_order', (payload: NewStationOrderPayload) => {
      const order: IOrder = {
        _id: payload.orderId,
        orderNumber: payload.orderNumber,
        tableNumber: payload.tableNumber,
        status: payload.status,
        items: payload.items,
        notes: payload.notes,
        createdAt: payload.createdAt,
        updatedAt: payload.createdAt,
      };
      addOrUpdateOrder(order);
    });

    // Full order status update
    socket.on('order_status_updated', (payload: OrderStatusUpdatedPayload) => {
      updateOrderStatus(payload.orderId, payload.status);
    });

    // Station-specific order status update
    socket.on('station_order_status_updated', (payload: OrderStatusUpdatedPayload) => {
      updateOrderStatus(payload.orderId, payload.status);
    });

    // Item-level status update
    socket.on('item_status_updated', (payload: ItemStatusUpdatedPayload) => {
      updateItemStatus(
        payload.orderId,
        payload.itemId,
        payload.newStatus,
        payload.orderStatus
      );
    });

    // Order cancelled
    socket.on('order_cancelled', (payload: OrderCancelledPayload) => {
      removeOrder(payload.orderId);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new_station_order');
      socket.off('order_status_updated');
      socket.off('station_order_status_updated');
      socket.off('item_status_updated');
      socket.off('order_cancelled');
      disconnectSocket();
    };
  }, [restaurantId, stationType]);
};