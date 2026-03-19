import { useState } from 'react';
import { X, TrendingUp, TrendingDown, Trash2, CalendarX2 } from 'lucide-react';
import { useAdjustStock, type RawMaterial } from '../../hooks/useInventory';


interface Props {
  item: RawMaterial;
  onClose: () => void;
}


const TYPES = [
  { value: 'add'    as const, label: 'Stock In',  icon: TrendingUp,   color: 'text-green-400 border-green-500/50 bg-green-500/10' },
  { value: 'remove' as const, label: 'Stock Out', icon: TrendingDown, color: 'text-orange-400 border-orange-500/50 bg-orange-500/10' },
  { value: 'wastage' as const, label: 'Wastage',  icon: Trash2,       color: 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10' },
  { value: 'expiry'  as const, label: 'Expiry',   icon: CalendarX2,   color: 'text-red-400 border-red-500/50 bg-red-500/10' },
] as const;


export default function StockAdjustModal({ item, onClose }: Props) {
  const adjustMutation = useAdjustStock();
  const [type,     setType]     = useState<'add' | 'remove' | 'wastage' | 'expiry'>('add');
const [quantity, setQuantity] = useState(0);
const [reason,   setReason]   = useState(''); 

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await adjustMutation.mutateAsync({ 
    id: item._id, 
    quantity, 
    type, 
    reason  
  });
  onClose();
};

  const newStock =
    type === 'add'
      ? item.currentStock + quantity
      : item.currentStock - quantity;

  const isInsufficient = type === 'remove' && quantity > item.currentStock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white">🔄 Adjust Stock</h2>
            <p className="text-zinc-500 text-sm mt-0.5">
              {item.name} — Current:{' '}
              <span className="text-white font-semibold">
                {Number(item.currentStock).toFixed(2)} {item.unit}
              </span>
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-3">
            {TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                    type === t.value
                      ? t.color
                      : 'border-zinc-700 text-zinc-400 bg-zinc-900 hover:border-zinc-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Quantity ({item.unit}) *
            </label>
            <input
              required
              type="number"
              min={0.1}
              step={0.1}
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
              className={`mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border rounded-xl text-white text-sm focus:outline-none transition-colors ${
                isInsufficient
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-zinc-700 focus:border-orange-500'
              }`}
            />
            {isInsufficient && (
              <p className="text-red-400 text-xs mt-1">
                ⚠️ Insufficient stock! Available: {Number(item.currentStock).toFixed(2)} {item.unit}
              </p>
            )}
          </div>

           
<div>
  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
    Reason *
  </label>
  <textarea
    required
    value={reason}
    onChange={(e) => setReason(e.target.value)}
    placeholder="e.g. Morning wastage, Paneer expired, Tomato spillage..."
    rows={2}
    className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 resize-none"
  />
</div>


          {/* New Stock Preview */}
          {quantity > 0 && !isInsufficient && (
            <div className="flex items-center justify-between p-4 bg-zinc-900/80 border border-zinc-700/50 rounded-xl">
              <span className="text-zinc-400 text-sm">New Stock will be:</span>
              <span className={`text-xl font-bold ${
                newStock <= item.minThreshold ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {newStock.toFixed(2)} {item.unit}
              </span>
            </div>
          )}

          {/* Low stock warning */}
          {quantity > 0 && !isInsufficient && newStock <= item.minThreshold && (
            <p className="text-yellow-400 text-xs bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
              ⚠️ Warning: New stock will be below minimum threshold ({item.minThreshold.toFixed(2)} {item.unit})
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adjustMutation.isPending || quantity <= 0 || !reason.trim()}
              className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              {adjustMutation.isPending ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
