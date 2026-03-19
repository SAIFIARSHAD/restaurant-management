import { useState } from 'react';
import { Pencil, Trash2, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useDeleteMaterial, type RawMaterial } from '../../hooks/useInventory';
import RawMaterialModal from './RawMaterialModal';
import StockAdjustModal from './StockAdjustModal';

interface Props {
  materials: RawMaterial[];
}

export default function RawMaterialTable({ materials }: Props) {
  const deleteMutation = useDeleteMaterial();
  const [editItem,   setEditItem]   = useState<RawMaterial | null>(null);
  const [adjustItem, setAdjustItem] = useState<RawMaterial | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this material? (Soft delete)')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-zinc-500 font-semibold uppercase tracking-wider border-b border-zinc-800 bg-zinc-900/60">
              <th className="px-5 py-3.5 text-center">Material</th>
              <th className="px-5 py-3.5 text-center">Unit</th>
              <th className="px-5 py-3.5 text-center">Current Stock</th>
              <th className="px-5 py-3.5 text-center">Min Threshold</th>
              <th className="px-5 py-3.5 text-right">Unit Cost</th>
              <th className="px-5 py-3.5 text-right">Stock Value</th>
              <th className="px-5 py-3.5 text-left">Supplier</th>
              <th className="px-5 py-3.5 text-center">Status</th>
              <th className="px-5 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {materials.map((m) => {
              const isOut  = m.currentStock === 0;
              const isLow  = !isOut && m.currentStock <= m.minThreshold;
              const stockVal = (m.currentStock * m.unitCost).toFixed(2);

              return (
                <tr
                  key={m._id}
                  className={`transition-colors hover:bg-zinc-900/50 ${
                    isOut ? 'bg-red-500/5' : isLow ? 'bg-yellow-500/5' : ''
                  }`}
                >
                  <td className="px-5 py-4 text-center font-semibold text-white">{m.name}</td>
                  <td className="px-5 py-4 text-center text-zinc-400">{m.unit}</td>

                  <td className={`px-5 py-4 text-center font-bold ${
                    isOut ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-white'
                  }`}>
                    { Number(m.currentStock).toFixed(2) }
                  </td>

                  <td className="px-5 py-4 text-center text-zinc-400">{m.minThreshold}</td>
                  <td className="px-5 py-4 text-right text-zinc-300">₹{m.unitCost}</td>
                  <td className="px-5 py-4 text-right text-zinc-300">₹{stockVal}</td>

                  <td className="px-5 py-4 text-zinc-400 text-sm">
                    {m.supplier || <span className="text-zinc-600">—</span>}
                  </td>

                  {/* Status Badge */}
                  <td className="px-5 py-4 text-center">
                    {isOut ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold rounded-full">
                        <XCircle className="w-3 h-3" /> Out of Stock
                      </span>
                    ) : isLow ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-bold rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold rounded-full">
                        <CheckCircle className="w-3 h-3" /> In Stock
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setAdjustItem(m)}
                        title="Adjust Stock"
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-500/20 hover:text-blue-400 text-zinc-400 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditItem(m)}
                        title="Edit"
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-orange-500/20 hover:text-orange-400 text-zinc-400 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m._id)}
                        title="Delete"
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editItem   && <RawMaterialModal item={editItem}   onClose={() => setEditItem(null)} />}
      {adjustItem && <StockAdjustModal item={adjustItem} onClose={() => setAdjustItem(null)} />}
    </>
  );
}
