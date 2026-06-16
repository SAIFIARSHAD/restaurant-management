import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export interface RawMaterialLog {
  _id: string;
  rawMaterial: { _id: string; name: string; unit: string };
  type: 'add' | 'remove' | 'wastage' | 'expiry' | 'auto_deduct';
  quantity: number;
  unit: string;
  previousStock: number;
  newStock: number;
  reason?: string;
  createdBy?: { name: string; role: string } | null;
  orderId?: { _id: string; orderNumber: string; tableNumber: string } | null;
  createdAt: string;
}

interface LogsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  logs: RawMaterialLog[];
}

interface LogFilters {
  type?: string;
  materialId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const useRawMaterialLogs = (filters: LogFilters = {}) => {
  return useQuery<LogsResponse>({
    queryKey: ['rawMaterialLogs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.type)       params.append('type', filters.type);
      if (filters.materialId) params.append('materialId', filters.materialId);
      if (filters.startDate)  params.append('startDate', filters.startDate);
      if (filters.endDate)    params.append('endDate', filters.endDate);
      if (filters.page)       params.append('page', String(filters.page));
      if (filters.limit)      params.append('limit', String(filters.limit));

      const { data } = await api.get(`/inventory/logs/all?${params.toString()}`);
      return data;
    },
  });
};

export const useLogSummary = () => {
  return useQuery({
    queryKey: ['rawMaterialLogSummary'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/logs/summary');
      return data.summary as { _id: string; count: number; totalQuantity: number }[];
    },
  });
};
