import { useQuery } from '@tanstack/react-query';
import api from '../api/axios'; 


export interface SalesSummary {
  totalOrders:    number;
  totalRevenue:   number;
  totalSubtotal:  number;
  totalTax:       number;
  avgOrderValue:  number;
}

export interface RevenueDay {
  _id:           string; 
  totalRevenue:  number;
  totalOrders:   number;
  totalTax:      number;
}

export interface GSTSummary {
  totalTaxableAmount: number;
  totalGST:           number;
  cgst:               number;
  sgst:               number;
}

export interface TopItem {
  _id:           string; 
  totalQuantity: number;
  totalRevenue:  number;
}

export interface PaymentMode {
  _id:         string; 
  totalAmount: number;
  count:       number;
}


interface DateParams {
  startDate?: string; 
  endDate?:   string;
}

export interface MonthlyGST {
  _id:           string; 
  taxableAmount: number;
  totalGST:      number;
  totalOrders:   number;
}

export const useSalesSummary = (params: DateParams) =>
  useQuery({
    queryKey: ['reports', 'sales', params],
    queryFn: async () => {
      const { data } = await api.get('/reports/sales', { params });
      return data.summary as SalesSummary;
    },
  });

export const useRevenueReport = (params: DateParams) =>
  useQuery({
    queryKey: ['reports', 'revenue', params],
    queryFn: async () => {
      const { data } = await api.get('/reports/revenue', { params });
      return data.revenue as RevenueDay[];
    },
  });

export const useGSTReport = (params: DateParams) =>
  useQuery({
    queryKey: ['reports', 'gst', params],
    queryFn: async () => {
      const { data } = await api.get('/reports/gst', { params });
      return {
        summary: data.gstSummary      as GSTSummary,
        monthly: data.monthlyBreakdown as MonthlyGST[],  
      };
    },
  });

export const useTopItems = (params: DateParams & { limit?: number }) =>
  useQuery({
    queryKey: ['reports', 'top-items', params],
    queryFn: async () => {
      const { data } = await api.get('/reports/top-items', { params });
      return data.topItems as TopItem[];
    },
  });

export const usePaymentReport = (params: DateParams) =>
  useQuery({
    queryKey: ['reports', 'payments', params],
    queryFn: async () => {
      const { data } = await api.get('/reports/payments', { params });
      return data.paymentBreakdown as PaymentMode[];
    },
  });

export const useDailySummary = () =>
  useQuery({
    queryKey: ['reports', 'daily'],
    queryFn: async () => {
      const { data } = await api.get('/reports/daily');
      return data.summary;
    },
    refetchInterval: 30000, 
  });
