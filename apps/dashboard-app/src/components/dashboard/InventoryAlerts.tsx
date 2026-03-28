import { AlertTriangle } from 'lucide-react';
import type { InventoryAlert } from '../../hooks/useDashboard';

export const InventoryAlerts = ({ alerts }: { alerts: InventoryAlert[] }) => (
  <div className="flex flex-col gap-2">
    {alerts.length === 0 && (
      <div className="flex items-center gap-2 text-emerald-400 py-4 justify-center">
        <AlertTriangle className="w-4 h-4" />
        <p className="text-sm">All stock levels OK</p>
      </div>
    )}
    {alerts.map((item) => {
      const pct      = item.minThreshold > 0
        ? Math.min((item.currentStock / item.minThreshold) * 100, 100)
        : 100;
      const critical = item.currentStock === 0;
      return (
        <div key={item._id}
          className={`flex items-center justify-between rounded-xl px-4 py-2.5 border
            ${critical
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-amber-500/10 border-amber-500/30'}`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${critical ? 'text-red-400' : 'text-amber-400'}`} />
            <div>
              <p className="text-sm font-medium text-gray-200">{item.name}</p>
              <p className="text-[10px] text-gray-500">Min: {item.minThreshold} {item.unit}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-bold ${critical ? 'text-red-400' : 'text-amber-400'}`}>
              {item.currentStock} {item.unit}
            </p>
            <div className="w-16 h-1 bg-gray-700 rounded-full mt-1">
              <div
                className={`h-1 rounded-full ${critical ? 'bg-red-400' : 'bg-amber-400'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      );
    })}
  </div>
);