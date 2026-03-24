import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';


export interface PopulatedRawMaterial {
  _id: string;
  name: string;
  unit: string;
  currentStock: number;
  unitCost: number;
}

export interface RecipeIngredient {
  rawMaterial: string | PopulatedRawMaterial; 
  quantity: number;
  unit: 'kg' | 'g' | 'litre' | 'ml' | 'piece' | 'dozen' | 'packet';
}


export interface PopulatedMenuItem {
  _id: string;
  name: string;
  price: number; 
}

export interface Recipe {
  _id: string;
  menuItem: string | PopulatedMenuItem;
  ingredients: RecipeIngredient[];
  restaurant: string;
  isActive: boolean;
  createdAt?: string;
}

// GET All
export function useRecipes() {
  const { user } = useAuthStore();
  return useQuery<Recipe[]>({
    queryKey: ['recipes', user?.restaurant],
    enabled: !!user?.restaurant,
    queryFn: async () => {
      const { data } = await api.get('/recipes');
      return Array.isArray(data) ? data : data?.recipes || [];
    },
  });
}

// GET by MenuItem
export function useRecipeByMenuItem(menuItemId: string | null) {
  return useQuery<Recipe | null>({
    queryKey: ['recipe-by-item', menuItemId],
    enabled: !!menuItemId,
    queryFn: async () => {
      const { data } = await api.get(`/recipes/menuitem/${menuItemId}`);
      return data?.recipe || null;
    },
  });
}

// CREATE — menuItem + ingredients
export function useCreateRecipe() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (payload: {
      menuItem: string;
      ingredients: {
        rawMaterial: string;
        quantity: number;
        unit: string;
      }[];
    }) => {
      const { data } = await api.post('/recipes', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes', user?.restaurant] }),
  });
}


export function useUpdateRecipe() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async ({ id, ingredients }: {
      id: string;
      ingredients: {
        rawMaterial: string;
        quantity: number;
        unit: string;
      }[];
    }) => {
      const { data } = await api.put(`/recipes/${id}`, { ingredients });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes', user?.restaurant] }),
  });
}

// DELETE 
export function useDeleteRecipe() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/recipes/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes', user?.restaurant] }),
  });
}
