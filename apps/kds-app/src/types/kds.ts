export type StationType = 'kitchen' | 'grill' | 'drinks' | 'dessert' | 'other';

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'billed';

export interface KDSOrderItem {
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  station: StationType;
}

export interface KDSOrder {
  _id: string;
  orderNumber: string;
  tableNumber: string | number;
  status: OrderStatus;
  notes?: string;
  items: KDSOrderItem[];
  createdAt: string;
  servedAt?: string;
}

export interface StationSession {
  restaurantId: string;
  station: StationType;
  screenName: string;
}