import type { TableStatus } from '../../hooks/useDashboard';

type StatusKey = 'available' | 'occupied' | 'reserved' | 'inactive';

const STATUS: Record<StatusKey, { color: string; dot: string }> = {
  available: { color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400', dot: 'bg-emerald-400' },
  occupied:  { color: 'bg-red-500/20     border-red-500/40     text-red-400',     dot: 'bg-red-400'     },
  reserved:  { color: 'bg-blue-500/20    border-blue-500/40    text-blue-400',    dot: 'bg-blue-400'    },
  inactive:  { color: 'bg-gray-700/40    border-gray-600/40    text-gray-500',    dot: 'bg-gray-500'    },
};

export const TableStatusGrid = ({ tables }: { tables: TableStatus[] }) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-wrap gap-3">
      {(Object.entries(STATUS) as [StatusKey, { color: string; dot: string }][]).map(([key, val]) => (
        <div key={key} className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${val.dot}`} />
          <span className="text-xs text-gray-500 capitalize">{key}</span>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
      {tables.map((table) => {
        const key = (table.status as StatusKey) in STATUS ? table.status as StatusKey : 'inactive';
        const cfg = STATUS[key];
        return (
          <div key={table._id}
            className={`border rounded-xl p-2.5 text-center transition-all duration-150 ${cfg.color}`}>
            <p className="text-sm font-bold">{table.tableNumber}</p>
            <p className="text-[10px] opacity-60 mt-0.5">{table.floor?.replace(' Floor', '') ?? '—'}</p>
            <p className="text-[10px] opacity-50">{table.capacity}p</p>
          </div>
        );
      })}
    </div>
  </div>
);