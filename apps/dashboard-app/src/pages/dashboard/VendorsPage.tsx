import { useState } from 'react';
import { Plus, Search, Users, Package, AlertTriangle } from 'lucide-react';
import { useVendors, useLowStockVendors } from '../../hooks/useVendors';
import VendorTable from '../../components/vendors/VendorTable';
import VendorModal from '../../components/vendors/VendorModal';

export default function VendorsPage() {
  const { data: vendors = [], isLoading } = useVendors();
  const { data: lowStockItems = [] } = useLowStockVendors();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.contactPerson?.toLowerCase().includes(search.toLowerCase())
  );

  const totalMaterials = vendors.reduce((sum, v) => sum + v.materials.length, 0);

  const STATS = [
    {
      label: 'Total Vendors',
      value: vendors.length,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Materials Covered',
      value: totalMaterials,
      icon: Package,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
    },
    {
      label: 'Low Stock Alerts',
      value: lowStockItems.length,
      icon: AlertTriangle,
      color: lowStockItems.length > 0 ? 'text-red-400' : 'text-green-400',
      bg: lowStockItems.length > 0
        ? 'bg-red-500/10 border-red-500/20'
        : 'bg-green-500/10 border-green-500/20',
      clickable: true,
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vendor Management</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Manage your suppliers and their associated raw materials
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
      </div>

      
      <div className="grid grid-cols-3 gap-4">
        {STATS.map(s => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              onClick={() => s.clickable && setShowLowStock(prev => !prev)}
              className={`p-5 rounded-2xl border ${s.bg} ${s.clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {s.label}
                </span>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              {s.clickable && lowStockItems.length > 0 && (
                <p className="text-xs text-zinc-500 mt-1">
                  {showLowStock ? 'Hide details' : 'Click to view'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      
      {showLowStock && lowStockItems.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Low Stock — Contact These Vendors
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {lowStockItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <div>
                  <p className="text-white text-sm font-medium">{item.material.name}</p>
                  <p className="text-red-400 text-xs mt-0.5">
                    Stock: {item.material.currentStock}{item.material.unit} / Min: {item.material.minThreshold}{item.material.unit}
                  </p>
                </div>
                {item.vendor ? (
                  <div className="text-right">
                    <p className="text-zinc-300 text-xs font-semibold">{item.vendor.name}</p>
                    <p className="text-zinc-500 text-xs">{item.vendor.phone}</p>
                  </div>
                ) : (
                  <span className="text-zinc-600 text-xs">No vendor</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

     
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by vendor name or contact person..."
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

     
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto bg-zinc-900/50 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-zinc-700">
            <Users className="w-10 h-10 text-zinc-600" />
          </div>
          <p className="text-zinc-400 text-lg font-semibold">No vendors found</p>
          <p className="text-zinc-600 text-sm mt-1">
            {search ? `No results for "${search}"` : 'No vendors have been added yet'}
          </p>
          {!search && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-5 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm"
            >
              + Add First Vendor
            </button>
          )}
        </div>
      )}

      
      {!isLoading && filtered.length > 0 && (
        <VendorTable vendors={filtered} />
      )}

      
      {showModal && (
        <VendorModal vendor={null} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
