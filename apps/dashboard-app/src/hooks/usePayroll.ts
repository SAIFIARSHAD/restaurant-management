import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export interface IPayroll {
  _id: string;
  employee: {
    _id: string;
    name: string;
    role: string;
    phone: string;
  };
  month: number;
  year: number;
  basicSalary: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  overtimeHours: number;
  overtimePay: number;
  earnedSalary: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'paid';
  paidAt?: string;
  createdAt: string;
}

export const useAllPayroll = (month?: number, year?: number) =>
  useQuery({
    queryKey: ['payroll', 'all', month, year],
    queryFn: async () => {
      const params: Record<string, number> = {};
      if (month) params.month = month;
      if (year)  params.year  = year;
      const { data } = await api.get('/payroll/all', { params });
      return data.data as IPayroll[];
    },
  });


export const useEmployeePayroll = (employeeId: string) =>
  useQuery({
    queryKey: ['payroll', employeeId],
    queryFn: async () => {
      const { data } = await api.get(`/payroll/${employeeId}`);
      return data.data as IPayroll[];
    },
    enabled: !!employeeId,
  });


export const useCalculateSalary = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      month,
      year,
    }: {
      employeeId: string;
      month: number;
      year: number;
    }) =>
      api
        .post(`/payroll/calculate/${employeeId}`, { month, year })
        .then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll'] }),
  });
};

export const useMarkSalaryPaid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/payroll/${id}/pay`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll'] }),
  });
};

export const useDownloadPayslip = () =>
  useMutation({
    mutationFn: async (payrollId: string) => {
      const response = await api.get(`/payroll/${payrollId}/payslip`, {
        responseType: 'blob',
      });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `payslip-${payrollId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
