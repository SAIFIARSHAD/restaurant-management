import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export interface PopulatedMaterial {
  _id: string;
  name: string;
  unit: string;
  currentStock: number;
  minThreshold?: number;
}

export interface IVendor {
  _id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  materials: PopulatedMaterial[];
  isActive: boolean;
  createdAt: string;
}

export interface LowStockItem {
  material: {
    _id: string;
    name: string;
    currentStock: number;
    minThreshold: number;
    unit: string;
  };
  vendor: {
    _id: string;
    name: string;
    phone: string;
    contactPerson?: string;
  } | null;
}
export interface UpdateVendorPayload {
  id: string;
  name?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  materials?: string[];
}

export const useVendors = () =>
  useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data } = await api.get('/vendors');
      return data.vendors as IVendor[];
    },
  });

export const useLowStockVendors = () =>
  useQuery({
    queryKey: ['vendors', 'low-stock'],
    queryFn: async () => {
      const { data } = await api.get('/vendors/low-stock');
      return data.lowStockItems as LowStockItem[];
    },
  });


export const useCreateVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<IVendor, '_id' | 'isActive' | 'createdAt' | 'materials'> & { materials: string[] }) =>
      api.post('/vendors', body).then(r => r.data.vendor),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  });
};


export const useUpdateVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateVendorPayload) =>
      api.put(`/vendors/${id}`, body).then(r => r.data.vendor),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  });
};

export const useDeleteVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/vendors/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  });
};
