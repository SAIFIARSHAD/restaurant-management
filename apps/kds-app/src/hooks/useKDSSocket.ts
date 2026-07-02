import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket } from '../services/socketService';
import { useKDSStore } from '../store/kdsStore';
import type {
  NewStationOrderPayload,
  OrderStatusUpdatedPayload,
  ItemStatusUpdatedPayload,
  OrderCancelledPayload,
  IOrder,
  OrderStatus,
  OrderItemStatus,
} from '../types/kds.types';

const VALID_ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'served',
  'billed',
  'cancelled',
];

const VALID_ITEM_STATUSES: OrderItemStatus[] = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'served',
  'cancelled',
];

const normalizeOrderStatus = (status: unknown): OrderStatus => {
  if (typeof status !== 'string') return 'pending';
  const normalized = status.trim().toLowerCase() as OrderStatus;
  return VALID_ORDER_STATUSES.includes(normalized) ? normalized : 'pending';
};

const normalizeItemStatus = (status: unknown): OrderItemStatus => {
  if (typeof status !== 'string') return 'pending';
  const normalized = status.trim().toLowerCase() as OrderItemStatus;
  return VALID_ITEM_STATUSES.includes(normalized) ? normalized : 'pending';
};

export const useKDSSocket = (
  restaurantId: string,
  stationType?: string
) => {
  const {
    addOrUpdateOrder,
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

    socket.on('new_station_order', (payload: NewStationOrderPayload) => {
      const normalizedOrderStatus = normalizeOrderStatus(payload.status);

      const order: IOrder = {
        _id: payload.orderId,
        orderNumber: payload.orderNumber,
        tableNumber: payload.tableNumber,
        status: normalizedOrderStatus,
        items: (payload.items || []).map((item) => ({
          ...item,
          status: normalizeItemStatus(item.status ?? normalizedOrderStatus),
        })),
        notes: payload.notes,
        createdAt: payload.createdAt,
        updatedAt: payload.createdAt,
      };

      addOrUpdateOrder(order);
    });

    socket.on('order_status_updated', (payload: OrderStatusUpdatedPayload) => {
      updateOrderStatus(payload.orderId, normalizeOrderStatus(payload.status));
    });

    socket.on('station_order_status_updated', (payload: OrderStatusUpdatedPayload) => {
      updateOrderStatus(payload.orderId, normalizeOrderStatus(payload.status));
    });

    socket.on('item_status_updated', (payload: ItemStatusUpdatedPayload) => {
      updateItemStatus(
        payload.orderId,
        payload.itemId,
        normalizeItemStatus(payload.newStatus),
        normalizeOrderStatus(payload.orderStatus)
      );
    });

    socket.on('order_cancelled', (payload: OrderCancelledPayload) => {
      updateOrderStatus(payload.orderId, 'cancelled');
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
  }, [
    restaurantId,
    stationType,
    addOrUpdateOrder,
    updateOrderStatus,
    updateItemStatus,
    setIsConnected,
  ]);
};