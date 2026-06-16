import { useState, useMemo } from 'react';
import { Plus, GitMerge, GitBranch, LayoutGrid, List } from 'lucide-react';
import {
  useTables, useUpdateTableStatus, useDeleteTable, useMergeTables, useUnmergeTables,
} from '../../hooks/useTables';
import type {ITable} from '../../hooks/useTables';
import TableCard from '../../components/tables/TableCard';
import TableModal from '../../components/tables/TableModal';
import QRModal from '../../components/tables/QRModal';

type ViewMode = 'grid' | 'floor';


export default function TablesPage() {
  const { data: tables = [], isLoading } = useTables();
  const updateStatus  = useUpdateTableStatus();
  const deleteTable   = useDeleteTable();
  const mergeMutation = useMergeTables();
  const unmergeMutation = useUnmergeTables();

  const [viewMode,     setViewMode]     = useState<ViewMode>('floor');
  const [showModal,    setShowModal]    = useState(false);
  const [editTable,    setEditTable]    = useState<ITable | null>(null);
  const [qrTable,      setQrTable]      = useState<ITable | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds,  setSelectedIds]  = useState<string[]>([]);

  // Stats
  const stats = useMemo(() => ({
    total:     tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied:  tables.filter(t => t.status === 'occupied').length,
    reserved:  tables.filter(t => t.status === 'reserved').length,
  }), [tables]);

  // Floor wise group
  const floorGroups = useMemo(() => {
    const groups: Record<string, ITable[]> = {};
    tables.forEach(t => {
      const floor = t.floor || 'Ground Floor';
      if (!groups[floor]) groups[floor] = [];
      groups[floor].push(t);
    });
    return groups;
  }, [tables]);

  const handleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleMerge = async () => {
    if (selectedIds.length < 2) return;
    const labels = selectedIds
      .map(id => tables.find(t => t._id === id)?.tableNumber)
      .join(' + ');
    await mergeMutation.mutateAsync({ tableIds: selectedIds, mergedLabel: labels });
    setSelectedIds([]);
    setIsSelectMode(false);
  };

  const handleUnmerge = async () => {
    if (selectedIds.length === 0) return;
    await unmergeMutation.mutateAsync(selectedIds);
    setSelectedIds([]);
    setIsSelectMode(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Do you want to delete the table?')) {
      await deleteTable.mutateAsync(id);
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate({ id, status });
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Table Management</h1>
          <p className="text-zinc-500 text-sm mt-1">Floor wise table layout & status management</p>
        </div>
        <div className="flex items-center gap-3">

          {/* Merge Mode Toggle */}
          {!isSelectMode ? (
            <button
              onClick={() => setIsSelectMode(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-400 font-semibold rounded-xl text-sm transition-all"
            >
              <GitMerge className="w-4 h-4" />
              Merge Tables
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-sm">
                {selectedIds.length} selected
              </span>
              <button
                onClick={handleMerge}
                disabled={selectedIds.length < 2 || mergeMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold"
              >
                <GitMerge className="w-4 h-4" />
                Merge
              </button>
              <button
                onClick={handleUnmerge}
                disabled={selectedIds.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold"
              >
                <GitBranch className="w-4 h-4" />
                Unmerge
              </button>
              <button
                onClick={() => { setIsSelectMode(false); setSelectedIds([]); }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl text-sm"
              >
                Cancel
              </button>
            </div>
          )}

          {/* View Toggle */}
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('floor')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'floor' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => { setEditTable(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Table
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tables', value: stats.total,     color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Available',    value: stats.available, color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
          { label: 'Occupied',     value: stats.occupied,  color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Reserved',     value: stats.reserved,  color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
        ].map(s => (
          <div key={s.label} className={`p-5 rounded-2xl border ${s.bg}`}>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-52 bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Floor View */}
      {!isLoading && viewMode === 'floor' && (
        <div className="space-y-8">
          {Object.entries(floorGroups).map(([floor, floorTables]) => (
            <div key={floor}>
              {/* Floor Header */}
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-white font-bold text-lg">{floor}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-sm">{floorTables.length} tables</span>
                  <span className="text-green-400 text-sm">
                    • {floorTables.filter(t => t.status === 'available').length} available
                  </span>
                  <span className="text-red-400 text-sm">
                    • {floorTables.filter(t => t.status === 'occupied').length} occupied
                  </span>
                </div>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              {/* Tables Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {floorTables.map(table => (
                  <TableCard
                    key={table._id}
                    table={table}
                    isSelectMode={isSelectMode}
                    isSelected={selectedIds.includes(table._id)}
                    onSelect={handleSelect}
                    onEdit={(t) => { setEditTable(t); setShowModal(true); }}
                    onDelete={handleDelete}
                    onViewQR={setQrTable}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid View — All tables */}
      {!isLoading && viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {tables.map(table => (
            <TableCard
              key={table._id}
              table={table}
              isSelectMode={isSelectMode}
              isSelected={selectedIds.includes(table._id)}
              onSelect={handleSelect}
              onEdit={(t) => { setEditTable(t); setShowModal(true); }}
              onDelete={handleDelete}
              onViewQR={setQrTable}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && tables.length === 0 && (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🪑</div>
          <p className="text-zinc-400 text-lg font-semibold">No tables added yet</p>
          <p className="text-zinc-600 text-sm mt-1">Add your first table to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-5 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm"
          >
            + Add First Table
          </button>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <TableModal
          table={editTable}
          onClose={() => { setShowModal(false); setEditTable(null); }}
        />
      )}
      {qrTable && (
        <QRModal
          table={qrTable}
          onClose={() => setQrTable(null)}
        />
      )}
    </div>
  );
}
