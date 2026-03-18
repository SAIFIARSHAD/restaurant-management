import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export interface Table {
  _id: string;
  tableNumber: string;
  floor?: string;
  status: 'available' | 'occupied' | 'reserved' | 'inactive';
  capacity: number;
}

export function useTables() {
  const { user } = useAuthStore();

  return useQuery<Table[]>({
    queryKey: ['tables', user?.restaurant],
    enabled: !!user?.restaurant,
    queryFn: async () => {
      const { data } = await api.get(`/tables/${user?.restaurant}`);
      return Array.isArray(data)
        ? data
        : data?.data || data?.tables || [];
    },
  });
}