import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export interface IShiftTemplate {
  _id: string;
  name: string;
  shiftStartTime: string;
  shiftEndTime: string;
  shiftHours: number;
  halfDayThreshold: number;
  overtimeBufferMinutes: number;
  overtimeRatePerHour: number;
  salaryCalculationOn:   string;
  isDefault: boolean;
}

export interface IPayrollSettings {
  salaryCalculationOn: '22' | '24' | '26' | '28' | '30' | '31' | 'actual';
  shiftStartTime: string;
  shiftEndTime: string;
  shiftHours: number;
  halfDayThreshold: number;
  overtimeBufferMinutes: number;
  overtimeRatePerHour: number;
}

export interface IPayrollSettingsResponse {
  payrollSettings: IPayrollSettings;
  shiftTemplates:  IShiftTemplate[];
}


export const usePayrollSettings = () =>
  useQuery({
    queryKey: ['payroll-settings'],
    queryFn:  async () => {
      const { data } = await api.get('/settings/payroll');
      return data.data as IPayrollSettingsResponse;
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


export const useCreateShiftTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<IShiftTemplate, '_id' | 'shiftHours'>) =>
      api.post('/settings/shift-templates', body).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll-settings'] }),
  });
};


export const useUpdateShiftTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      templateId,
      ...body
    }: Omit<IShiftTemplate, 'shiftHours' | '_id'> & { templateId: string }) =>
      api
        .put(`/settings/shift-templates/${templateId}`, body)
        .then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll-settings'] }),
  });
};


export const useDeleteShiftTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      api.delete(`/settings/shift-templates/${templateId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll-settings'] }),
  });
};


export const useAssignShiftTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      templateId,
    }: {
      employeeId: string;
      templateId: string | null;
    }) =>
      api
        .patch('/settings/shift-templates/assign', { employeeId, templateId })
        .then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      qc.invalidateQueries({ queryKey: ['payroll-settings'] });
    },
  });
};
