// apps/dashboard-app/src/components/employees/AttendanceDrawer.tsx
import { useState } from 'react';
import {
  X, Clock, TrendingUp, Calendar,
  Wifi, ChevronDown, ChevronUp, Sun,
} from 'lucide-react';
import { useEmployeeAttendance, type IEmployee } from '../../hooks/useEmployees';

interface Props {
  employee: IEmployee;
  onClose: () => void;
}

const DAY_STATUS_COLORS = {
  present:   'bg-green-500/10 text-green-400 border-green-500/30',
  'half-day':'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  absent:    'bg-red-500/10 text-red-400 border-red-500/30',
};

const SESSION_STATUS_COLORS = {
  active:       'bg-green-500/10 text-green-400 border-green-500/30',
  completed:    'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'auto-logout':'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function AttendanceDrawer({ employee, onClose }: Props) {
  const [startDate,      setStartDate]      = useState('');
  const [endDate,        setEndDate]        = useState('');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

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
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Filter */}
        <div className="flex gap-3 px-6 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex-1">
            <label className="text-xs text-zinc-500 uppercase font-semibold mb-1 block">
              From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-zinc-500 uppercase font-semibold mb-1 block">
              To
            </label>
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

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-4 gap-2 px-6 py-4 border-b border-zinc-800 shrink-0">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <Calendar className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-400">{summary.totalDays}</p>
              <p className="text-xs text-zinc-500">Total Days</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
              <Sun className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-400">{summary.fullDays}</p>
              <p className="text-xs text-zinc-500">Full Days</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
              <Clock className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-yellow-400">{summary.halfDays}</p>
              <p className="text-xs text-zinc-500">Half Days</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
              <TrendingUp className="w-4 h-4 text-orange-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-orange-400">{summary.totalOvertime}</p>
              <p className="text-xs text-zinc-500">Overtime</p>
            </div>
          </div>
        )}

        {/* Records */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">

          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-zinc-900 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && records.length === 0 && (
            <div className="text-center py-16">
              <Calendar className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 font-semibold">No attendance records</p>
              <p className="text-zinc-600 text-sm mt-1">
                Try changing the date range
              </p>
            </div>
          )}

          {/* Records List */}
          {!isLoading && records.map(rec => {
            const totalHrs  = Math.floor(rec.totalMinutes / 60);
            const totalMins = rec.totalMinutes % 60;
            const isExpanded = expandedRecord === rec._id;

            return (
              <div
                key={rec._id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
              >
                {/* Record Header */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedRecord(isExpanded ? null : rec._id)
                  }
                  className="w-full p-4 text-left hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Day Status Badge */}
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border capitalize ${
                        DAY_STATUS_COLORS[rec.dayStatus]
                      }`}>
                        {rec.dayStatus === 'half-day'
                          ? 'Half Day'
                          : rec.dayStatus.charAt(0).toUpperCase() + rec.dayStatus.slice(1)}
                      </span>
                      <p className="text-white font-semibold text-sm">
                        {new Date(rec.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day:     '2-digit',
                          month:   'short',
                          year:    'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Total time */}
                      <span className="text-orange-400 font-bold text-sm">
                        {totalHrs}h {totalMins}m
                      </span>
                      {/* Sessions count */}
                      {rec.sessions.length > 1 && (
                        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-md">
                          {rec.sessions.length} sessions
                        </span>
                      )}
                      {isExpanded
                        ? <ChevronUp   className="w-4 h-4 text-zinc-500" />
                        : <ChevronDown className="w-4 h-4 text-zinc-500" />
                      }
                    </div>
                  </div>

                  {/* Overtime row */}
                  {rec.overtimeMinutes > 0 && (
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +{Math.floor(rec.overtimeMinutes / 60)}h{' '}
                      {rec.overtimeMinutes % 60}m overtime
                    </p>
                  )}
                </button>

                {/* Expanded — Sessions Detail */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 px-4 pb-4 pt-3 space-y-2">
                    <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-2">
                      Session Breakdown
                    </p>
                    {rec.sessions.map((session, idx) => {
                      const loginT  = new Date(session.loginTime);
                      const logoutT = session.logoutTime
                        ? new Date(session.logoutTime)
                        : null;
                      const sHrs  = Math.floor(session.durationMinutes / 60);
                      const sMins = session.durationMinutes % 60;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-zinc-800/60 rounded-xl px-3 py-2.5"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-500 text-xs font-semibold w-5">
                              #{idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-zinc-300">
                                  {loginT.toLocaleTimeString('en-IN', {
                                    hour:   '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {logoutT && (
                                  <>
                                    <span className="text-zinc-600">→</span>
                                    <Clock className="w-3.5 h-3.5 text-red-400" />
                                    <span className="text-zinc-300">
                                      {logoutT.toLocaleTimeString('en-IN', {
                                        hour:   '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </>
                                )}
                                {!logoutT && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded border ${
                                    SESSION_STATUS_COLORS['active']
                                  }`}>
                                    Active
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Wifi className="w-3 h-3 text-zinc-600" />
                                <span className="text-zinc-600 text-xs">
                                  {session.loginIp}
                                </span>
                              </div>
                            </div>
                          </div>
                          {session.durationMinutes > 0 && (
                            <span className="text-orange-400 text-sm font-semibold">
                              {sHrs}h {sMins}m
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
