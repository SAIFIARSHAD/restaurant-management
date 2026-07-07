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

  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;

  audioUnlocked: boolean;
  setAudioUnlocked: (val: boolean) => void;
}

const COMPLETED_STATUSES: OrderStatus[] = ['served', 'billed', 'cancelled'];

const isCompletedStatus = (status: OrderStatus) =>
  COMPLETED_STATUSES.includes(status);

const dedupeOrders = (orders: IOrder[]) => {
  const map = new Map<string, IOrder>();
  orders.forEach((order) => {
    map.set(order._id, order);
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

const syncAllItemsToOrderStatus = (order: IOrder, status: OrderStatus): IOrder => {
  if (status === 'billed') {
    return { ...order, status };
  }

  return {
    ...order,
    status,
    items: order.items.map((item) => ({
      ...item,
      status:
        status === 'cancelled'
          ? 'cancelled'
          : status === 'served'
          ? 'served'
          : status === 'ready'
          ? 'ready'
          : status === 'preparing'
          ? 'preparing'
          : status === 'accepted'
          ? 'accepted'
          : 'pending',
    })),
  };
};

export const useKDSStore = create<KDSStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  selectedStation: null,
  setSelectedStation: (station) => set({ selectedStation: station }),

  orders: [],
  completedOrders: [],

  setOrders: (orders) =>
    set((state) => {
      const completedMap = new Map(state.completedOrders.map((o) => [o._id, o]));
      const cleanedActive = orders.filter((o) => !completedMap.has(o._id));
      return { orders: dedupeOrders(cleanedActive) };
    }),

  setCompletedOrders: (orders) =>
    set((state) => {
      const completed = dedupeOrders(orders);
      const completedIds = new Set(completed.map((o) => o._id));

      return {
        completedOrders: completed,
        orders: state.orders.filter((o) => !completedIds.has(o._id)),
      };
    }),

  addOrUpdateOrder: (incoming) =>
    set((state) => {
      const targetCompleted = isCompletedStatus(incoming.status);

      if (targetCompleted) {
        const nextCompleted = dedupeOrders([
          incoming,
          ...state.completedOrders.filter((o) => o._id !== incoming._id),
        ]);

        return {
          completedOrders: nextCompleted,
          orders: state.orders.filter((o) => o._id !== incoming._id),
        };
      }

      const nextOrders = dedupeOrders([
        incoming,
        ...state.orders.filter((o) => o._id !== incoming._id),
      ]);

      return {
        orders: nextOrders,
        completedOrders: state.completedOrders.filter((o) => o._id !== incoming._id),
      };
    }),

  removeOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.filter((o) => o._id !== orderId),
      completedOrders: state.completedOrders.filter((o) => o._id !== orderId),
    })),

  updateOrderStatus: (orderId, status) =>
    set((state) => {
      const sourceOrder =
        state.orders.find((o) => o._id === orderId) ||
        state.completedOrders.find((o) => o._id === orderId);

      if (!sourceOrder) return state;

      const updated = syncAllItemsToOrderStatus(sourceOrder, status);

      if (isCompletedStatus(status)) {
        return {
          orders: state.orders.filter((o) => o._id !== orderId),
          completedOrders: dedupeOrders([
            updated,
            ...state.completedOrders.filter((o) => o._id !== orderId),
          ]),
        };
      }

      return {
        orders: dedupeOrders([
          updated,
          ...state.orders.filter((o) => o._id !== orderId),
        ]),
        completedOrders: state.completedOrders.filter((o) => o._id !== orderId),
      };
    }),

  updateItemStatus: (orderId, itemId, status, newOrderStatus) =>
    set((state) => {
      const sourceOrder =
        state.orders.find((o) => o._id === orderId) ||
        state.completedOrders.find((o) => o._id === orderId);

      if (!sourceOrder) return state;

      const updatedOrder: IOrder = {
        ...sourceOrder,
        status: newOrderStatus,
        items: sourceOrder.items.map((item) =>
          item._id === itemId ? { ...item, status } : item
        ),
      };

      if (isCompletedStatus(newOrderStatus)) {
        return {
          orders: state.orders.filter((o) => o._id !== orderId),
          completedOrders: dedupeOrders([
            updatedOrder,
            ...state.completedOrders.filter((o) => o._id !== orderId),
          ]),
        };
      }

      return {
        orders: dedupeOrders([
          updatedOrder,
          ...state.orders.filter((o) => o._id !== orderId),
        ]),
        completedOrders: state.completedOrders.filter((o) => o._id !== orderId),
      };
    }),

  isConnected: false,
  setIsConnected: (val) => set({ isConnected: val }),

  soundEnabled: true,
  setSoundEnabled: (val) => set({ soundEnabled: val }),

  audioUnlocked: false,
  setAudioUnlocked: (val) => set({ audioUnlocked: val }),
}));