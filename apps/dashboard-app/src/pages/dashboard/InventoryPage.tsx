import { useState } from 'react';
import { Plus, Search, Package, AlertTriangle, TrendingDown, IndianRupee, XCircle } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import RawMaterialTable from '../../components/inventory/RawMaterialTable';
import RawMaterialModal from '../../components/inventory/RawMaterialModal';

type FilterType = 'all' | 'low' | 'out';

export default function InventoryPage() {
  const { data: materials = [], isLoading } = useInventory();

  const [showAddModal, setShowAddModal] = useState(false);
  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState<FilterType>('all');

  // Stats
  const totalItems = materials.length;
  const lowStock   = materials.filter(m => m.currentStock <= m.minThreshold && m.currentStock > 0).length;
  const outOfStock = materials.filter(m => m.currentStock === 0).length;
  const totalValue = materials.reduce((sum, m) => sum + m.currentStock * m.unitCost, 0);

  // Filter + Search
  const filtered = materials.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'low' ? m.currentStock <= m.minThreshold && m.currentStock > 0 :
      filter === 'out' ? m.currentStock === 0 : true;
    return matchSearch && matchFilter;
  });

  const STATS = [
    {
      label: 'Total Items',
      value: totalItems,
      icon: Package,
      color: 'text-blue-400',
      bg:    'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Low Stock',
      value: lowStock,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bg:    'bg-yellow-500/10 border-yellow-500/20',
    },
    {
      label: 'Out of Stock',
      value: outOfStock,
      icon: TrendingDown,
      color: 'text-red-400',
      bg:    'bg-red-500/10 border-red-500/20',
    },
    {
      label: 'Total Stock Value',
      value: `₹${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: IndianRupee,
      color: 'text-green-400',
      bg:    'bg-green-500/10 border-green-500/20',
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
          <p className="text-zinc-500 text-sm mt-1">Raw materials stock tracking & management</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Material
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`p-5 rounded-2xl border ${s.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{s.label}</span>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search raw material..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        {[
  {
    label: (
      <span className="flex items-center gap-1">
        <Package size={16} />
        All ({totalItems})
      </span>
    ),
    value: 'all' as FilterType,
  },
  {
    label: (
      <span className="flex items-center gap-1 text-yellow-400">
        <AlertTriangle size={16} />
        Low Stock ({lowStock})
      </span>
    ),
    value: 'low' as FilterType,
  },
  {
    label: (
      <span className="flex items-center gap-1 text-red-500">
        <XCircle size={16} />
        Out of Stock ({outOfStock})
      </span>
    ),
    value: 'out' as FilterType,
  },
].map((f) => (
  <button
    key={f.value}
    onClick={() => setFilter(f.value)}
    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
      filter === f.value
        ? 'bg-orange-500 text-white shadow-md'
        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
    }`}
  >
    {f.label}
  </button>
))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 bg-zinc-900 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto bg-zinc-900/50 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-zinc-700">
            <Package className="w-10 h-10 text-zinc-600" />
          </div>
          <p className="text-zinc-400 text-lg font-semibold">No materials found</p>
          <p className="text-zinc-600 text-sm mt-1">
            {search ? `"${search}" Not found` : 'No raw material available right now'}
          </p>
          {!search && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-5 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              + Add First Material
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {!isLoading && filtered.length > 0 && (
        <RawMaterialTable materials={filtered} />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <RawMaterialModal item={null} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
