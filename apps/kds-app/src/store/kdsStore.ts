import create from 'zustand';
import type {
  IOrder,
  IStation,
  KDSUser,
  OrderItemStatus,
  OrderStatus,
} from '../types/kds.types';

interface KDSStore {
  user: KDSUser | null;
  setUser: (user: KDSUser | null) => void;

  selectedStation: IStation | null;
  setSelectedStation: (station: IStation | null) => void;

  orders: IOrder[];
  completedOrders: IOrder[];
  setOrders: (orders: IOrder[]) => void;
  setCompletedOrders: (orders: IOrder[]) => void;

  addOrUpdateOrder: (incoming: IOrder) => void;
  removeOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateItemStatus: (
    orderId: string,
    itemId: string,
    status: OrderItemStatus,
    newOrderStatus: OrderStatus
  ) => void;

  isConnected: boolean;
  setIsConnected: (val: boolean) => void;
}

export const useKDSStore = create<KDSStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  selectedStation: null,
  setSelectedStation: (station) => set({ selectedStation: station }),

  orders: [],
  completedOrders: [],
  setOrders: (orders) => set({ orders }),
  setCompletedOrders: (orders) => set({ completedOrders: orders }),

  addOrUpdateOrder: (incoming) =>
    set((state) => {
      const exists = state.orders.find((o) => o._id === incoming._id);

      if (exists) {
        return {
          orders: state.orders.map((o) =>
            o._id === incoming._id ? { ...o, ...incoming } : o
          ),
        };
      }

      return { orders: [incoming, ...state.orders] };
    }),

  removeOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.filter((o) => o._id !== orderId),
    })),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o._id === orderId ? { ...o, status } : o
      ),
    })),

  updateItemStatus: (orderId, itemId, status, newOrderStatus) =>
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o._id !== orderId) return o;

        return {
          ...o,
          status: newOrderStatus,
          items: o.items.map((item) =>
            item._id === itemId ? { ...item, status } : item
          ),
        };
      }),
    })),

  isConnected: false,
  setIsConnected: (val) => set({ isConnected: val }),
}));