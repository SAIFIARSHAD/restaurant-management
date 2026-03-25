// apps/dashboard-app/src/hooks/usePayrollSettings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export interface IPayrollSettings {
  salaryCalculationOn: '22' | '24' | '26' | '28' | '30' | '31' | 'actual';
  shiftStartTime: string;
  shiftEndTime: string;
  shiftHours: number;
  halfDayThreshold: number;
  overtimeBufferMinutes: number;
  overtimeRatePerHour: number;
}

export const usePayrollSettings = () =>
  useQuery({
    queryKey: ['payroll-settings'],
    queryFn: async () => {
      const { data } = await api.get('/settings/payroll');
      return data.data as IPayrollSettings;
    },
  });

export const useUpdatePayrollSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<IPayrollSettings, 'shiftHours'>) =>
      api.put('/settings/payroll', body).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll-settings'] }),
  });
};
