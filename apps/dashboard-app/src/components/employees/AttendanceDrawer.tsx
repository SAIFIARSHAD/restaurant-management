import { useState } from 'react';
import { X, Clock, TrendingUp, Calendar, Wifi } from 'lucide-react';
import { useEmployeeAttendance, type IEmployee } from '../../hooks/useEmployees';

interface Props {
  employee: IEmployee;
  onClose: () => void;
}

const STATUS_COLORS = {
  active:      'bg-green-500/10 text-green-400 border-green-500/30',
  completed:   'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'auto-logout': 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function AttendanceDrawer({ employee, onClose }: Props) {
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');

  const { data, isLoading } = useEmployeeAttendance(
    employee._id,
    startDate || undefined,
    endDate   || undefined,
  );

  const summary = data?.summary;
  const records = data?.records ?? [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-950 border-l border-zinc-800 w-full max-w-xl h-full flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">{employee.name}</h2>
            <p className="text-zinc-500 text-sm mt-0.5 capitalize">
              {employee.role} — Attendance History
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        
        <div className="flex gap-3 px-6 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex-1">
            <label className="text-xs text-zinc-500 uppercase font-semibold mb-1 block">From</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-zinc-500 uppercase font-semibold mb-1 block">To</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-xl text-sm font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        
        {summary && (
          <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-zinc-800 shrink-0">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <Calendar className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-blue-400">{summary.totalDays}</p>
              <p className="text-xs text-zinc-500">Days Present</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <Clock className="w-4 h-4 text-orange-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-orange-400">{summary.totalHours}</p>
              <p className="text-xs text-zinc-500">Total Hours</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-green-400">{summary.totalOvertime}</p>
              <p className="text-xs text-zinc-500">Overtime</p>
            </div>
          </div>
        )}

        
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {isLoading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && records.length === 0 && (
            <div className="text-center py-16">
              <Calendar className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 font-semibold">No attendance records</p>
              <p className="text-zinc-600 text-sm mt-1">Try changing the date range</p>
            </div>
          )}

          {!isLoading && records.map(rec => {
            const login  = new Date(rec.loginTime);
            const logout = rec.logoutTime ? new Date(rec.logoutTime) : null;
            const hrs    = rec.shiftDuration ? Math.floor(rec.shiftDuration / 60) : 0;
            const mins   = rec.shiftDuration ? rec.shiftDuration % 60 : 0;

            return (
              <div key={rec._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-semibold text-sm">
                    {new Date(rec.date).toLocaleDateString('en-IN', {
                      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </p>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border capitalize ${STATUS_COLORS[rec.status]}`}>
                    {rec.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-green-400" />
                    <span>In: {login.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {logout && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-red-400" />
                      <span>Out: {logout.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                  {rec.shiftDuration ? (
                    <span className="text-orange-400 font-semibold ml-auto">
                      {hrs}h {mins}m
                    </span>
                  ) : null}
                </div>
                {rec.overtimeMinutes && rec.overtimeMinutes > 0 ? (
                  <p className="text-xs text-green-400 mt-1.5">
                    +{Math.floor(rec.overtimeMinutes / 60)}h {rec.overtimeMinutes % 60}m overtime
                  </p>
                ) : null}
                <div className="flex items-center gap-1 mt-1.5">
                  <Wifi className="w-3 h-3 text-zinc-600" />
                  <span className="text-zinc-600 text-xs">{rec.loginIp}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
