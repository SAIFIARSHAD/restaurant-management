import type { OrderStatus } from '../types/kds';

interface Props {
  status: OrderStatus;
}

const config: Record<OrderStatus, { label: string; classes: string }> = {
  pending:    { label: 'Pending',    classes: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  accepted:   { label: 'Accepted',   classes: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  preparing:  { label: 'Preparing',  classes: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  ready:      { label: 'Ready',      classes: 'bg-green-500/20 text-green-400 border-green-500/30' },
  served:     { label: 'Served',     classes: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  cancelled:  { label: 'Cancelled',  classes: 'bg-red-500/20 text-red-400 border-red-500/30' },
  billed:     { label: 'Billed',     classes: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
};

export default function StatusBadge({ status }: Props) {
  const { label, classes } = config[status] ?? config.pending;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${classes}`}>
      {label}
    </span>
  );
}