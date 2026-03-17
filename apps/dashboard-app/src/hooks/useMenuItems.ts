import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';


export interface Category {
  _id: string;
  name: string;
}


export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: Category;
  isAvailable: boolean;
  isVeg: boolean;
  image?: string;
  description?: string;
}

// GET /api/menu/categories/:restaurantId
export function useCategories() {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurant;

  return useQuery<Category[]>({
    queryKey: ['categories', restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data } = await api.get(`/menu/categories/${restaurantId}`);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.categories)) return data.categories;
      return [];
    },
  });
}

// GET /api/menu/items/:restaurantId
export function useMenuItems(categoryId?: string) {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurant;

  return useQuery<MenuItem[]>({
    queryKey: ['menu-items', restaurantId, categoryId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const url = categoryId
        ? `/menu/items/${restaurantId}?category=${categoryId}`
        : `/menu/items/${restaurantId}`;
      const { data } = await api.get(url);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.items)) return data.items;
      return [];
    },
  });
}


// POST /api/menu/categories  (JWT se restaurant auto attach hoga)
export function useAddCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post('/menu/categories', { name ,
    restaurantId: user?.restaurant, });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

// POST /api/menu/items  (JWT se restaurant auto attach hoga)
export function useAddMenuItem() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (formData: FormData) => {
        formData.append('restaurantId', user?.restaurant ?? '');
        
        for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const { data } = await api.post('/menu/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu-items'] }),
  });
}

// PUT /api/menu/items/:id
export function useEditMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const { data } = await api.put(`/menu/items/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu-items'] }),
  });
}

// DELETE /api/menu/items/:id
export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/menu/items/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu-items'] }),
  });
}

// PUT /api/menu/items/:id  (availability toggle)
export function useToggleAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      const { data } = await api.put(`/menu/items/${id}/toggle`, { isAvailable });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu-items'] }),
  });
}
