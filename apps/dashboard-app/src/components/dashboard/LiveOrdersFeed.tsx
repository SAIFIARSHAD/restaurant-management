import { useEffect }      from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, Circle }  from 'lucide-react';
import { useSocket }      from '../../hooks/useSocket';
import type { LiveOrder } from '../../hooks/useDashboard';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pending',   color: 'text-amber-400   bg-amber-400/10'  },
  accepted:  { label: 'Accepted',  color: 'text-blue-400    bg-blue-400/10'   },
  preparing: { label: 'Preparing', color: 'text-purple-400  bg-purple-400/10' },
  ready:     { label: 'Ready',     color: 'text-emerald-400 bg-emerald-400/10'},
};

const timeAgo = (date: string) => {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
};

export const LiveOrdersFeed = ({ orders }: { orders: LiveOrder[] }) => {
  const queryClient = useQueryClient();
  const { on, off } = useSocket();

  useEffect(() => {
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    on('new_order',       refresh);
    on('order_accepted',  refresh);
    on('order_preparing', refresh);
    on('order_ready',     refresh);
    on('order_billed',    refresh);
    return () => {
      off('new_order',       refresh);
      off('order_accepted',  refresh);
      off('order_preparing', refresh);
      off('order_ready',     refresh);
      off('order_billed',    refresh);
    };
  }, [on, off, queryClient]);

  return (
    <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1
                    scrollbar-thin scrollbar-thumb-gray-700">
      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-gray-600">
          <Circle className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-sm">No active orders</p>
        </div>
      )}
      {orders.map((order) => {
        const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['pending'];
        return (
          <div key={order._id}
            className="flex items-center justify-between bg-gray-800/50
                       border border-gray-700/50 rounded-xl px-4 py-3
                       hover:bg-gray-800 transition">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-xs font-bold text-orange-400">#{order.orderNumber}</p>
                <p className="text-[10px] text-gray-500">T{order.tableNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-200 font-medium">
                  {order.items.slice(0, 2).map((i: { name: string; quantity: number }) => i.name).join(', ')}
                  {order.items.length > 2 && ` +${order.items.length - 2}`}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-gray-600" />
                  <span className="text-[10px] text-gray-500">{timeAgo(order.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                {cfg.label}
              </span>
              <span className="text-xs font-bold text-gray-300">₹{order.totalAmount}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};