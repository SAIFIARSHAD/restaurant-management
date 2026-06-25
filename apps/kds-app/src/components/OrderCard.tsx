import { Clock3, UtensilsCrossed } from 'lucide-react';
import type { KDSOrder, OrderStatus } from '../types/kds';
import StatusBadge from './StatusBadge';
import OrderItem from './OrderItem';

interface Props {
  order: KDSOrder;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:   'accepted',
  accepted:  'preparing',
  preparing: 'ready',
};

const nextLabel: Partial<Record<OrderStatus, string>> = {
  pending:   'Accept Order',
  accepted:  'Start Preparing',
  preparing: 'Mark Ready',
};

function getElapsedTime(createdAt: string): string {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

function isUrgent(createdAt: string): boolean {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  return mins >= 15;
}

export default function OrderCard({ order, onStatusChange }: Props) {
  const next = nextStatus[order.status];
  const label = nextLabel[order.status];
  const urgent = isUrgent(order.createdAt);

  return (
    <div className={`flex flex-col rounded-2xl border bg-white/5 backdrop-blur-md overflow-hidden transition-all duration-200 ${
      urgent ? 'border-red-500/40' : 'border-white/10'
    }`}>

      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-white/10 ${
        urgent ? 'bg-red-500/10' : 'bg-white/5'
      }`}>
        <div className="flex items-center gap-2">
          <UtensilsCrossed size={14} className="text-orange-400 shrink-0" />
          <span className="text-sm font-bold text-white">{order.orderNumber}</span>
          <span className="text-xs text-slate-500">Table {order.tableNumber}</span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="flex-1 px-4 py-3">
        {order.items.map((item, idx) => (
          <OrderItem key={idx} item={item} />
        ))}

        {order.notes && (
          <div className="mt-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-3 py-2">
            <p className="text-xs text-yellow-400">
              <span className="font-semibold">Note: </span>{order.notes}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center justify-between gap-3">
        <div className={`flex items-center gap-1 text-xs ${urgent ? 'text-red-400' : 'text-slate-500'}`}>
          <Clock3 size={12} />
          <span>{getElapsedTime(order.createdAt)}</span>
          {urgent && <span className="font-semibold ml-1">Urgent!</span>}
        </div>

        {next && label && (
          <button
            onClick={() => onStatusChange(order._id, next)}
            className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-95"
          >
            {label}
          </button>
        )}

        {order.status === 'ready' && (
          <span className="rounded-xl bg-green-500/20 border border-green-500/30 px-4 py-2 text-xs font-semibold text-green-400">
            Ready for Pickup
          </span>
        )}
      </div>
    </div>
  );
}