import { Briefcase, DollarSign, ChefHat, UtensilsCrossed, Bike } from 'lucide-react';
import type { DashboardData } from '../../hooks/useDashboard';

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  manager:  { label: 'Manager',  color: 'text-purple-400',  bg: 'bg-purple-500/10',  icon: Briefcase       },
  cashier:  { label: 'Cashier',  color: 'text-blue-400',    bg: 'bg-blue-500/10',    icon: DollarSign      },
  kitchen:  { label: 'Kitchen',  color: 'text-orange-400',  bg: 'bg-orange-500/10',  icon: ChefHat         },
  waiter:   { label: 'Waiter',   color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: UtensilsCrossed },
  delivery: { label: 'Delivery', color: 'text-amber-400',   bg: 'bg-amber-500/10',   icon: Bike            },
};

export const StaffOnDuty = ({ staff }: { staff: DashboardData['staff'] }) => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-xs text-gray-400">
        <span className="text-emerald-400 font-bold">{staff.totalPresent}</span> on duty today
      </span>
    </div>
    {Object.keys(staff.byRole).length === 0 ? (
      <p className="text-xs text-gray-600 text-center py-4">No staff checked in yet</p>
    ) : (
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(staff.byRole).map(([role, count]) => {
          const cfg = ROLE_CONFIG[role] || {
            label: role, color: 'text-gray-400',
            bg: 'bg-gray-700/40', icon: Briefcase,
          };
          const Icon = cfg.icon;
          return (
            <div key={role}
              className="flex items-center gap-2.5 bg-gray-800/50
                         border border-gray-700/40 rounded-xl px-3 py-2.5">
              <div className={`p-1.5 rounded-lg ${cfg.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
              </div>
              <div>
                <p className={`text-sm font-bold ${cfg.color}`}>{count}</p>
                <p className="text-[10px] text-gray-500">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);