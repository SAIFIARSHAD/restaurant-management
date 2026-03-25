import { useState } from 'react';
import { Plus, Search, Users, Clock, UserCheck, AlertCircle } from 'lucide-react';
import { useEmployees, useTodayAttendance } from '../../hooks/useEmployees';
import EmployeeTable from '../../components/employees/EmployeeTable';
import EmployeeModal from '../../components/employees/EmployeeModal';

const ROLE_COLORS: Record<string, string> = {
  manager:  'bg-purple-500/10 text-purple-400 border-purple-500/30',
  cashier:  'bg-blue-500/10 text-blue-400 border-blue-500/30',
  kitchen:  'bg-orange-500/10 text-orange-400 border-orange-500/30',
  waiter:   'bg-green-500/10 text-green-400 border-green-500/30',
  delivery: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
};

export default function EmployeesPage() {
  const { data: employees = [], isLoading } = useEmployees();
  const { data: todayAttendance = [] }      = useTodayAttendance();
  const [showModal, setShowModal] = useState(false);
  const [search,    setSearch]    = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filtered = employees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
                        emp.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter ? emp.role === roleFilter : true;
    return matchSearch && matchRole;
  });

  const presentToday = todayAttendance.filter(a => a.status === 'active').length;

  const STATS = [
    {
      label: 'Total Employees',
      value: employees.length,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Present Today',
      value: presentToday,
      icon: UserCheck,
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
    },
    {
      label: 'Absent Today',
      value: employees.length - presentToday,
      icon: AlertCircle,
      color: employees.length - presentToday > 0 ? 'text-red-400' : 'text-zinc-400',
      bg: employees.length - presentToday > 0
        ? 'bg-red-500/10 border-red-500/20'
        : 'bg-zinc-800/50 border-zinc-700/50',
    },
    {
      label: 'Avg Shift Today',
      value: todayAttendance.length > 0
        ? (() => {
            const totalMins = todayAttendance.reduce((s, a) => s + (a.shiftDuration || 0), 0);
            const avg = Math.floor(totalMins / todayAttendance.length);
            return `${Math.floor(avg / 60)}h ${avg % 60}m`;
          })()
        : '—',
      icon: Clock,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
    },
  ];

  const ROLES = ['manager', 'cashier', 'kitchen', 'waiter', 'delivery'];

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Employee Management</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Manage staff, track attendance and monitor shifts
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`p-5 rounded-2xl border ${s.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {s.label}
                </span>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setRoleFilter('')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              roleFilter === ''
                ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            All
          </button>
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(roleFilter === r ? '' : r)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border capitalize transition-colors ${
                roleFilter === r
                  ? `${ROLE_COLORS[r]} border-current`
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto bg-zinc-900/50 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-zinc-700">
            <Users className="w-10 h-10 text-zinc-600" />
          </div>
          <p className="text-zinc-400 text-lg font-semibold">No employees found</p>
          <p className="text-zinc-600 text-sm mt-1">
            {search || roleFilter ? 'Try changing your filters' : 'No employees added yet'}
          </p>
          {!search && !roleFilter && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-5 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm"
            >
              + Add First Employee
            </button>
          )}
        </div>
      )}

      
      {!isLoading && filtered.length > 0 && (
        <EmployeeTable employees={filtered} />
      )}

      
      {showModal && (
        <EmployeeModal employee={null} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
