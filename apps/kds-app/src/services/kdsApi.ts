import api from './api';
import type {
  IOrder,
  OrdersApiResponse,
  OrderItemStatus,
  OrderStatus,
} from '../types/kds.types';

interface OrdersFilterParams {
  station?: string;
  from?: string;
  to?: string;
  fromDate?: string;
  toDate?: string;
}

const buildQuery = (params: OrdersFilterParams) => {
  const query = new URLSearchParams();

  if (params.station) query.append('station', params.station);

  const fromValue = params.from ?? params.fromDate;
  const toValue = params.to ?? params.toDate;

  if (fromValue) query.append('fromDate', fromValue);
  if (toValue) query.append('toDate', toValue);

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const getKDSOrders = async (
  params: OrdersFilterParams = {}
): Promise<IOrder[]> => {
  const query = buildQuery(params);
  const res = await api.get<OrdersApiResponse>(`/kds/orders${query}`);
  return res.data.orders;
};

export const getCompletedOrders = async (
  params: OrdersFilterParams = {}
): Promise<IOrder[]> => {
  const query = buildQuery(params);
  const res = await api.get<OrdersApiResponse>(`/kds/orders/completed${query}`);
  return res.data.orders;
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  cancellationReason?: string
): Promise<IOrder> => {
  const body =
    status === 'cancelled' && cancellationReason
      ? { status, cancellationReason }
      : { status };

  const res = await api.patch(`/kds/orders/${orderId}/status`, body);
  return res.data.order;
};

export const updateItemStatus = async (
  orderId: string,
  itemId: string,
  status: OrderItemStatus
): Promise<{ orderStatus: OrderStatus }> => {
  const res = await api.patch(
    `/kds/orders/${orderId}/items/${itemId}/status`,
    { status }
  );

  return {
    orderStatus: res.data.orderStatus,
  };
};