import { useState } from 'react';
import { Search } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useTables } from '../../hooks/useTables';
import OrderCard from '../../components/orders/OrderCard';
import OrderDetailModal from '../../components/orders/OrderDetailModal';
import type { Order } from '../../hooks/useOrders';

const STATUS_FILTERS = [
  { label: 'All',       value: '' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Accepted',  value: 'accepted' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready',     value: 'ready' },
  { label: 'Served',    value: 'served' },
  { label: 'Billed', value: 'billed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const toLocalDate = (date: Date) => date.toLocaleDateString('en-CA');
const TODAY     = toLocalDate(new Date());
const YESTERDAY = toLocalDate(new Date(Date.now() - 86400000));

export default function OrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrder,  setSelectedOrder]  = useState<Order | null>(null);

  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo,   setAppliedTo]   = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'today' | 'yesterday' | 'custom'>('all');

  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');

  const { data: orders = [], isLoading } = useOrders(selectedStatus);
  const { data: tables = [] } = useTables();

  const filtered = orders.filter((order: Order) => {
    const orderDate = toLocalDate(new Date(order.createdAt));

    if (quickFilter === 'today')     { if (orderDate !== TODAY)     return false; }
    if (quickFilter === 'yesterday') { if (orderDate !== YESTERDAY) return false; }
    if (quickFilter === 'custom') {
      if (appliedFrom && orderDate < appliedFrom) return false;
      if (appliedTo   && orderDate > appliedTo)   return false;
    }

    if (selectedTable && order.table !== selectedTable) return false;

    const orderTable = tables.find(t => t._id === order.table);
    if (selectedFloor && (!orderTable?.floor || orderTable.floor !== selectedFloor)) return false;

    return true;
  });

  const handleSearch = () => {
    setAppliedFrom(dateFrom);
    setAppliedTo(dateTo);
    setQuickFilter('custom');
  };

  const handleQuickFilter = (type: 'all' | 'today' | 'yesterday') => {
    setQuickFilter(type);
    setDateFrom('');
    setDateTo('');
    setAppliedFrom('');
    setAppliedTo('');
  };

    const floors = [...new Set(tables.map(t => t.floor).filter(Boolean))].sort() as string[];

  return (
    <div className="space-y-1.5">
  <div className="flex justify-end">
    <p className="text-sm text-zinc-400 font-semibold px-2 py-1 bg-zinc-900/50 border border-zinc-700/50 rounded-lg backdrop-blur-sm">
      Select floor & table to view specific orders
    </p>
  </div>

    <div className="flex flex-wrap items-center gap-2">
    
    {STATUS_FILTERS.map((f) => (
      <button
        key={f.value}
        onClick={() => setSelectedStatus(f.value)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          selectedStatus === f.value
            ? 'bg-orange-500 text-white shadow-md hover:shadow-orange-500/50'
            : 'bg-zinc-900 text-white/80 hover:bg-zinc-800 shadow-sm border border-zinc-700/50'
        }`}
      >
        {f.label}
      </button>
    ))}

    
    <div className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-lg backdrop-blur-sm hover:shadow-orange-500/20 hover:border-orange-500/50 transition-all duration-300">
      <span className="text-sm font-semibold text-zinc-300"></span>
      
      
      <select
        value={selectedFloor}
        onChange={(e) => {
          setSelectedFloor(e.target.value);
          setSelectedTable('');
        }}
        className="bg-zinc-900 text-white text-sm font-semibold border-none outline-none cursor-pointer px-2 py-1 rounded-lg hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white focus:outline-none transition-all"
      >
        <option value="">Floor/Section</option>
        {floors.map((floor) => (
          <option key={floor} value={floor}>{floor}</option>
        ))}
      </select>

      <span className="text-zinc-500 font-semibold">/</span>

      
      <select
        value={selectedTable}
        onChange={(e) => setSelectedTable(e.target.value)}
        className="bg-zinc-900 text-white text-sm font-semibold border-none outline-none cursor-pointer px-2 py-1 rounded-lg hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white focus:outline-none transition-all"
      >
        <option value="">All Tables</option>
        {tables
          .filter(t => !selectedFloor || t.floor === selectedFloor)
          .map((table) => (
            <option key={table._id} value={table._id}>
              {table.tableNumber}
            </option>
          ))}
      </select>

      {(selectedTable || selectedFloor) && (
        <button
          onClick={() => { setSelectedTable(''); setSelectedFloor(''); }}
          className="ml-2 w-6 h-6 bg-zinc-700 hover:bg-orange-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm hover:shadow-md transition-all"
          title="Clear filter"
        >
          ×
        </button>
      )}
    </div>
  </div>



        <div className="flex flex-wrap items-center gap-2">
        {[
          { label: 'All Orders', value: 'all' as const },
          { label: 'Today',      value: 'today' as const },
          { label: 'Yesterday',  value: 'yesterday' as const },
        ].map((q) => (
          <button
            key={q.value}
            onClick={() => handleQuickFilter(q.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              quickFilter === q.value
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {q.label}
          </button>
        ))}

        <div className="w-px h-5 bg-zinc-700 mx-1" />

        <input
          type="date"
          value={dateFrom}
          max={dateTo || TODAY}
          onChange={(e) => setDateFrom(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer"
        />
        <span className="text-zinc-600 text-sm">→</span>
        <input
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          max={TODAY}
          onChange={(e) => setDateTo(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer"
        />

        <button
          onClick={handleSearch}
          disabled={!dateFrom && !dateTo}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          Search
        </button>

        {quickFilter === 'custom' && (
          <button
            onClick={() => handleQuickFilter('all')}
            className="text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      
      {!isLoading && filtered.length > 0 && (
        <div className="px-5 py-2 flex items-center gap-4 text-xs text-zinc-600 font-semibold uppercase tracking-wider border-b border-zinc-800">
          <div className="w-32 shrink-0">Order</div>
          <div className="flex-1">Items</div>
          <div className="shrink-0 w-24">Status</div>
          <div className="shrink-0 w-20 text-center">Payment</div>
          <div className="shrink-0 w-28 text-right">Date & Time</div>
          <div className="shrink-0 w-20 text-right">Total</div>
        </div>
      )}

      
      {isLoading && (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl h-14 animate-pulse" />
          ))}
        </div>
      )}

      
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-zinc-500 text-lg">No orders found</p>
          <p className="text-zinc-600 text-sm mt-1">
            {selectedTable
              ? ` ${tables.find(t => t._id === selectedTable)?.tableNumber} No orders for this table`
              : selectedFloor
              ? `${selectedFloor} No orders on this floor`
              : quickFilter === 'today'     ? 'No orders today'
              : quickFilter === 'yesterday' ? 'No orders yesterday'
              : quickFilter === 'custom'    ? 'No orders in this range'
              : 'No orders right now'}
          </p>
        </div>
      )}

      
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onClick={() => setSelectedOrder(order)}
            />
          ))}
        </div>
      )}

      
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
