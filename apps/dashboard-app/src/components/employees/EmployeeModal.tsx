// apps/dashboard-app/src/components/employees/EmployeeModal.tsx
import { useState, useMemo } from 'react';
import { X, Eye, EyeOff, Clock } from 'lucide-react';
import {
  useAddEmployee,
  useUpdateEmployee,
  type IEmployee,
} from '../../hooks/useEmployees';

interface Props {
  employee: IEmployee | null;
  onClose: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  role: IEmployee['role'];
  salary: number;
  salaryType: IEmployee['salaryType'];
  joiningDate: string;
  password: string;
  overtimeEligible: boolean;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

const ROLES: IEmployee['role'][]             = ['manager', 'cashier', 'kitchen', 'waiter', 'delivery'];
const SALARY_TYPES: IEmployee['salaryType'][] = ['monthly', 'daily', 'hourly'];

const ROLE_COLORS: Record<string, string> = {
  manager:  'text-purple-400',
  cashier:  'text-blue-400',
  kitchen:  'text-orange-400',
  waiter:   'text-green-400',
  delivery: 'text-yellow-400',
};

const EMPTY: FormState = {
  name: '', email: '', phone: '',
  role: 'waiter', salary: 0, salaryType: 'monthly',
  joiningDate: '', password: '',
  overtimeEligible: false,
  bankDetails: { accountNumber: '', ifscCode: '', bankName: '' },
};

export default function EmployeeModal({ employee, onClose }: Props) {
  const isEdit         = !!employee;
  const addMutation    = useAddEmployee();
  const updateMutation = useUpdateEmployee();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab,    setActiveTab]    = useState<'basic' | 'bank'>('basic');

  const initial = useMemo<FormState>(() => {
    if (!employee) return EMPTY;
    return {
      name:             employee.name,
      email:            employee.email,
      phone:            employee.phone,
      role:             employee.role,
      salary:           employee.salary,
      salaryType:       employee.salaryType,
      overtimeEligible: employee.overtimeEligible ?? false,
      joiningDate:      employee.joiningDate
        ? new Date(employee.joiningDate).toISOString().split('T')[0]
        : '',
      password:    '',
      bankDetails: employee.bankDetails ?? {
        accountNumber: '', ifscCode: '', bankName: '',
      },
    };
  }, [employee]);

  const [form, setForm] = useState<FormState>(initial);

  const set = (field: keyof FormState, value: string | number | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const setBank = (field: keyof FormState['bankDetails'], value: string) =>
    setForm(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, [field]: value } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await updateMutation.mutateAsync({
        id:               employee!._id,
        name:             form.name,
        email:            form.email,
        phone:            form.phone,
        role:             form.role,
        salary:           form.salary,
        salaryType:       form.salaryType,
        joiningDate:      form.joiningDate,
        overtimeEligible: form.overtimeEligible,
        bankDetails:      form.bankDetails,
      });
    } else {
      await addMutation.mutateAsync(form);
    }
    onClose();
  };

  const loading = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isEdit ? 'Edit Employee' : 'Add Employee'}
            </h2>
            <p className="text-zinc-500 text-sm mt-0.5">
              {isEdit ? 'Update employee details' : 'Create a new employee account'}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 shrink-0">
          {(['basic', 'bank'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-orange-400 border-b-2 border-orange-500'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'basic' ? 'Basic Info' : 'Bank Details'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">

          {activeTab === 'basic' && (
            <>
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Ravi Kumar"
                  className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="ravi@email.com"
                    className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Phone *
                  </label>
                  <input
                    required
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Role *
                </label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => set('role', r)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border capitalize transition-colors ${
                        form.role === r
                          ? `bg-zinc-800 border-orange-500 ${ROLE_COLORS[r]}`
                          : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary + Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Salary (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.salary}
                    onChange={e => set('salary', parseFloat(e.target.value))}
                    className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Salary Type *
                  </label>
                  <select
                    value={form.salaryType}
                    onChange={e => set('salaryType', e.target.value)}
                    className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    {SALARY_TYPES.map(t => (
                      <option key={t} value={t} className="bg-zinc-900 capitalize">{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Joining Date */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Joining Date *
                </label>
                <input
                  required
                  type="date"
                  value={form.joiningDate}
                  onChange={e => set('joiningDate', e.target.value)}
                  className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Overtime Eligible Toggle */}
              <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                form.overtimeEligible
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-zinc-900 border-zinc-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    form.overtimeEligible ? 'bg-green-500/20' : 'bg-zinc-800'
                  }`}>
                    <Clock className={`w-4 h-4 ${
                      form.overtimeEligible ? 'text-green-400' : 'text-zinc-500'
                    }`} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Overtime Eligible</p>
                    <p className="text-zinc-500 text-xs">
                      {form.overtimeEligible
                        ? 'Overtime pay will be calculated'
                        : 'No overtime pay for this employee'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => set('overtimeEligible', !form.overtimeEligible)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.overtimeEligible ? 'bg-green-500' : 'bg-zinc-700'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.overtimeEligible ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Password — create only */}
              {!isEdit && (
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Login Password
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      placeholder="Default: restaurant@123"
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showPassword
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye    className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">
                    Leave empty to use default password: restaurant@123
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'bank' && (
            <>
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Bank Name
                </label>
                <input
                  value={form.bankDetails.bankName}
                  onChange={e => setBank('bankName', e.target.value)}
                  placeholder="e.g. State Bank of India"
                  className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Account Number
                </label>
                <input
                  value={form.bankDetails.accountNumber}
                  onChange={e => setBank('accountNumber', e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  IFSC Code
                </label>
                <input
                  value={form.bankDetails.ifscCode}
                  onChange={e => setBank('ifscCode', e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001234"
                  className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Preview Card */}
              {(form.bankDetails.bankName || form.bankDetails.accountNumber) && (
                <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-xl space-y-1.5 mt-2">
                  <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-2">
                    Preview
                  </p>
                  {form.bankDetails.bankName && (
                    <p className="text-sm text-white">{form.bankDetails.bankName}</p>
                  )}
                  {form.bankDetails.accountNumber && (
                    <p className="text-sm text-zinc-400">
                      A/C: {form.bankDetails.accountNumber}
                    </p>
                  )}
                  {form.bankDetails.ifscCode && (
                    <p className="text-sm text-zinc-400">
                      IFSC: {form.bankDetails.ifscCode}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={
              loading ||
              !form.name || !form.email ||
              !form.phone || !form.joiningDate
            }
            className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading
              ? 'Saving...'
              : isEdit ? 'Update Employee' : 'Add Employee'}
          </button>
        </div>
      </div>
    </div>
  );
}
