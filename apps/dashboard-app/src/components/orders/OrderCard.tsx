import { Clock, UtensilsCrossed, CheckCircle2, XCircle, ChefHat, Bell } from 'lucide-react';
import type { Order } from '../../hooks/useOrders';

interface Props {
  order: Order;
  onClick: () => void;
}

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-yellow-500/20 text-yellow-400',  icon: Clock },
  accepted:  { label: 'Accepted',  color: 'bg-blue-500/20 text-blue-400',      icon: CheckCircle2 },
  preparing: { label: 'Preparing', color: 'bg-orange-500/20 text-orange-400',  icon: ChefHat },
  ready:     { label: 'Ready',     color: 'bg-green-500/20 text-green-400',    icon: Bell },
  served:    { label: 'Served',    color: 'bg-zinc-500/20 text-zinc-400',      icon: UtensilsCrossed },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400',        icon: XCircle },
} as const;

const DEFAULT_STATUS = { label: 'Unknown', color: 'bg-zinc-500/20 text-zinc-400', icon: Clock };

const PAYMENT_CONFIG = {
  unpaid:   'bg-red-500/20 text-red-400',
  paid:     'bg-green-500/20 text-green-400',
  refunded: 'bg-zinc-500/20 text-zinc-400',
};

const DEFAULT_PAYMENT = 'bg-zinc-500/20 text-zinc-400';


const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const dateFormatted = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }); 
  const timeFormatted = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }); 
  return { dateFormatted, timeFormatted };
};
export default function OrderCard({ order, onClick }: Props) {
  const statusCfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? DEFAULT_STATUS;
  const StatusIcon = statusCfg.icon;
  const paymentColor = PAYMENT_CONFIG[order.paymentStatus as keyof typeof PAYMENT_CONFIG] ?? DEFAULT_PAYMENT;
  const { dateFormatted, timeFormatted } = formatDateTime(order.createdAt);

  return (
    <div
      onClick={onClick}
      className="bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 rounded-xl px-5 py-3.5 flex items-center gap-4 cursor-pointer transition-all hover:bg-zinc-800/60"
    >
      {/* Order Number + Table */}
      <div className="w-28 shrink-0">
        <p className="text-white font-bold text-sm">#{order.orderNumber}</p>
        <p className="text-zinc-500 text-xs mt-0.5">Table {order.tableNumber}
          {typeof order.table === 'object' && order.table?.floor && (
      <span className="ml-1 text-zinc-600">· {order.table.floor}</span>
    )}</p>
      </div>

      {/* Items */}
      <div className="flex-1 min-w-0">
        <p className="text-zinc-300 text-sm truncate">
          {order.items.slice(0, 2).map(i => `${i.quantity}x ${i.name}`).join(', ')}
          {order.items.length > 2 && ` +${order.items.length - 2} more`}
        </p>
        <p className="text-zinc-600 text-xs mt-0.5">{order.items.length} items</p>
      </div>

      {/* Status */}
      <div className="shrink-0">
        <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg.color}`}>
          <StatusIcon className="w-3 h-3" />
          {statusCfg.label}
        </span>
      </div>

      {/* Payment */}
      <div className="shrink-0 w-20 text-center">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentColor}`}>
          {order.paymentStatus
            ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)
            : 'Unknown'}
        </span>
      </div>
       {/* Footer — Time column */}
      <div className="shrink-0 w-28 text-right"> 
        <p className="text-zinc-300 text-xs">{timeFormatted}</p>   
        <p className="text-zinc-600 text-xs mt-0.5">{dateFormatted}</p> 
      </div>

       {/* Total */}
      <div className="shrink-0 w-20 text-right">
        <p className="text-orange-400 font-bold text-sm">₹{order.totalAmount}</p>
      </div>
     
    </div>
    
  );
}
