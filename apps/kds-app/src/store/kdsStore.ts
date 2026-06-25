import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KDSOrder, StationSession } from '../types/kds';

interface KDSStore {
  session: StationSession | null;
  orders: KDSOrder[];
  completedOrders: KDSOrder[];
  setSession: (session: StationSession) => void;
  setOrders: (orders: KDSOrder[]) => void;
  addOrder: (order: KDSOrder) => void;
  updateOrderStatus: (orderId: string, status: KDSOrder['status']) => void;
  removeOrder: (orderId: string) => void;
  setCompletedOrders: (orders: KDSOrder[]) => void;
  clearSession: () => void;
}

export const useKDSStore = create<KDSStore>()(
  persist(
    (set) => ({
      session: null,
      orders: [],
      completedOrders: [],

      setSession: (session) => set({ session }),

      setOrders: (orders) => set({ orders }),

      addOrder: (order) =>
        set((state) => {
          const exists = state.orders.find((o) => o._id === order._id);
          if (exists) return state;
          return { orders: [order, ...state.orders] };
        }),

      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o._id === orderId ? { ...o, status } : o
          ),
        })),

      removeOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.filter((o) => o._id !== orderId),
        })),

      setCompletedOrders: (completedOrders) => set({ completedOrders }),

      clearSession: () =>
        set({ session: null, orders: [], completedOrders: [] }),
    }),
    {
      name: 'kds-store',
    }
  )
);