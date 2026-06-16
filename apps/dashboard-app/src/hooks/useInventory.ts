import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export interface RawMaterial {
  _id: string;
  name: string;
  unit: 'kg' | 'g' | 'litre' | 'ml' | 'piece' | 'dozen' | 'packet';
  currentStock: number;
  minThreshold: number;
  unitCost: number;
  supplier?: string;
  lastPurchaseDate?: string;
  restaurant: string;
  isActive: boolean;
}

//  GET All
export function useInventory() {
  const { user } = useAuthStore();
  return useQuery<RawMaterial[]>({
    queryKey: ['inventory', user?.restaurant],
    enabled: !!user?.restaurant,
    queryFn: async () => {
      const { data } = await api.get('/inventory');
      return Array.isArray(data) ? data : data?.materials || [];
    },
  });
}

//  ADD
export function useAddMaterial() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      unit: RawMaterial['unit'];
      currentStock: number;
      minThreshold: number;
      unitCost: number;
      supplier?: string;
      lastPurchaseDate?: string;
    }) => {
      const { data } = await api.post('/inventory', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', user?.restaurant] }),
  });
}

// EDIT
export function useUpdateMaterial() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<RawMaterial> }) => {
      const { data } = await api.put(`/inventory/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', user?.restaurant] }),
  });
}

// DELETE
export function useDeleteMaterial() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/inventory/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', user?.restaurant] }),
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async ({ id, quantity, type }: {
      id: string;
      quantity: number;
      type: 'add' | 'remove' | 'wastage' | 'expiry';
      reason: string;
    }) => {
      const { data } = await api.patch(`/inventory/${id}/stock`, { quantity, type });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', user?.restaurant] }),
  });
}
