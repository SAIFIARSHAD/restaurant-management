import { Trophy }         from 'lucide-react';
import type { TopItem }   from '../../hooks/useDashboard';

const RANK_COLOR = ['text-yellow-400', 'text-gray-400', 'text-orange-600'];

export const TopItemsList = ({ items }: { items: TopItem[] }) => (
  <div className="flex flex-col gap-2">
    {items.length === 0 && (
      <p className="text-sm text-gray-600 text-center py-6">No orders today</p>
    )}
    {items.map((item, i) => (
      <div key={item.name}
        className="flex items-center gap-3 bg-gray-800/50 border border-gray-700/40
                   rounded-xl px-4 py-2.5 hover:bg-gray-800 transition">
        <span className={`text-sm font-black w-5 ${RANK_COLOR[i] ?? 'text-gray-500'}`}>{i + 1}</span>
        <Trophy className={`w-3.5 h-3.5 shrink-0 ${RANK_COLOR[i] ?? 'text-gray-600'}`} />
        <p className="text-sm text-gray-200 font-medium flex-1">{item.name}</p>
        <div className="text-right">
          <p className="text-xs font-bold text-orange-400">x{item.quantity}</p>
          <p className="text-[10px] text-gray-500">₹{item.revenue.toLocaleString('en-IN')}</p>
        </div>
      </div>
    ))}
  </div>
);