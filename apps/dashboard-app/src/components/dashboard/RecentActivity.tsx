import { Receipt } from 'lucide-react';
import type { DashboardData } from '../../hooks/useDashboard';

const timeAgo = (date: string) => {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
};

const METHOD_COLOR: Record<string, string> = {
  cash: 'text-emerald-400',
  upi:  'text-blue-400',
  card: 'text-purple-400',
};

export const RecentActivity = ({ activity }: { activity: DashboardData['recentActivity'] }) => (
  <div className="flex flex-col gap-2 max-h-56 overflow-y-auto
                  scrollbar-thin scrollbar-thumb-gray-700">
    {activity.length === 0 && (
      <p className="text-xs text-gray-600 text-center py-6">No activity yet</p>
    )}
    {activity.map((bill) => (
      <div key={bill._id}
        className="flex items-center gap-3 bg-gray-800/40 rounded-xl px-3 py-2.5
                   hover:bg-gray-800 transition border border-gray-700/30">
        <div className="p-1.5 bg-emerald-500/10 rounded-lg">
          <Receipt className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-200 font-medium truncate">
            Table <span className="text-orange-400">T{bill.tableNumber}</span> billed
          </p>
          <p className="text-[10px] text-gray-600">{timeAgo(bill.createdAt)}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-bold text-emerald-400">
            ₹{bill.totalAmount.toLocaleString('en-IN')}
          </p>
          <p className={`text-[10px] uppercase font-semibold ${METHOD_COLOR[bill.paymentMethod] ?? 'text-gray-500'}`}>
            {bill.paymentMethod}
          </p>
        </div>
      </div>
    ))}
  </div>
);