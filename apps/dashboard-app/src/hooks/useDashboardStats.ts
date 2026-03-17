import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeTables: number;
  totalMenuItems: number;
  totalEmployees: number;
  revenueChart: { date: string; revenue: number }[];
  ordersChart: { month: string; orders: number }[];
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await axios.get('/analytics/dashboard');
      return data.data || data;
    },
    staleTime: 2 * 60 * 1000, // 2 min cache
  });
}
