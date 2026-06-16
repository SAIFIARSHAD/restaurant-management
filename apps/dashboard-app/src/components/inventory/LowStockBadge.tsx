import { AlertTriangle } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';

export default function LowStockBadge() {
  const { data: materials = [] } = useInventory();

  const lowStockCount = materials.filter(
    (m) => m.currentStock <= m.minThreshold
  ).length;

  if (lowStockCount === 0) return null;

  return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold rounded-full animate-pulse">
      <AlertTriangle className="w-3 h-3" />
      {lowStockCount}
    </span>
  );
}
