import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export interface TableStatus {
  _id: string; tableNumber: string; floor: string;
  status: 'available' | 'occupied' | 'reserved' | 'inactive';
  capacity: number;
}

export interface LiveOrder {
  _id: string; orderNumber: string; tableNumber: string;
  items: { name: string; quantity: number }[];
  status: string; createdAt: string; totalAmount: number;
}

export interface TopItem {
  name: string; quantity: number; revenue: number;
}

export interface InventoryAlert {
  _id: string; name: string;
  currentStock: number; minThreshold: number; unit: string;
}

export interface DashboardData {
  kpi: {
    todayRevenue:    number;
    todayOrders:     number;
    pendingOrders:   number;
    avgOrderValue:   number;
    dailyTarget:     number;
    revenueProgress: number;
    menuCount:       number;  
    empCount:        number;   
    vendorCount:     number;   
    tableStats: { total: number; available: number; occupied: number; reserved: number };
  };
  orderStatus:    Record<string, number>;
  activeOrders:   LiveOrder[];
  tables:         TableStatus[];
  topItems:       TopItem[];
  lowStockItems:  InventoryAlert[];
  staff:          { totalPresent: number; byRole: Record<string, number> };
  hourlyRevenue:  { hour: number; revenue: number; orders: number }[];
  peakHour:       { hour: number; revenue: number; orders: number };
  recentActivity: {
    _id: string; billNumber: string; tableNumber: string;
    totalAmount: number; paymentMethod: string; createdAt: string;
  }[];
}

export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard');
      return data as DashboardData;
    },
    refetchInterval: 30000,
  });