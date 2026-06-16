import { Pencil, Trash2, Leaf, Drumstick } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { type MenuItem } from '../../hooks/useMenuItems';

interface Props {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isAvailable: boolean) => void;
}

export default function MenuItemCard({ item, onEdit, onDelete, onToggle }: Props) {
  const queryClient = useQueryClient();

  const handleToggle = () => {
    // Optimistic update
    queryClient.setQueryData(['menu-items'], (old: MenuItem[] | undefined) =>
      old?.map(i => 
        i._id === item._id 
          ? { ...i, isAvailable: !item.isAvailable } 
          : i
      )
    );
    
    onToggle(item._id, !item.isAvailable);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 relative overflow-visible">
      
      {/* Image + Toggle container */}
      <div className="relative">
        <div className={`w-full h-36 rounded-lg overflow-hidden bg-zinc-800 transition-opacity duration-200 ${
          !item.isAvailable ? 'opacity-60' : 'opacity-100'
        }`}>
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
              No Image
            </div>
          )}
        </div>

        {/* Toggle - Always clickable + High z-index */}
        <button
          onClick={handleToggle}
          className={`absolute -top-2 -right-2 w-10 h-5 rounded-full transition-all duration-200 z-50 pointer-events-auto shadow-md ${
            item.isAvailable ? 'bg-green-500 hover:bg-green-600' : 'bg-zinc-600 hover:bg-zinc-500'
          }`}
          style={{ pointerEvents: 'auto' }}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
            item.isAvailable ? 'left-5' : 'left-0.5'
          }`} />
        </button>
      </div>

      {/* Content - opacity effect */}
      <div className={`transition-opacity duration-200 ${!item.isAvailable ? 'opacity-60' : 'opacity-100'}`}>
        
        {/* Info */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-1 mb-1">
              {item.isVeg ? (
                <Leaf className="w-4 h-4 text-green-400" />
              ) : (
                <Drumstick className="w-4 h-4 text-red-400" />
              )}
              <span className="text-white font-semibold text-sm">{item.name}</span>
            </div>
            <p className="text-zinc-400 text-xs">{item.category?.name}</p>
          </div>
          <span className="text-orange-400 font-bold text-sm">₹{item.price}</span>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-zinc-500 text-xs line-clamp-2 mb-3">{item.description}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          {/* Status text */}
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            item.isAvailable
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </span>

          {/* Edit + Delete */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
