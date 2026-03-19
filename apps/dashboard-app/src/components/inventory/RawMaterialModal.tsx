import { useState, useMemo } from 'react'; 
import { X } from 'lucide-react';
import {
  useAddMaterial,
  useUpdateMaterial,
  type RawMaterial,
} from '../../hooks/useInventory';

interface Props {
  item: RawMaterial | null;
  onClose: () => void;
}

const UNITS: RawMaterial['unit'][] = ['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'packet'];

export default function RawMaterialModal({ item, onClose }: Props) {
  const addMutation    = useAddMaterial();
  const updateMutation = useUpdateMaterial();
  const isEdit = !!item;

  
  const initialForm = useMemo(() => ({
    name:             item?.name             ?? '',
    unit:             item?.unit             ?? 'kg' as RawMaterial['unit'],
    currentStock:     item?.currentStock     ?? 0,
    minThreshold:     item?.minThreshold     ?? 0,
    unitCost:         item?.unitCost         ?? 0,
    supplier:         item?.supplier         ?? '',
    lastPurchaseDate: item?.lastPurchaseDate
      ? new Date(item.lastPurchaseDate).toISOString().split('T')[0]
      : '',
  }), [item]);

  const [form, setForm] = useState(initialForm);

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      lastPurchaseDate: form.lastPurchaseDate || undefined,
      supplier:         form.supplier         || undefined,
    };
    if (isEdit) {
      await updateMutation.mutateAsync({ id: item!._id, payload });
    } else {
      await addMutation.mutateAsync(payload);
    }
    onClose();
  };

  const loading = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg mx-4 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">
            {isEdit ? '✏️ Edit Raw Material' : '➕ Add Raw Material'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Material Name *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Paneer, Tomato, Rice"
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Unit + Unit Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Unit *</label>
              <select
                value={form.unit}
                onChange={(e) => set('unit', e.target.value)}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u} className="bg-zinc-900">{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Unit Cost (₹) *
              </label>
              <input
                required
                type="number"
                min={0}
                step={0.01}
                value={form.unitCost}
                onChange={(e) => set('unitCost', parseFloat(e.target.value))}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Current Stock + Min Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Current Stock *
              </label>
              <input
                required
                type="number"
                min={0}
                step={0.1}
                value={form.currentStock}
                onChange={(e) => set('currentStock', parseFloat(e.target.value))}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Min Threshold *
              </label>
              <input
                required
                type="number"
                min={0}
                step={0.1}
                value={form.minThreshold}
                onChange={(e) => set('minThreshold', parseFloat(e.target.value))}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Supplier (Optional)
            </label>
            <input
              value={form.supplier}
              onChange={(e) => set('supplier', e.target.value)}
              placeholder="e.g. Ramesh Traders, Local Market"
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Last Purchase Date */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Last Purchase Date (Optional)
            </label>
            <input
              type="date"
              value={form.lastPurchaseDate}
              onChange={(e) => set('lastPurchaseDate', e.target.value)}
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Add Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
