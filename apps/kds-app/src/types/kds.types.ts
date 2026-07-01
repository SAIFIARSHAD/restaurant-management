// ─── Station ─────────────────────────────────────────────────────────────────

export type StationType = 'grill' | 'drinks' | 'kitchen' | 'dessert' | 'other';

export interface IStation {
  _id: string;
  name: string;
  stationType: StationType;
  color: string;
  restaurant: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Order Item ───────────────────────────────────────────────────────────────

export type OrderItemStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

export interface IOrderItem {
  _id: string;
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  station?: StationType;
  status: OrderItemStatus;
  startedAt?: string;
  readyAt?: string;
  servedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled'
  | 'billed';

export interface IOrder {
  _id: string;
  orderNumber: string;
  tableNumber: string;
  table?: {
    _id: string;
    tableNumber: string;
    floor?: string;
  };
  status: OrderStatus;
  items: IOrderItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── KDS Board ───────────────────────────────────────────────────────────────

export type KDSColumnType = 'pending' | 'preparing' | 'ready' | 'completed';

export interface KDSColumn {
  id: KDSColumnType;
  label: string;
  statuses: OrderStatus[];
  color: string;
}

// ─── Socket Payloads ─────────────────────────────────────────────────────────

export interface NewStationOrderPayload {
  orderId: string;
  orderNumber: string;
  tableNumber: string;
  items: IOrderItem[];
  notes?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderStatusUpdatedPayload {
  orderId: string;
  orderNumber: string;
  tableNumber: string;
  status: OrderStatus;
}

export interface ItemStatusUpdatedPayload {
  orderId: string;
  orderNumber: string;
  tableNumber: string;
  itemId: string;
  itemName: string;
  station: StationType;
  previousStatus: OrderItemStatus;
  newStatus: OrderItemStatus;
  orderStatus: OrderStatus;
}

export interface OrderCancelledPayload {
  orderId: string;
  orderNumber: string;
  tableNumber: string;
  status: 'cancelled';
}

// ─── KDS Auth / Session ───────────────────────────────────────────────────────

export interface KDSUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  restaurant: string;
  token: string;
}

export interface KDSSession {
  user: KDSUser;
  selectedStation: IStation | null;
}

// ─── API Response Wrappers ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface OrdersApiResponse {
  success: boolean;
  orders: IOrder[];
}

export interface StationsApiResponse {
  success: boolean;
  stations: IStation[];
}