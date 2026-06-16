import { useState } from 'react';
import {
  Clock, Calendar, Save,
  Settings, Info, RefreshCw, ChevronRight,
  ChevronDown, Plus, Trash2, Layers,
} from 'lucide-react';
import {
  usePayrollSettings,
  useUpdatePayrollSettings,
  useCreateShiftTemplate,
  useUpdateShiftTemplate,
  useDeleteShiftTemplate,
  type IPayrollSettings,
  type IShiftTemplate,
} from '../../hooks/usePayrollSettings';


const WORKING_DAY_OPTIONS = [
  { value: '22',     label: '22 Days' },
  { value: '24',     label: '24 Days' },
  { value: '26',     label: '26 Days' },
  { value: '28',     label: '28 Days' },
  { value: '30',     label: '30 Days' },
  { value: '31',     label: '31 Days' },
  { value: 'actual', label: 'Actual'  },
];

const MAX_TEMPLATES = 5;

const calcShiftHours = (start: string, end: string) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let total = (eh * 60 + em) - (sh * 60 + sm);
  if (total < 0) total += 24 * 60;
  return total > 0 ? (total / 60).toFixed(1) : '—';
};


function DefaultSettingsCard({ settings }: { settings: IPayrollSettings }) {
  const updateMutation = useUpdatePayrollSettings();
  const [open,  setOpen]  = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    salaryCalculationOn:   settings.salaryCalculationOn,
    shiftStartTime:        settings.shiftStartTime,
    shiftEndTime:          settings.shiftEndTime,
    halfDayThreshold:      settings.halfDayThreshold,
    overtimeBufferMinutes: settings.overtimeBufferMinutes,
    overtimeRatePerHour:   settings.overtimeRatePerHour,
  });

  const set = (field: keyof typeof form, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    await updateMutation.mutateAsync(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const shiftHours = calcShiftHours(form.shiftStartTime, form.shiftEndTime);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

      
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-xl">
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold text-sm">Default Settings</p>
              <span className="text-xs px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-md">
                Global
              </span>
            </div>
            <p className="text-zinc-500 text-xs mt-0.5">
              {settings.shiftStartTime} – {settings.shiftEndTime}
              &nbsp;·&nbsp;{calcShiftHours(settings.shiftStartTime, settings.shiftEndTime)}h shift
              &nbsp;·&nbsp;{settings.salaryCalculationOn === 'actual' ? 'Actual' : `${settings.salaryCalculationOn} days`}
              &nbsp;·&nbsp;OT: ₹{settings.overtimeRatePerHour}/hr
            </p>
          </div>
        </div>
        {open
          ? <ChevronDown  className="w-4 h-4 text-zinc-400 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
        }
      </button>

      
      {open && (
        <div className="border-t border-zinc-800 px-5 py-5 space-y-5">

          
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: `${shiftHours}h`,                  label: 'Shift Duration'    },
              { val: `${form.halfDayThreshold}h`,        label: 'Half Day Threshold'},
              { val: `+${form.overtimeBufferMinutes}m`,  label: 'OT Buffer'         },
            ].map(item => (
              <div key={item.label} className="bg-zinc-800/60 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-white">{item.val}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Shift Start Time
              </label>
              <input
                type="time"
                value={form.shiftStartTime}
                onChange={e => set('shiftStartTime', e.target.value)}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Shift End Time
              </label>
              <input
                type="time"
                value={form.shiftEndTime}
                onChange={e => set('shiftEndTime', e.target.value)}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/60 rounded-xl">
            <Info className="w-4 h-4 text-zinc-500 shrink-0" />
            <p className="text-zinc-500 text-xs">
              Total shift hours:{' '}
              <span className="text-orange-400 font-semibold">{shiftHours} hours</span>
            </p>
          </div>

          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Half Day (hrs)
              </label>
              <input
                type="number" min={0.5} max={12} step={0.5}
                value={form.halfDayThreshold}
                onChange={e => set('halfDayThreshold', parseFloat(e.target.value))}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              />
              <p className="text-zinc-600 text-xs mt-1">Below this = Half Day</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                OT Buffer (mins)
              </label>
              <input
                type="number" min={0} max={120} step={5}
                value={form.overtimeBufferMinutes}
                onChange={e => set('overtimeBufferMinutes', parseInt(e.target.value))}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              />
              <p className="text-zinc-600 text-xs mt-1">Mins after shift end</p>
            </div>
          </div>

          
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Overtime Rate (₹/hr)
            </label>
            <div className="flex items-center gap-3 mt-1.5">
              <input
                type="number" min={0} step={5}
                value={form.overtimeRatePerHour}
                onChange={e => set('overtimeRatePerHour', parseInt(e.target.value))}
                className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              />
              <div className="px-4 py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl shrink-0 text-center">
                <p className="text-green-400 font-bold text-sm">₹{form.overtimeRatePerHour}/hr</p>
              </div>
            </div>
          </div>

          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Working Days (Salary Calculation)
              </label>
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
          </div>

          
          <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Calculation Logic
            </p>
            {[
              { color: 'bg-red-400',    text: `Less than ${form.halfDayThreshold}h`,                              label: 'Absent',          labelColor: 'text-red-400'    },
              { color: 'bg-yellow-400', text: `${form.halfDayThreshold}h – ${shiftHours}h`,                       label: 'Half Day',        labelColor: 'text-yellow-400' },
              { color: 'bg-green-400',  text: `${shiftHours}h or more`,                                           label: 'Full Day',        labelColor: 'text-green-400'  },
              { color: 'bg-orange-400', text: `${shiftHours}h + ${form.overtimeBufferMinutes}m`,                   label: 'Overtime starts', labelColor: 'text-orange-400' },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-2 text-xs text-zinc-400">
                <span className={`w-2 h-2 rounded-full ${row.color} shrink-0`} />
                {row.text} →
                <span className={`font-semibold ${row.labelColor}`}>{row.label}</span>
              </div>
            ))}
          </div>

          
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white'
            }`}
          >
            {updateMutation.isPending
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
              : saved
                ? <><Save className="w-4 h-4" /> Saved!</>
                : <><Save className="w-4 h-4" /> Save Default Settings</>
            }
          </button>
        </div>
      )}
    </div>
  );
}


function TemplateCard({
  template,
  onDelete,
  deleting,
}: {
  template: IShiftTemplate;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const updateTemplate = useUpdateShiftTemplate();
  const [open,          setOpen]          = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    name:                  template.name,
    shiftStartTime:        template.shiftStartTime,
    shiftEndTime:          template.shiftEndTime,
    halfDayThreshold:      template.halfDayThreshold,
    overtimeBufferMinutes: template.overtimeBufferMinutes,
    overtimeRatePerHour:   template.overtimeRatePerHour,
    salaryCalculationOn:   template.salaryCalculationOn ?? '26',
    isDefault:             template.isDefault,
  });

  const set = (field: keyof typeof form, value: string | number | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const shiftHours = calcShiftHours(form.shiftStartTime, form.shiftEndTime);

  const handleSave = async () => {
    await updateTemplate.mutateAsync({ templateId: template._id.toString(), ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-colors ${
      open ? 'border-blue-500/30' : 'border-zinc-800'
    }`}>

      
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold text-sm">{template.name}</p>
              {template.isDefault && (
                <span className="text-xs px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-md">
                  Default
                </span>
              )}
            </div>
            <p className="text-zinc-500 text-xs mt-0.5">
              {template.shiftStartTime} – {template.shiftEndTime}
              &nbsp;·&nbsp;{calcShiftHours(template.shiftStartTime, template.shiftEndTime)}h shift
              &nbsp;·&nbsp;{template.salaryCalculationOn === 'actual' ? 'Actual' : `${template.salaryCalculationOn} days`}
              &nbsp;·&nbsp;OT: ₹{template.overtimeRatePerHour}/hr
            </p>
          </div>
        </div>
        {open
          ? <ChevronDown  className="w-4 h-4 text-zinc-400 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
        }
      </button>

      
      {open && (
        <div className="border-t border-zinc-800 px-5 py-5 space-y-4">

          
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Template Name
            </label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Start Time
              </label>
              <input
                type="time"
                value={form.shiftStartTime}
                onChange={e => set('shiftStartTime', e.target.value)}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                End Time
              </label>
              <input
                type="time"
                value={form.shiftEndTime}
                onChange={e => set('shiftEndTime', e.target.value)}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/60 rounded-xl">
            <Info className="w-4 h-4 text-zinc-500 shrink-0" />
            <p className="text-zinc-500 text-xs">
              Shift duration:{' '}
              <span className="text-blue-400 font-semibold">{shiftHours} hours</span>
            </p>
          </div>

          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Half Day (hrs)
              </label>
              <input
                type="number" min={0.5} max={12} step={0.5}
                value={form.halfDayThreshold}
                onChange={e => set('halfDayThreshold', parseFloat(e.target.value))}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                OT Buffer (mins)
              </label>
              <input
                type="number" min={0} max={120} step={5}
                value={form.overtimeBufferMinutes}
                onChange={e => set('overtimeBufferMinutes', parseInt(e.target.value))}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Overtime Rate (₹/hr)
            </label>
            <div className="flex items-center gap-3 mt-1.5">
              <input
                type="number" min={0} step={5}
                value={form.overtimeRatePerHour}
                onChange={e => set('overtimeRatePerHour', parseInt(e.target.value))}
                className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <div className="px-4 py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl shrink-0 text-center">
                <p className="text-green-400 font-bold text-sm">₹{form.overtimeRatePerHour}/hr</p>
              </div>
            </div>
          </div>

          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Working Days (Salary Calculation)
              </label>
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
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/60 rounded-xl mt-2">
              <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <p className="text-zinc-500 text-xs">
                Example: ₹15,000 ÷{' '}
                <span className="text-blue-400 font-semibold">
                  {form.salaryCalculationOn === 'actual' ? '~30' : form.salaryCalculationOn} days
                </span>
                {' = '}
                <span className="text-green-400 font-semibold">
                  ₹{(15000 / (form.salaryCalculationOn === 'actual' ? 30 : parseInt(form.salaryCalculationOn))).toFixed(0)}/day
                </span>
              </p>
            </div>
          </div>

          
          <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Attendance Logic
            </p>
            {[
              { color: 'bg-red-400',    text: `Less than ${form.halfDayThreshold}h`,          label: 'Absent',          labelColor: 'text-red-400'    },
              { color: 'bg-yellow-400', text: `${form.halfDayThreshold}h – ${shiftHours}h`,   label: 'Half Day',        labelColor: 'text-yellow-400' },
              { color: 'bg-green-400',  text: `${shiftHours}h or more`,                       label: 'Full Day',        labelColor: 'text-green-400'  },
              { color: 'bg-orange-400', text: `${shiftHours}h + ${form.overtimeBufferMinutes}m`, label: 'Overtime starts', labelColor: 'text-orange-400' },
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
              : 'bg-zinc-800/40 border-zinc-700'
          }`}>
            <div>
              <p className="text-white text-sm font-semibold">Set as Default</p>
              <p className="text-zinc-500 text-xs">Employees without a template will use this</p>
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

          
          <div className="flex gap-3 pt-1">
            
            {confirmDelete ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onDelete(template._id.toString())}
                  disabled={deleting}
                  className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold"
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-2 bg-zinc-800 text-zinc-400 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-red-500/10 hover:border-red-500/30 border border-zinc-700 text-zinc-400 hover:text-red-400 rounded-xl text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}

            
            <button
              type="button"
              onClick={handleSave}
              disabled={updateTemplate.isPending}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white'
              }`}
            >
              {updateTemplate.isPending
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                : saved
                  ? <><Save className="w-4 h-4" /> Saved!</>
                  : <><Save className="w-4 h-4" /> Save Template</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


function NewTemplateCard({ onSave, onCancel, saving }: {
  onSave:   (data: Omit<IShiftTemplate, '_id' | 'shiftHours'>) => Promise<void>;
  onCancel: () => void;
  saving:   boolean;
}) {
  const [form, setForm] = useState({
    name:                  '',
    shiftStartTime:        '09:00',
    shiftEndTime:          '18:00',
    halfDayThreshold:      4.5,
    overtimeBufferMinutes: 20,
    overtimeRatePerHour:   50,
    salaryCalculationOn:   '26',
    isDefault:             false,
  });

  const set = (field: keyof typeof form, value: string | number | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const shiftHours = calcShiftHours(form.shiftStartTime, form.shiftEndTime);

  return (
    <div className="bg-zinc-900 border-2 border-dashed border-blue-500/40 rounded-2xl overflow-hidden">

      
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <Plus className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-white font-semibold text-sm">New Shift Template</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-zinc-500 hover:text-white transition-colors text-xs font-semibold"
        >
          Cancel
        </button>
      </div>

      <div className="px-5 py-5 space-y-4">

        
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Template Name *
          </label>
          <input
            required
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Morning Shift, Night Shift"
            className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Start Time
            </label>
            <input
              type="time"
              value={form.shiftStartTime}
              onChange={e => set('shiftStartTime', e.target.value)}
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              End Time
            </label>
            <input
              type="time"
              value={form.shiftEndTime}
              onChange={e => set('shiftEndTime', e.target.value)}
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/60 rounded-xl">
          <Info className="w-4 h-4 text-zinc-500 shrink-0" />
          <p className="text-zinc-500 text-xs">
            Shift duration:{' '}
            <span className="text-blue-400 font-semibold">{shiftHours} hours</span>
          </p>
        </div>

        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Half Day (hrs)
            </label>
            <input
              type="number" min={0.5} max={12} step={0.5}
              value={form.halfDayThreshold}
              onChange={e => set('halfDayThreshold', parseFloat(e.target.value))}
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              OT Buffer (mins)
            </label>
            <input
              type="number" min={0} max={120} step={5}
              value={form.overtimeBufferMinutes}
              onChange={e => set('overtimeBufferMinutes', parseInt(e.target.value))}
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Overtime Rate (₹/hr)
          </label>
          <div className="flex items-center gap-3 mt-1.5">
            <input
              type="number" min={0} step={5}
              value={form.overtimeRatePerHour}
              onChange={e => set('overtimeRatePerHour', parseInt(e.target.value))}
              className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
            <div className="px-4 py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl shrink-0">
              <p className="text-green-400 font-bold text-sm">₹{form.overtimeRatePerHour}/hr</p>
            </div>
          </div>
        </div>

        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Working Days (Salary Calculation)
            </label>
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
        </div>

        
        <div className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
          form.isDefault
            ? 'bg-orange-500/10 border-orange-500/30'
            : 'bg-zinc-800/40 border-zinc-700'
        }`}>
          <div>
            <p className="text-white text-sm font-semibold">Set as Default</p>
            <p className="text-zinc-500 text-xs">Employees without a template will use this</p>
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

        
        <button
          type="button"
          onClick={() => form.name && onSave(form)}
          disabled={saving || !form.name}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors"
        >
          {saving
            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Creating...</>
            : <><Plus className="w-4 h-4" /> Create Template</>
          }
        </button>
      </div>
    </div>
  );
}

function PayrollSettingsInner({
  settings,
  shiftTemplates,
}: {
  settings:       IPayrollSettings;
  shiftTemplates: IShiftTemplate[];
}) {
  const createTemplate = useCreateShiftTemplate();
  const deleteTemplate = useDeleteShiftTemplate();
  const [showNewCard,  setShowNewCard]  = useState(false);

  const handleCreate = async (data: Omit<IShiftTemplate, '_id' | 'shiftHours'>) => {
    await createTemplate.mutateAsync(data);
    setShowNewCard(false);
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate.mutateAsync(id);
  };

  const canAdd = shiftTemplates.length < MAX_TEMPLATES;

  return (
    <div className="max-w-2xl space-y-3">

      
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-white font-bold text-lg">Payroll Settings</h1>
          <p className="text-zinc-500 text-sm">
            Configure shift hours, working days and overtime rules
          </p>
        </div>

        
        {canAdd && !showNewCard && (
          <button
            type="button"
            onClick={() => setShowNewCard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-semibold transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Template
            <span className="text-blue-300/60 text-xs font-normal">
              {shiftTemplates.length}/{MAX_TEMPLATES}
            </span>
          </button>
        )}

        
        {!canAdd && (
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl">
            <Layers className="w-4 h-4 text-zinc-500" />
            <span className="text-zinc-500 text-xs font-semibold">
              {shiftTemplates.length}/{MAX_TEMPLATES} Templates
            </span>
          </div>
        )}
      </div>

      
      <DefaultSettingsCard settings={settings} />

      
      {shiftTemplates.map(t => (
        <TemplateCard
          key={t._id.toString()}
          template={t}
          onDelete={handleDelete}
          deleting={deleteTemplate.isPending}
        />
      ))}

      
      {showNewCard && (
        <NewTemplateCard
          onSave={handleCreate}
          onCancel={() => setShowNewCard(false)}
          saving={createTemplate.isPending}
        />
      )}

      
      {shiftTemplates.length === 0 && !showNewCard && (
        <div className="text-center py-8 border border-dashed border-zinc-700 rounded-2xl">
          <Layers className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">No shift templates yet</p>
          <p className="text-zinc-600 text-xs mt-1">
            Default settings will apply to all employees
          </p>
        </div>
      )}
    </div>
  );
}


export default function PayrollSettingsPage() {
  const { data, isLoading } = usePayrollSettings();

  if (isLoading) {
    return (
      <div className="space-y-3 max-w-2xl">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-zinc-900 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <Settings className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-400 font-semibold">Settings not found</p>
      </div>
    );
  }

  return (
    <PayrollSettingsInner
      key={data.payrollSettings.shiftStartTime}
      settings={data.payrollSettings}
      shiftTemplates={data.shiftTemplates}
    />
  );
}
