import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export interface ITable {
  _id: string;
  tableNumber: string;
  capacity: number;
  floor: string;
  status: 'available' | 'occupied' | 'reserved' | 'inactive';
  qrCode: string;
  qrCodeUrl: string;
  mergedWith: string[];
  mergedLabel: string;
  isActive: boolean;
  createdAt: string;
}

// Get All Tables 
export const useTables = () => {
  return useQuery<ITable[]>({
    queryKey: ['tables'],
    queryFn: async () => {
      const { data } = await api.get('/tables');
      return data.tables || [];
    },
  });
};


export const useCreateTable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      tableNumber: string;
      capacity: number;
      floor: string;
    }) => {
      const { data } = await api.post('/tables', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};


export const useUpdateTable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: {
      id: string;
      tableNumber?: string;
      capacity?: number;
      floor?: string;
      status?: string;
    }) => {
      const { data } = await api.put(`/tables/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};


export const useUpdateTableStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/tables/${id}/status`, { status });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};


export const useMergeTables = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tableIds, mergedLabel }: {
      tableIds: string[];
      mergedLabel: string;
    }) => {
      const { data } = await api.post('/tables/merge', { tableIds, mergedLabel });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};


export const useUnmergeTables = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tableIds: string[]) => {
      const { data } = await api.post('/tables/unmerge', { tableIds });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};

// Regenerate QR
export const useRegenerateQR = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/tables/${id}/regenerate-qr`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};

// Delete Table
export const useDeleteTable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/tables/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};
