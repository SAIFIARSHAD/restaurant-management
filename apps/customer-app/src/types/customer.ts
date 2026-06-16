export interface RestaurantAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface PublicRestaurantInfo {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  address?: RestaurantAddress | string;
  phone?: string;
  email?: string;
  openingHours?: string | null;
  currency: string;
  taxRate: number;
  serviceCharge: number;
}

export interface PublicTableInfo {
  id: string;
  tableNumber: string;
  floor?: string;
  capacity?: number;
  status?: string;
}

export interface PublicMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number | null;
  image?: string;
  isVeg?: boolean;
  isAvailable?: boolean;
  preparationTime?: number;
  tags?: string[];
  customizations?: unknown[];
  sortOrder?: number;
  station?: string;
}

export interface PublicMenuCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  items: PublicMenuItem[];
}

export interface PublicMenuResponse {
  restaurant: PublicRestaurantInfo;
  categories: PublicMenuCategory[];
}

export interface PublicTableValidationResponse {
  restaurant: PublicRestaurantInfo;
  table: PublicTableInfo;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}
export interface PlacePublicOrderItemPayload {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export interface PlacePublicOrderPayload {
  tableId: string;
  customerName: string;
  customerPhone: string;
  items: PlacePublicOrderItemPayload[];
  notes?: string;
}

export interface PublicPlacedOrder {
  _id: string;
  orderNumber: string;
  table?: string;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string | null;
  items: PublicPlacedOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicPlacedOrderItem {
  _id?: string;
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  station?: string;
}

export interface PublicPlacedOrder {
  _id: string;
  orderNumber: string;
  table?: string;
  tableNumber: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string | null;
  items: PublicPlacedOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlacePublicOrderResponse {
  success: true;
  message: string;
  order: PublicPlacedOrder;
}

export interface PublicOrderStatusItem {
  id: string;
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  station?: string;
}

export interface PublicOrderStatusTimeline {
  isPending: boolean;
  isAccepted: boolean;
  isPreparing: boolean;
  isReady: boolean;
  isServed: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
}

export interface PublicOrderStatusData {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus?: string;
    paymentMethod?: string | null;
    subtotal: number;
    tax: number;
    discount: number;
    totalAmount: number;
    notes?: string;
    servedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    items: PublicOrderStatusItem[];
  };
  restaurant: {
    id: string | null;
    name: string;
    slug: string;
    currency: string;
    taxRate: number;
    serviceCharge: number;
  };
  table: {
    id: string | null;
    tableNumber: string;
    floor?: string;
  };
  timeline: PublicOrderStatusTimeline;
}

export interface PublicOrderStatusResponse {
  success: true;
  message: string;
  data: PublicOrderStatusData;
}