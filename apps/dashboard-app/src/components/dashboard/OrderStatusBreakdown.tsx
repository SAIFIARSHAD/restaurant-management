import type { DashboardData } from '../../hooks/useDashboard';

interface Props { orderStatus: DashboardData['orderStatus']; total: number }

const STATUS_LIST = [
  { key: 'pending',   label: 'Pending',   color: 'bg-amber-400',   text: 'text-amber-400'  },
  { key: 'preparing', label: 'Preparing', color: 'bg-purple-400',  text: 'text-purple-400' },
  { key: 'ready',     label: 'Ready',     color: 'bg-blue-400',    text: 'text-blue-400'   },
  { key: 'served',    label: 'Served',    color: 'bg-emerald-400', text: 'text-emerald-400'},
  { key: 'billed',    label: 'Billed',    color: 'bg-gray-400',    text: 'text-gray-400'   },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-red-400',     text: 'text-red-400'    },
];

export const OrderStatusBreakdown = ({ orderStatus, total }: Props) => (
  <div className="flex flex-col gap-3">
    {STATUS_LIST.map((s) => {
      const count = orderStatus[s.key] || 0;
      const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
      return (
        <div key={s.key}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
            <span className="text-xs text-gray-500">{count} ({pct}%)</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${s.color} transition-all duration-700`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      );
    })}
  </div>
);