import { useState } from 'react';
import { X, Clock, Info, Calendar } from 'lucide-react';
import type { IShiftTemplate } from '../../hooks/usePayrollSettings';

interface Props {
  template: IShiftTemplate | null;
  onClose:  () => void;
  onSave:   (data: Omit<IShiftTemplate, '_id' | 'shiftHours'>) => Promise<void>;
  saving:   boolean;
}

const WORKING_DAY_OPTIONS = [
  { value: '22',     label: '22 Days' },
  { value: '24',     label: '24 Days' },
  { value: '26',     label: '26 Days' },
  { value: '28',     label: '28 Days' },
  { value: '30',     label: '30 Days' },
  { value: '31',     label: '31 Days' },
  { value: 'actual', label: 'Actual'  },
];

export default function ShiftTemplateModal({
  template, onClose, onSave, saving,
}: Props) {
  const isEdit = !!template;

  const [form, setForm] = useState<Omit<IShiftTemplate, '_id' | 'shiftHours'>>({
    name:                  template?.name                  ?? '',
    shiftStartTime:        template?.shiftStartTime        ?? '09:00',
    shiftEndTime:          template?.shiftEndTime          ?? '18:00',
    halfDayThreshold:      template?.halfDayThreshold      ?? 4.5,
    overtimeBufferMinutes: template?.overtimeBufferMinutes ?? 20,
    overtimeRatePerHour:   template?.overtimeRatePerHour   ?? 50,
    salaryCalculationOn:   template?.salaryCalculationOn   ?? '26',  // ← NEW
    isDefault:             template?.isDefault             ?? false,
  });

  const set = (field: keyof typeof form, value: string | number | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const calcShiftHours = () => {
    const [startH, startM] = form.shiftStartTime.split(':').map(Number);
    const [endH,   endM  ] = form.shiftEndTime.split(':').map(Number);
    let total = (endH * 60 + endM) - (startH * 60 + startM);
    if (total < 0) total += 24 * 60;
    return total > 0 ? (total / 60).toFixed(1) : '—';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEdit ? 'Edit Template' : 'New Shift Template'}
              </h2>
              <p className="text-zinc-500 text-xs mt-0.5">
                {isEdit ? 'Update shift settings' : 'Create a new shift configuration'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">

          
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Template Name *
            </label>
            <input
              required
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Morning Shift, Night Shift"
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Start Time *
              </label>
              <input
                required
                type="time"
                value={form.shiftStartTime}
                onChange={e => set('shiftStartTime', e.target.value)}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                End Time *
              </label>
              <input
                required
                type="time"
                value={form.shiftEndTime}
                onChange={e => set('shiftEndTime', e.target.value)}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/60 rounded-xl">
            <Info className="w-4 h-4 text-zinc-500 shrink-0" />
            <p className="text-zinc-500 text-xs">
              Shift duration:{' '}
              <span className="text-blue-400 font-semibold">{calcShiftHours()} hours</span>
            </p>
          </div>

          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Half Day (hrs)
              </label>
              <input
                type="number"
                min={0.5} max={12} step={0.5}
                value={form.halfDayThreshold}
                onChange={e => set('halfDayThreshold', parseFloat(e.target.value))}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <p className="text-zinc-600 text-xs mt-1">
                Below this = Half Day
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                OT Buffer (mins)
              </label>
              <input
                type="number"
                min={0} max={120} step={5}
                value={form.overtimeBufferMinutes}
                onChange={e => set('overtimeBufferMinutes', parseInt(e.target.value))}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <p className="text-zinc-600 text-xs mt-1">
                Mins after shift end
              </p>
            </div>
          </div>

          
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Overtime Rate (₹/hr)
            </label>
            <div className="flex items-center gap-3 mt-1.5">
              <input
                type="number"
                min={0} step={5}
                value={form.overtimeRatePerHour}
                onChange={e => set('overtimeRatePerHour', parseInt(e.target.value))}
                className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <div className="px-4 py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl text-center shrink-0">
                <p className="text-green-400 font-bold text-sm">
                  ₹{form.overtimeRatePerHour}/hr
                </p>
              </div>
            </div>
          </div>

          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <p className="text-white text-sm font-semibold">
                  Working Days (Salary Calculation)
                </p>
                <p className="text-zinc-500 text-xs mt-0.5">
                  Monthly salary kitne days se divide hogi
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {WORKING_DAY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('salaryCalculationOn', opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                    form.salaryCalculationOn === opt.value
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/60 rounded-xl">
              <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <p className="text-zinc-500 text-xs">
                Example: ₹15,000 salary ÷{' '}
                <span className="text-blue-400 font-semibold">
                  {form.salaryCalculationOn === 'actual'
                    ? '~30 days'
                    : `${form.salaryCalculationOn} days`}
                </span>
                {' = '}
                <span className="text-green-400 font-semibold">
                  ₹{form.salaryCalculationOn === 'actual'
                    ? (15000 / 30).toFixed(0)
                    : (15000 / parseInt(form.salaryCalculationOn)).toFixed(0)
                  }/day
                </span>
              </p>
            </div>
          </div>

          
          <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Preview — Attendance Logic
            </p>
            {[
              { color: 'bg-red-400',    text: `< ${form.halfDayThreshold}h worked`,                     label: 'Absent',          labelColor: 'text-red-400'    },
              { color: 'bg-yellow-400', text: `${form.halfDayThreshold}h – ${calcShiftHours()}h worked`, label: 'Half Day',        labelColor: 'text-yellow-400' },
              { color: 'bg-green-400',  text: `≥ ${calcShiftHours()}h worked`,                          label: 'Full Day',        labelColor: 'text-green-400'  },
              { color: 'bg-orange-400', text: `${calcShiftHours()}h + ${form.overtimeBufferMinutes}min`, label: 'Overtime starts', labelColor: 'text-orange-400' },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-2 text-xs text-zinc-400">
                <span className={`w-2 h-2 rounded-full ${row.color} shrink-0`} />
                {row.text} →
                <span className={`font-semibold ${row.labelColor}`}>{row.label}</span>
              </div>
            ))}
          </div>

          
          <div className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
            form.isDefault
              ? 'bg-orange-500/10 border-orange-500/30'
              : 'bg-zinc-900 border-zinc-700'
          }`}>
            <div>
              <p className="text-white text-sm font-semibold">Set as Default</p>
              <p className="text-zinc-500 text-xs">
                Employees without a template will use this
              </p>
            </div>
            <button
              type="button"
              onClick={() => set('isDefault', !form.isDefault)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.isDefault ? 'bg-orange-500' : 'bg-zinc-700'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.isDefault ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

        </form>

        
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
            disabled={saving || !form.name}
            className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  );
}
