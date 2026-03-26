import { useState } from 'react';
import {
  Clock, IndianRupee, Calendar, Save,
  Settings, Info, RefreshCw,
  Layers, Plus, Pencil, Trash2,
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
import ShiftTemplateModal from '../../components/employees/ShiftTemplateModal';

function PayrollSettingsForm({
  settings,
  shiftTemplates,
}: {
  settings:       IPayrollSettings;
  shiftTemplates: IShiftTemplate[];
}) {
  const updateMutation  = useUpdatePayrollSettings();
  const createTemplate  = useCreateShiftTemplate();
  const updateTemplate  = useUpdateShiftTemplate();
  const deleteTemplate  = useDeleteShiftTemplate();

  const [saved,              setSaved]              = useState(false);
  const [showTemplateModal,  setShowTemplateModal]  = useState(false);
  const [editTemplate,       setEditTemplate]       = useState<IShiftTemplate | null>(null);
  const [confirmDeleteId,    setConfirmDeleteId]    = useState<string | null>(null);

  const [form, setForm] = useState<Omit<IPayrollSettings, 'shiftHours'>>({
    salaryCalculationOn:   settings.salaryCalculationOn,
    shiftStartTime:        settings.shiftStartTime,
    shiftEndTime:          settings.shiftEndTime,
    halfDayThreshold:      settings.halfDayThreshold,
    overtimeBufferMinutes: settings.overtimeBufferMinutes,
    overtimeRatePerHour:   settings.overtimeRatePerHour,
  });

  const set = (field: keyof typeof form, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const calcShiftHours = (start = form.shiftStartTime, end = form.shiftEndTime) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH,   endM  ] = end.split(':').map(Number);
    let total = (endH * 60 + endM) - (startH * 60 + startM);
    if (total < 0) total += 24 * 60;
    return total > 0 ? (total / 60).toFixed(1) : '—';
  };

  const handleSave = async () => {
    await updateMutation.mutateAsync(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteTemplate = async (id: string) => {
    await deleteTemplate.mutateAsync(id);
    setConfirmDeleteId(null);
  };

  const WORKING_DAY_OPTIONS = [
    { value: '22',     label: '22 Days'             },
    { value: '24',     label: '24 Days'             },
    { value: '26',     label: '26 Days'             },
    { value: '28',     label: '28 Days'             },
    { value: '30',     label: '30 Days'             },
    { value: '31',     label: '31 Days'             },
    { value: 'actual', label: 'Actual (Month Days)' },
  ];

  return (
    <div className="max-w-2xl space-y-6">

      
      <p className="text-zinc-500 text-sm">
        Configure shift hours, working days and overtime rules
      </p>

      
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5">
        <p className="text-xs text-orange-400 uppercase font-semibold tracking-wider mb-3">
          Current Configuration Preview
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{calcShiftHours()}h</p>
            <p className="text-xs text-zinc-500 mt-1">Shift Duration</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{form.halfDayThreshold}h</p>
            <p className="text-xs text-zinc-500 mt-1">Half Day Threshold</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">+{form.overtimeBufferMinutes}m</p>
            <p className="text-xs text-zinc-500 mt-1">OT Buffer After Shift</p>
          </div>
        </div>
      </div>

      
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-blue-400" />
          <h2 className="text-white font-semibold">Working Days</h2>
        </div>
        <p className="text-zinc-500 text-xs">
          Salary will be calculated based on this number of working days per month.
        </p>
        <div className="flex flex-wrap gap-2">
          {WORKING_DAY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('salaryCalculationOn', opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
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

      
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-orange-400" />
          <h2 className="text-white font-semibold">Default Shift Timing</h2>
        </div>
        <p className="text-zinc-500 text-xs">
          Define standard shift start and end times for your restaurant.
        </p>
        <div className="grid grid-cols-2 gap-4">
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
            Total shift hours auto calculated:{' '}
            <span className="text-orange-400 font-semibold">{calcShiftHours()} hours</span>
          </p>
        </div>
      </div>

      
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <RefreshCw className="w-4 h-4 text-yellow-400" />
          <h2 className="text-white font-semibold">Attendance Rules</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Half Day if less than (hrs)
            </label>
            <input
              type="number"
              min={0.5} max={12} step={0.5}
              value={form.halfDayThreshold}
              onChange={e => set('halfDayThreshold', parseFloat(e.target.value))}
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            />
            <p className="text-zinc-600 text-xs mt-1">
              Below this = Half Day, above = Full Day
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Overtime starts after (mins)
            </label>
            <input
              type="number"
              min={0} max={120} step={5}
              value={form.overtimeBufferMinutes}
              onChange={e => set('overtimeBufferMinutes', parseInt(e.target.value))}
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            />
            <p className="text-zinc-600 text-xs mt-1">
              Minutes after shift end before OT counts
            </p>
          </div>
        </div>

        
        <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Calculation Logic
          </p>
          {[
            { color: 'bg-red-400',    text: `Less than ${form.halfDayThreshold} hrs`,                       label: 'Absent',         labelColor: 'text-red-400'    },
            { color: 'bg-yellow-400', text: `${form.halfDayThreshold} hrs to ${calcShiftHours()} hrs`,      label: 'Half Day',       labelColor: 'text-yellow-400' },
            { color: 'bg-green-400',  text: `${calcShiftHours()} hrs or more`,                              label: 'Full Day',       labelColor: 'text-green-400'  },
            { color: 'bg-orange-400', text: `${calcShiftHours()} hrs + ${form.overtimeBufferMinutes} mins`, label: 'Overtime starts', labelColor: 'text-orange-400' },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-2 text-xs text-zinc-400">
              <span className={`w-2 h-2 rounded-full ${row.color} shrink-0`} />
              {row.text} →
              <span className={`font-semibold ${row.labelColor}`}>{row.label}</span>
            </div>
          ))}
        </div>
      </div>

      
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <IndianRupee className="w-4 h-4 text-green-400" />
          <h2 className="text-white font-semibold">Overtime Pay Rate</h2>
        </div>
        <p className="text-zinc-500 text-xs">
          Per hour overtime rate applied only to eligible employees.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Rate per hour (₹)
            </label>
            <input
              type="number"
              min={0} step={5}
              value={form.overtimeRatePerHour}
              onChange={e => set('overtimeRatePerHour', parseInt(e.target.value))}
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="mt-5 px-5 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
            <p className="text-green-400 font-bold text-xl">₹{form.overtimeRatePerHour}</p>
            <p className="text-zinc-500 text-xs">per hour</p>
          </div>
        </div>
      </div>

      
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h2 className="text-white font-semibold">Shift Templates</h2>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-md">
              {shiftTemplates.length}/5
            </span>
          </div>
          {shiftTemplates.length < 5 && (
            <button
              type="button"
              onClick={() => { setEditTemplate(null); setShowTemplateModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Template
            </button>
          )}
        </div>

        <p className="text-zinc-500 text-xs">
          Create shift templates for different working hours.
          Assign to employees from the Employees tab.
        </p>

        
        {shiftTemplates.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-zinc-700 rounded-xl">
            <Layers className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">No shift templates yet</p>
            <p className="text-zinc-600 text-xs mt-1">
              Default payroll settings will apply to all employees
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {shiftTemplates.map(t => (
              <div
                key={t._id}
                className="flex items-center justify-between p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-semibold">{t.name}</p>
                      {t.isDefault && (
                        <span className="text-xs px-1.5 py-0.5 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-md">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {t.shiftStartTime} – {t.shiftEndTime}
                      &nbsp;·&nbsp;{calcShiftHours(t.shiftStartTime, t.shiftEndTime)}h shift
                      &nbsp;·&nbsp;Half day: {t.halfDayThreshold}h
                      &nbsp;·&nbsp;OT: ₹{t.overtimeRatePerHour}/hr
                    </p>
                  </div>
                </div>

                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { setEditTemplate(t); setShowTemplateModal(true); }}
                    className="p-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-white rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {confirmDeleteId === t._id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteTemplate(t._id)}
                        disabled={deleteTemplate.isPending}
                        className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-xs rounded-lg font-semibold"
                      >
                        {deleteTemplate.isPending ? '...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 bg-zinc-700 text-zinc-400 text-xs rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(t._id)}
                      className="p-1.5 bg-zinc-700 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      
      <button
        onClick={handleSave}
        disabled={updateMutation.isPending}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
          saved
            ? 'bg-green-500 text-white'
            : 'bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white'
        }`}
      >
        {updateMutation.isPending
          ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
          : saved
            ? <><Save className="w-4 h-4" /> Settings Saved!</>
            : <><Save className="w-4 h-4" /> Save Payroll Settings</>
        }
      </button>

      
      {showTemplateModal && (
        <ShiftTemplateModal
          template={editTemplate}
          onClose={() => { setShowTemplateModal(false); setEditTemplate(null); }}
          onSave={async data => {
            if (editTemplate) {
              await updateTemplate.mutateAsync({
                templateId: editTemplate._id,
                ...data,
              });
            } else {
              await createTemplate.mutateAsync(data);
            }
            setShowTemplateModal(false);
            setEditTemplate(null);
          }}
          saving={createTemplate.isPending || updateTemplate.isPending}
        />
      )}
    </div>
  );
}


export default function PayrollSettingsPage() {
  const { data, isLoading } = usePayrollSettings();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-zinc-900 rounded-2xl animate-pulse" />
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
    <PayrollSettingsForm
      key={data.payrollSettings.shiftStartTime}
      settings={data.payrollSettings}
      shiftTemplates={data.shiftTemplates}
    />
  );
}
