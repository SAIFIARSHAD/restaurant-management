import { Clock, UtensilsCrossed, CheckCircle2, XCircle, ChefHat, Bell } from 'lucide-react';
import type { IOrder } from '../types/kds.types';

interface Props {
  order: IOrder;
  elapsed: number;
  onClick: () => void;
}

export const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  accepted:  { label: 'Accepted',  color: 'bg-blue-500/20 text-blue-400',   icon: CheckCircle2 },
  preparing: { label: 'Preparing', color: 'bg-orange-500/20 text-orange-400', icon: ChefHat },
  ready:     { label: 'Ready',     color: 'bg-green-500/20 text-green-400',  icon: Bell },
  served:    { label: 'Served',    color: 'bg-zinc-500/20 text-zinc-400',   icon: UtensilsCrossed },
  billed:    { label: 'Billed',    color: 'bg-teal-500/20 text-teal-400',   icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400',     icon: XCircle },
} as const;

export const DEFAULT_STATUS = { label: 'Unknown', color: 'bg-zinc-500/20 text-zinc-400', icon: Clock };

export function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return {
    dateFormatted: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    timeFormatted: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
}

export default function KDSOrderCard({ order, elapsed, onClick }: Props) {
  const statusCfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? DEFAULT_STATUS;
  const StatusIcon = statusCfg.icon;
  const { dateFormatted, timeFormatted } = formatDateTime(order.createdAt);
  const urgent = elapsed >= 15;
  const itemsPreview = order.items.slice(0, 2).map((i) => `${i.quantity}x ${i.name}`).join(', ');
  const extraCount = Math.max(0, order.items.length - 2);

  return (
    <div
      onClick={onClick}
      className={`bg-zinc-900 border rounded-xl cursor-pointer transition-all hover:bg-zinc-800/60 ${
        urgent ? 'border-orange-500/60' : 'border-zinc-800 hover:border-orange-500/50'
      }`}
    >
      {/* Mobile card */}
      <div className="block md:hidden p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-white font-bold text-sm">#{order.orderNumber}</p>
            <p className="text-zinc-500 text-xs mt-1">
              Table {order.tableNumber || order.table?.tableNumber || '--'}
              {order.table?.floor && <span className="ml-1 text-zinc-600">· {order.table.floor}</span>}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-orange-400 font-bold text-xs">{elapsed} min ago</p>
            <p className="text-zinc-500 text-[11px] mt-1">{timeFormatted}</p>
            <p className="text-zinc-600 text-[11px]">{dateFormatted}</p>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-zinc-300 text-sm leading-5 break-words">
            {itemsPreview}
            {extraCount > 0 && ` +${extraCount} more`}
          </p>
          <p className="text-zinc-600 text-xs mt-1">{order.items.length} items</p>
          {order.notes && <p className="text-amber-300/80 text-xs mt-1">Instruction: {order.notes}</p>}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg.color}`}>
            <StatusIcon className="w-3 h-3" />
            {statusCfg.label}
          </span>
          {urgent && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Urgent</span>
          )}
        </div>
      </div>

      {/* Desktop row */}
      <div className="hidden md:flex items-center gap-4 px-5 py-4">
        <div className="w-32 shrink-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-bold text-sm">#{order.orderNumber}</p>
            {urgent && <span className="text-[9px] font-bold uppercase text-orange-400">Urgent</span>}
          </div>
          <p className="text-zinc-500 text-xs mt-0.5">
            Table {order.tableNumber || order.table?.tableNumber || '--'}
            {order.table?.floor && <span className="ml-1 text-zinc-600">· {order.table.floor}</span>}
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-zinc-300 text-sm truncate">
            {itemsPreview}
            {extraCount > 0 && ` +${extraCount} more`}
          </p>
          <p className="text-zinc-600 text-xs mt-0.5">{order.items.length} items</p>
        </div>

        <div className="shrink-0 w-28">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg.color}`}>
            <StatusIcon className="w-3 h-3" />
            {statusCfg.label}
          </span>
        </div>

        <div className="shrink-0 w-28 text-right">
          <p className="text-zinc-300 text-xs">{timeFormatted}</p>
          <p className="text-zinc-600 text-xs mt-0.5">{dateFormatted}</p>
        </div>

        <div className="shrink-0 w-20 text-right">
          <p className="text-orange-400 font-bold text-xs">{elapsed} min</p>
        </div>
      </div>
    </div>
  );
}