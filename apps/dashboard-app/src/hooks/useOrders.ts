import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useSocket } from './useSocket';

export interface OrderItem {
  menuItem: string;
  name:     string;
  price:    number;
  quantity: number;
  notes?:   string;
  station?: string;
}

export interface Order {
  _id:                 string;
  orderNumber:         string;
  table:               string | { _id: string; floor?: string };
  tableNumber:         string;
  items:               OrderItem[];
  status:              'pending' | 'accepted' | 'preparing' | 'ready' | 'served' | 'billed' | 'cancelled';
  paymentStatus:       'unpaid' | 'paid' | 'refunded';
  paymentMethod?:      string;
  subtotal:            number;
  tax:                 number;
  discount:            number;
  totalAmount:         number;
  notes?:              string;
  cancellationReason?: string;
  createdAt:           string;
  updatedAt:           string;
}

export const useOrders = (status?: string) => {
  const queryClient = useQueryClient();
  const { on, off } = useSocket();          

  useEffect(() => {
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    };

    on('new_order',       refresh);
    on('order_accepted',  refresh);
    on('order_preparing', refresh);
    on('order_ready',     refresh);
    on('order_cancelled', refresh);
    on('order_billed',    refresh);

    return () => {
      off('new_order',       refresh);
      off('order_accepted',  refresh);
      off('order_preparing', refresh);
      off('order_ready',     refresh);
      off('order_cancelled', refresh);
      off('order_billed',    refresh);
    };
  }, [on, off, queryClient]);

  return useQuery({
    queryKey: ['orders', status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const { data } = await api.get('/orders', { params });
      return data.orders as Order[];
    },
    refetchInterval: 30000,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id, status, cancellationReason,
    }: {
      id: string; status: string; cancellationReason?: string;
    }) => {
      const { data } = await api.patch(`/orders/${id}/status`, {
        status,
        ...(cancellationReason && { cancellationReason }),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id, paymentStatus, paymentMethod,
    }: {
      id: string; paymentStatus: string; paymentMethod?: string;
    }) => {
      const { data } = await api.patch(`/orders/${id}/payment`, {
        paymentStatus,
        paymentMethod,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};