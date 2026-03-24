import { useState } from 'react'; 
import { X } from 'lucide-react';
import type { ITable } from '../../hooks/useTables';
import { useCreateTable, useUpdateTable } from '../../hooks/useTables';

interface Props {
  table: ITable | null;
  onClose: () => void;
}

const FLOORS = ['Ground Floor', 'First Floor', 'Second Floor', 'Terrace', 'Basement'];

export default function TableModal({ table, onClose }: Props) {
  const isEdit = !!table;
  const createMutation = useCreateTable();
  const updateMutation = useUpdateTable();

  const [form, setForm] = useState({
    tableNumber: table?.tableNumber || '',
    capacity:    table?.capacity    || 4,
    floor:       table?.floor       || 'Ground Floor',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await updateMutation.mutateAsync({ id: table!._id, ...form });
    } else {
      await createMutation.mutateAsync(form);
    }
    onClose();
  };


  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-white font-bold text-lg">
            {isEdit ? ' Edit Table' : ' Add New Table'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Table Number */}
          <div>
            <label className="text-xs text-zinc-500 uppercase font-semibold mb-1 block">
              Table Number / Name
            </label>
            <input
              required
              type="text"
              placeholder="e.g. T1, T2, VIP-1"
              value={form.tableNumber}
              onChange={(e) => setForm(f => ({ ...f, tableNumber: e.target.value }))}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="text-xs text-zinc-500 uppercase font-semibold mb-1 block">
              Seating Capacity
            </label>
            <input
              required
              type="number"
              min={1}
              max={20}
              value={form.capacity}
              onChange={(e) => setForm(f => ({ ...f, capacity: parseInt(e.target.value) || 1 }))}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Floor */}
          <div>
            <label className="text-xs text-zinc-500 uppercase font-semibold mb-1 block">
              Floor
            </label>
            <select
              value={form.floor}
              onChange={(e) => setForm(f => ({ ...f, floor: e.target.value }))}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            >
              {FLOORS.map(fl => (
                <option key={fl} value={fl}>{fl}</option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold"
            >
              {isPending ? 'Saving...' : isEdit ? 'Update Table' : 'Create Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
