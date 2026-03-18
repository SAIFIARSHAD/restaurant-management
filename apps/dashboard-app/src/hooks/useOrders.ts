import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

export interface OrderItem {
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  station?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  tableNumber: string;
  tableFloor?: string;   
  table: string | { _id: string; tableNumber: string; floor?: string };
  items: OrderItem[];
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'served' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'upi';
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  notes?: string;
  cancellationReason?: string; 
  createdAt: string;
  updatedAt: string;
}

// GET all orders
export function useOrders(status?: string, tableId?: string) {
  const { user } = useAuthStore();

  return useQuery<Order[]>({
    queryKey: ['orders', status, tableId],
    enabled: !!user,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (tableId) params.append('table', tableId);

      const { data } = await api.get(`/orders?${params.toString()}`);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.orders)) return data.orders;
      return [];
    },
  });
}

// GET single order
export function useOrderById(id: string) {
  return useQuery<Order>({
    queryKey: ['order', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data?.order || data;
    },
  });
}

// Update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, cancellationReason }: { 
      id: string; 
      status: Order['status'];
      cancellationReason?: string; 
    }) => {
      const { data } = await api.patch(`/orders/${id}/status`, { status, cancellationReason });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

// Update payment
export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, paymentStatus, paymentMethod }: {
      id: string;
      paymentStatus: string;
      paymentMethod?: string;
    }) => {
      const { data } = await api.patch(`/orders/${id}/payment`, { paymentStatus, paymentMethod });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
