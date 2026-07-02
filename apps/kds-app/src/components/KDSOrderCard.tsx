import { Clock, UtensilsCrossed, CheckCircle2, XCircle, ChefHat, Bell } from 'lucide-react';
import type { IOrder, OrderItemStatus, OrderStatus } from '../types/kds.types';

interface Props {
  order: IOrder;
  elapsed: number;
  onClick: () => void;
}

export const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle2 },
  preparing: { label: 'Preparing', color: 'bg-orange-500/20 text-orange-400', icon: ChefHat },
  ready: { label: 'Ready', color: 'bg-green-500/20 text-green-400', icon: Bell },
  served: { label: 'Served', color: 'bg-zinc-500/20 text-zinc-400', icon: UtensilsCrossed },
  billed: { label: 'Billed', color: 'bg-teal-500/20 text-teal-400', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400', icon: XCircle },
} as const;

export const DEFAULT_STATUS = STATUS_CONFIG.pending;

const VALID_STATUSES: Array<OrderStatus | OrderItemStatus> = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'served',
  'billed',
  'cancelled',
];

export function normalizeStatus(status: unknown): OrderStatus {
  if (typeof status !== 'string') return 'pending';
  const normalized = status.trim().toLowerCase() as OrderStatus;
  return VALID_STATUSES.includes(normalized) ? normalized : 'pending';
}

export function getSafeStatusConfig(status: unknown) {
  const normalized = normalizeStatus(status);
  return STATUS_CONFIG[normalized as keyof typeof STATUS_CONFIG] ?? DEFAULT_STATUS;
}

export function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return {
    dateFormatted: date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    timeFormatted: date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  };
}

export default function KDSOrderCard({ order, elapsed, onClick }: Props) {
  const safeStatus = normalizeStatus(order.status);
  const statusCfg = getSafeStatusConfig(order.status);
  const StatusIcon = statusCfg.icon;
  const { dateFormatted, timeFormatted } = formatDateTime(order.createdAt);
  const urgent = elapsed >= 15;
  const itemsPreview = order.items
    .slice(0, 2)
    .map((i) => `${i.quantity}x ${i.name}`)
    .join(', ');
  const extraCount = Math.max(0, order.items.length - 2);

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border bg-zinc-900 transition-all hover:bg-zinc-800/60 ${
        urgent ? 'border-orange-500/60' : 'border-zinc-800 hover:border-orange-500/50'
      }`}
    >
      <div className="block p-4 md:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">#{order.orderNumber}</p>
            <p className="mt-1 text-xs text-zinc-500">
              Table {order.tableNumber || order.table?.tableNumber || '--'}
              {order.table?.floor && <span className="ml-1 text-zinc-600">· {order.table.floor}</span>}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs font-bold text-orange-400">{elapsed} min ago</p>
            <p className="mt-1 text-[11px] text-zinc-500">{timeFormatted}</p>
            <p className="text-[11px] text-zinc-600">{dateFormatted}</p>
          </div>
        </div>

        <div className="mt-3">
          <p className="break-words text-sm leading-5 text-zinc-300">
            {itemsPreview}
            {extraCount > 0 && ` +${extraCount} more`}
          </p>
          <p className="mt-1 text-xs text-zinc-600">{order.items.length} items</p>
          {order.notes && <p className="mt-1 text-xs text-amber-300/80">Instruction: {order.notes}</p>}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusCfg.color}`}
          >
            <StatusIcon className="h-3 w-3" />
            {statusCfg.label}
          </span>
          {urgent && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
              Urgent
            </span>
          )}
          {safeStatus !== order.status && (
            <span className="text-[10px] text-zinc-500">normalized</span>
          )}
        </div>
      </div>

      <div className="hidden items-center gap-4 px-5 py-4 md:flex">
        <div className="w-32 shrink-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-white">#{order.orderNumber}</p>
            {urgent && <span className="text-[9px] font-bold uppercase text-orange-400">Urgent</span>}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            Table {order.tableNumber || order.table?.tableNumber || '--'}
            {order.table?.floor && <span className="ml-1 text-zinc-600">· {order.table.floor}</span>}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-zinc-300">
            {itemsPreview}
            {extraCount > 0 && ` +${extraCount} more`}
          </p>
          <p className="mt-0.5 text-xs text-zinc-600">{order.items.length} items</p>
        </div>

        <div className="w-28 shrink-0">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusCfg.color}`}
          >
            <StatusIcon className="h-3 w-3" />
            {statusCfg.label}
          </span>
        </div>

        <div className="w-28 shrink-0 text-right">
          <p className="text-xs text-zinc-300">{timeFormatted}</p>
          <p className="mt-0.5 text-xs text-zinc-600">{dateFormatted}</p>
        </div>

        <div className="w-20 shrink-0 text-right">
          <p className="text-xs font-bold text-orange-400">{elapsed} min</p>
        </div>
      </div>
    </div>
  );
}