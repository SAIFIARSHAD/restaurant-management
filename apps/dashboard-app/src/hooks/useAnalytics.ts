// apps/dashboard-app/src/hooks/useAnalytics.ts

import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { subDays, format } from 'date-fns';

export type Period = 'today' | 'week' | 'month' | 'year';

export interface DateParams {
  startDate: string;
  endDate:   string;
}

const fmt     = (d: Date) => format(d, 'yyyy-MM-dd');
const todayRange = (): DateParams => ({ startDate: fmt(new Date()), endDate: fmt(new Date()) });
const weekRange  = (): DateParams => ({ startDate: fmt(subDays(new Date(), 6)), endDate: fmt(new Date()) });

export const useDashboardStats = (params: DateParams = todayRange()) =>
  useQuery({
    queryKey: ['analytics', 'dashboard', params],
    queryFn: async () => {
      const { data } = await api.get('/analytics/dashboard', { params });
      return data.dashboard;
    },
    refetchInterval: 60000,
  });

export const useWeeklyRevenue = (params: DateParams = weekRange()) =>
  useQuery({
    queryKey: ['analytics', 'weekly', params],
    queryFn: async () => {
      const { data } = await api.get('/analytics/weekly-revenue', { params });
      return data.weeklyRevenue as { date: string; totalRevenue: number; totalOrders: number }[];
    },
  });

export const useHourlySales = (params: DateParams = todayRange()) =>
  useQuery({
    queryKey: ['analytics', 'hourly', params],
    queryFn: async () => {
      const { data } = await api.get('/analytics/hourly-sales', { params });
      const raw = data.hourlySales as {
        hour: number; totalOrders: number; totalRevenue: number;
      }[];

      // ← 0 se 23 tak fill — missing hours = 0
      return Array.from({ length: 24 }, (_, h) => {
        const found = raw.find((r) => r.hour === h);
        return {
          hour:         h,
          label:        `${h}:00`,
          totalOrders:  found?.totalOrders  ?? 0,
          totalRevenue: found?.totalRevenue ?? 0,
        };
      });
    },
  });

export const useCategorySales = (params: DateParams = todayRange()) =>
  useQuery({
    queryKey: ['analytics', 'category', params],
    queryFn: async () => {
      const { data } = await api.get('/analytics/category-sales', { params });
      return data.categorySales as {
        category: string; totalQuantity: number; totalRevenue: number;
      }[];
    },
  });

export const useTableTurnover = (params: DateParams = todayRange()) =>
  useQuery({
    queryKey: ['analytics', 'table', params],
    queryFn: async () => {
      const { data } = await api.get('/analytics/table-turnover', { params });
      return data.tableTurnover as {
        tableNumber: string; floor?: string;
        totalOrders: number; totalRevenue: number;
      }[];
    },
  });