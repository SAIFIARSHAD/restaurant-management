import type { KDSOrderItem } from '../types/kds';

interface Props {
  item: KDSOrderItem;
}

export default function OrderItem({ item }: Props) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-white/5 last:border-0">
      <div className="flex items-start gap-2 min-w-0">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">
          {item.quantity}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{item.name}</p>
          {item.notes && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">Note: {item.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}