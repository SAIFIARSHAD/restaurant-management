import { useState } from 'react';
import {
  RefreshCw, Plus, Minus, Trash2, Clock, ChefHat, Filter, RotateCcw
} from 'lucide-react';
import { useRawMaterialLogs } from '../../hooks/useRawMaterialLogs';
import { useInventory } from '../../hooks/useInventory';

const TYPE_COLORS: Record<string, string> = {
  add:         'bg-green-500/10 text-green-400 border-green-500/30',
  remove:      'bg-red-500/10 text-red-400 border-red-500/30',
  wastage:     'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  expiry:      'bg-orange-500/10 text-orange-400 border-orange-500/30',
  auto_deduct: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  add:         <Plus className="w-3 h-3" />,
  remove:      <Minus className="w-3 h-3" />,
  wastage:     <Trash2 className="w-3 h-3" />,
  expiry:      <Clock className="w-3 h-3" />,
  auto_deduct: <ChefHat className="w-3 h-3" />,
};

const TYPE_LABELS: Record<string, string> = {
  add:         'Stock In',
  remove:      'Remove',
  wastage:     'Wastage',
  expiry:      'Expiry',
  auto_deduct: 'Auto Deduct',
};

export default function StockLogsTab() {
  const [typeFilter,     setTypeFilter]     = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [startDate,      setStartDate]      = useState('');
  const [endDate,        setEndDate]        = useState('');
  const [page,           setPage]           = useState(1);

  const { data: materials = [] } = useInventory();

  const { data, isLoading, refetch } = useRawMaterialLogs({
    type:       typeFilter     || undefined,
    materialId: materialFilter || undefined,
    startDate:  startDate      || undefined,
    endDate:    endDate        || undefined,
    page,
    limit: 20,
  });

  const logs       = data?.logs       || [];
  const totalPages = data?.totalPages || 1;
  const total      = data?.total      || 0;

  const handleReset = () => {
    setTypeFilter('');
    setMaterialFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-5">

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-zinc-500" />
          <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3 items-end">

          {/* Type Filter */}
          <div>
            <label className="text-xs text-zinc-500 uppercase font-semibold mb-1 block">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="">All Types</option>
              <option value="add">Stock In</option>
              <option value="remove">Remove</option>
              <option value="wastage">Wastage</option>
              <option value="expiry">Expiry</option>
              <option value="auto_deduct">Auto Deduct</option>
            </select>
          </div>

          {/* Material Filter */}
          <div>
            <label className="text-xs text-zinc-500 uppercase font-semibold mb-1 block">Material</label>
            <select
              value={materialFilter}
              onChange={(e) => { setMaterialFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 min-w-[160px]"
            >
              <option value="">All Materials</option>
              {materials.map(m => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="text-xs text-zinc-500 uppercase font-semibold mb-1 block">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="text-xs text-zinc-500 uppercase font-semibold mb-1 block">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-xl text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            className="p-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

         
          <span className="text-zinc-500 text-sm ml-auto">
            Total:{' '}
            <span className="text-white font-semibold">{total}</span> logs
          </span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Material</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Qty</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Before</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">After</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Reason</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Order</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody>

           
            {isLoading && (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <RefreshCw className="w-6 h-6 text-zinc-600 animate-spin mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">Loading logs...</p>
                </td>
              </tr>
            )}

            
            {!isLoading && logs.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-16">
                  <div className="w-14 h-14 mx-auto bg-zinc-800 rounded-2xl flex items-center justify-center mb-3">
                    <Clock className="w-7 h-7 text-zinc-600" />
                  </div>
                  <p className="text-zinc-400 font-semibold">No logs found</p>
                  <p className="text-zinc-600 text-sm mt-1">
                    Try changing filters or date range
                  </p>
                </td>
              </tr>
            )}

           
            {!isLoading && logs.map((log) => (
              <tr
                key={log._id}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
              >

                
                <td className="px-4 py-3">
                  <span className="text-white text-sm font-medium">{log.rawMaterial?.name}</span>
                  <span className="text-zinc-500 text-xs ml-1">({log.rawMaterial?.unit})</span>
                </td>

                {/* Type Badge */}
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${TYPE_COLORS[log.type]}`}>
                    {TYPE_ICONS[log.type]}
                    {TYPE_LABELS[log.type]}
                  </span>
                </td>

                {/* Quantity */}
                <td className="px-4 py-3">
                  <span className={`text-sm font-bold ${log.type === 'add' ? 'text-green-400' : 'text-red-400'}`}>
                    {log.type === 'add' ? '+' : '-'}{log.quantity} {log.unit}
                  </span>
                </td>

                
                <td className="px-4 py-3 text-zinc-400 text-sm">
                  {log.previousStock} {log.unit}
                </td>

               
                <td className="px-4 py-3 text-white text-sm font-medium">
                  {log.newStock} {log.unit}
                </td>

                {/* Reason */}
                <td className="px-4 py-3 text-zinc-400 text-sm max-w-[180px] truncate">
                  {log.reason || '—'}
                </td>

                
                <td className="px-4 py-3">
                  {log.orderId ? (
                    <div className="flex flex-col">
                      <span className="text-orange-400 text-xs font-semibold">
                        {log.orderId.orderNumber}
                      </span>
                      <span className="text-zinc-500 text-xs">
                        T{log.orderId.tableNumber}
                      </span>
                    </div>
                  ) : (
                    <span className="text-zinc-600 text-xs">—</span>
                  )}
                </td>

                
                <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('en-IN', {
                    day:    '2-digit',
                    month:  'short',
                    hour:   '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <span className="text-zinc-500 text-sm">
              Page <span className="text-white font-semibold">{page}</span> of{' '}
              <span className="text-white font-semibold">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white text-sm rounded-lg transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white text-sm rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
