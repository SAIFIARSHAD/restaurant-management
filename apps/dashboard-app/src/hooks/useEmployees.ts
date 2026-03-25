// apps/dashboard-app/src/hooks/useEmployees.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

export interface IEmployee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'manager' | 'cashier' | 'kitchen' | 'waiter' | 'delivery';
  salary: number;
  salaryType: 'monthly' | 'daily' | 'hourly';
  joiningDate: string;
  bankDetails: BankDetails;
  overtimeEligible: boolean;   // ← NEW
  isActive: boolean;
  userId: string;
  createdAt: string;
}

export interface ISession {
  loginTime: string;
  logoutTime?: string;
  durationMinutes: number;
  loginIp: string;
}

export interface IAttendance {
  _id: string;
  date: string;
  sessions: ISession[];          // ← NEW multi-session
  totalMinutes: number;          // ← NEW
  overtimeMinutes: number;
  dayStatus: 'present' | 'half-day' | 'absent';  // ← NEW
  status: 'active' | 'completed' | 'auto-logout';
  lastHeartbeat: string;
  employee: {
    _id: string;
    name: string;
    role: string;
    phone: string;
  };
}

export interface AttendanceSummary {
  totalDays: number;
  fullDays: number;              // ← NEW
  halfDays: number;              // ← NEW
  totalHours: string;
  totalOvertime: string;
}

// ── Get all employees ─────────────────────────────────────
export const useEmployees = () =>
  useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data } = await api.get('/employees');
      return data.data as IEmployee[];
    },
  });

// ── Today attendance ──────────────────────────────────────
export const useTodayAttendance = () =>
  useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      const { data } = await api.get('/employees/attendance/today');
      return data.data as IAttendance[];
    },
    refetchInterval: 60000,
  });

// ── Employee attendance history ───────────────────────────
export const useEmployeeAttendance = (
  employeeId: string,
  startDate?: string,
  endDate?: string,
) =>
  useQuery({
    queryKey: ['attendance', employeeId, startDate, endDate],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate)   params.endDate   = endDate;
      const { data } = await api.get(
        `/employees/attendance/${employeeId}`,
        { params }
      );
      return {
        summary: data.summary as AttendanceSummary,
        records: data.data    as IAttendance[],
      };
    },
    enabled: !!employeeId,
  });

// ── Add employee ──────────────────────────────────────────
export const useAddEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      body: Omit<IEmployee, '_id' | 'isActive' | 'createdAt' | 'userId'> & {
        password?: string;
      }
    ) => api.post('/employees', body).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

// ── Update employee ───────────────────────────────────────
export const useUpdateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<IEmployee> & { id: string }) =>
      api.put(`/employees/${id}`, body).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

// ── Delete employee ───────────────────────────────────────
export const useDeleteEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/employees/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

// ── Toggle overtime eligibility ───────────────────────────
export const useToggleOvertime = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      overtimeEligible,
    }: {
      employeeId: string;
      overtimeEligible: boolean;
    }) =>
      api
        .patch('/settings/overtime-eligibility', { employeeId, overtimeEligible })
        .then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};
