import api from '../api/axios';
import type { KDSOrder, OrderStatus } from '../types/kds';

export const fetchKitchenOrders = async (
  restaurantId: string,
  station: string
): Promise<KDSOrder[]> => {
  const { data } = await api.get(`/kds/orders?station=${station}`, {
    headers: { 'x-restaurant-id': restaurantId },
  });
  return data.orders ?? [];
};

export const fetchCompletedOrders = async (
  restaurantId: string,
  station: string
): Promise<KDSOrder[]> => {
  const { data } = await api.get(`/kds/orders/completed?station=${station}`, {
    headers: { 'x-restaurant-id': restaurantId },
  });
  return data.orders ?? [];
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<void> => {
  await api.patch(`/kds/orders/${orderId}/status`, { status });
};