import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export interface IExpenseCategory {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface IExpense {
  _id: string;
  title: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'bank' | 'upi' | 'card' | 'other';
  note?: string;
  category: { _id: string; name: string };
  addedBy: { _id: string; name: string };
  createdAt: string;
}

export interface MonthlyReportItem {
  _id: string;
  totalAmount: number;
  count: number;
  category: { _id: string; name: string };
}

export interface ProfitReport {
  totalRevenue: number;
  totalExpense: number;
  profit: number;
  profitMargin: string;
}

export interface UpdateExpensePayload {
  id: string;
  title?: string;
  amount?: number;
  category?: string;
  date?: string;
  paymentMethod?: IExpense['paymentMethod'];
  note?: string;
}

export const useExpenseCategories = () =>
  useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const { data } = await api.get('/expenses/categories');
      return data.data as IExpenseCategory[];
    },
  });

export const useAddCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; description?: string }) =>
      api.post('/expenses/categories', body).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expense-categories'] }),
  });
};

export const useExpenses = (filters?: {
  category?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
}) =>
  useQuery({
    queryKey: ['expenses', filters],
    queryFn: async () => {
      const { data } = await api.get('/expenses', { params: filters });
      return {
        expenses:    data.data        as IExpense[],
        totalAmount: data.totalAmount as number,
        count:       data.count       as number,
      };
    },
  });

export const useAddExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      category: string;
      title: string;
      amount: number;
      date?: string;
      paymentMethod?: string;
      note?: string;
    }) => api.post('/expenses', body).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
};

export const useUpdateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateExpensePayload) =>
      api.put(`/expenses/${id}`, body).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
};

export const useDeleteExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/expenses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
};

export const useMonthlyReport = (month: number, year: number) =>
  useQuery({
    queryKey: ['expense-report-monthly', month, year],
    queryFn: async () => {
      const { data } = await api.get('/expenses/report/monthly', { params: { month, year } });
      return {
        grandTotal: data.grandTotal  as number,
        data:       data.data        as MonthlyReportItem[],
        month:      data.month       as number,
        year:       data.year        as number,
      };
    },
  });

export const useProfitReport = (month: number, year: number) =>
  useQuery({
    queryKey: ['expense-report-profit', month, year],
    queryFn: async () => {
      const { data } = await api.get('/expenses/report/profit', { params: { month, year } });
      return data.data as ProfitReport;
    },
  });
