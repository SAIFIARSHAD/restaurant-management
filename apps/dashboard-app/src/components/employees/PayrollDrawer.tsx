import { useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, Calculator,
  IndianRupee, CheckCircle, Clock, Download,
} from 'lucide-react';
import {
  useEmployeePayroll,
  useCalculateSalary,
  useMarkSalaryPaid,
  useDownloadPayslip,
  type IPayroll,
} from '../../hooks/usePayroll';
import type { IEmployee } from '../../hooks/useEmployees';

interface Props {
  employee: IEmployee;
  onClose: () => void;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const ROLE_COLORS: Record<string, string> = {
  manager:  'text-purple-400',
  cashier:  'text-blue-400',
  kitchen:  'text-orange-400',
  waiter:   'text-green-400',
  delivery: 'text-yellow-400',
};

export default function PayrollDrawer({ employee, onClose }: Props) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());

  const { data: payrolls = [], isLoading } = useEmployeePayroll(employee._id);
  const calculateMutation  = useCalculateSalary();
  const markPaidMutation   = useMarkSalaryPaid();
  const downloadMutation   = useDownloadPayslip();

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const currentPayroll = payrolls.find(
    p => p.month === month && p.year === year
  );

  const handleCalculate = async () => {
    await calculateMutation.mutateAsync({
      employeeId: employee._id,
      month,
      year,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-950 border-l border-zinc-800 w-full max-w-xl h-full flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">{employee.name}</h2>
            <p className={`text-sm mt-0.5 capitalize font-medium ${ROLE_COLORS[employee.role]}`}>
              {employee.role} — Payroll
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0 bg-zinc-900/50">
          <button
            onClick={prevMonth}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="text-white font-bold text-lg">
              {MONTH_NAMES[month - 1]} {year}
            </p>
            <p className="text-zinc-500 text-xs">Select month to view/calculate payroll</p>
          </div>
          <button
            onClick={nextMonth}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          
          {!currentPayroll && !isLoading && (
            <div className="text-center py-10 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <Calculator className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 font-semibold text-lg">
                Salary not calculated yet
              </p>
              <p className="text-zinc-600 text-sm mt-1 mb-5">
                {MONTH_NAMES[month - 1]} {year} payroll is pending
              </p>
              <button
                onClick={handleCalculate}
                disabled={calculateMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl mx-auto text-sm"
              >
                <Calculator className="w-4 h-4" />
                {calculateMutation.isPending ? 'Calculating...' : 'Calculate Salary'}
              </button>
            </div>
          )}

          
          {currentPayroll && (
            <PayrollCard
              payroll={currentPayroll}
              onMarkPaid={() => markPaidMutation.mutate(currentPayroll._id)}
              onDownload={() => downloadMutation.mutate(currentPayroll._id)}
              markPaidLoading={markPaidMutation.isPending}
              downloadLoading={downloadMutation.isPending}
            />
          )}

            {payrolls.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Payroll History
              </h3>
              <div className="space-y-2">
                {payrolls.map(p => (
                  <div
                    key={p._id}
                    onClick={() => { setMonth(p.month); setYear(p.year); }}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      p.month === month && p.year === year
                        ? 'bg-zinc-800 border-orange-500/40'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        {MONTH_NAMES[p.month - 1]} {p.year}
                      </p>
                      <p className="text-zinc-500 text-xs">
                        {p.presentDays}/{p.workingDays} days present
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-white font-bold text-sm justify-end">
                        <IndianRupee className="w-3.5 h-3.5 text-orange-400" />
                        {p.netSalary.toLocaleString('en-IN')}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        p.status === 'paid'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {p.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Payroll Detail Card
interface PayrollCardProps {
  payroll: IPayroll;
  onMarkPaid: () => void;
  onDownload: () => void;
  markPaidLoading: boolean;
  downloadLoading: boolean;
}

function PayrollCard({
  payroll, onMarkPaid, onDownload, markPaidLoading, downloadLoading,
}: PayrollCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

      
      <div className={`px-5 py-3 flex items-center justify-between ${
        payroll.status === 'paid'
          ? 'bg-green-500/10 border-b border-green-500/20'
          : 'bg-yellow-500/10 border-b border-yellow-500/20'
      }`}>
        <div className="flex items-center gap-2">
          {payroll.status === 'paid'
            ? <CheckCircle className="w-4 h-4 text-green-400" />
            : <Clock className="w-4 h-4 text-yellow-400" />
          }
          <span className={`text-sm font-semibold ${
            payroll.status === 'paid' ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {payroll.status === 'paid' ? 'Salary Paid' : 'Payment Pending'}
          </span>
        </div>
        {payroll.paidAt && (
          <span className="text-xs text-zinc-500">
            Paid on {new Date(payroll.paidAt).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </span>
        )}
      </div>

      <div className="p-5 space-y-5">

        
        <div>
          <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-3">
            Attendance Summary
          </p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Working Days', value: payroll.workingDays, color: 'text-zinc-300' },
              { label: 'Present',      value: payroll.presentDays,  color: 'text-green-400' },
              { label: 'Absent',       value: payroll.absentDays,   color: 'text-red-400'   },
              { label: 'OT Hours',     value: `${payroll.overtimeHours}h`, color: 'text-blue-400' },
            ].map(s => (
              <div key={s.label} className="bg-zinc-800/60 rounded-xl p-3 text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-zinc-600 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        
        <div>
          <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-3">
            Salary Breakdown
          </p>
          <div className="space-y-2">
            {[
              { label: 'Basic Salary',  value: payroll.basicSalary,  color: 'text-zinc-300', sign: '' },
              { label: 'Earned Salary', value: payroll.earnedSalary, color: 'text-white',     sign: '' },
              { label: 'Overtime Pay',  value: payroll.overtimePay,  color: 'text-green-400', sign: '+' },
              { label: 'Deductions',    value: payroll.deductions,   color: 'text-red-400',   sign: '-' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400 text-sm">{row.label}</span>
                <div className={`flex items-center gap-0.5 text-sm font-medium ${row.color}`}>
                  <span>{row.sign}</span>
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>{row.value.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}

            
            <div className="flex items-center justify-between pt-2">
              <span className="text-white font-bold text-base">Net Salary</span>
              <div className="flex items-center gap-1 text-orange-400 font-bold text-xl">
                <IndianRupee className="w-5 h-5" />
                {payroll.netSalary.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        
        <div className="flex gap-3 pt-2">
          <button
            onClick={onDownload}
            disabled={downloadLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 rounded-xl text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            {downloadLoading ? 'Downloading...' : 'Download Payslip'}
          </button>

          {payroll.status === 'pending' && (
            <button
              onClick={onMarkPaid}
              disabled={markPaidLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {markPaidLoading ? 'Processing...' : 'Mark as Paid'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
