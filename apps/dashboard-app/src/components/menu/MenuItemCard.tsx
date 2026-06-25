import { Pencil, Trash2, Leaf, Drumstick, Clock3, Flame, GlassWater, UtensilsCrossed, IceCream, Package } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { type MenuItem } from '../../hooks/useMenuItems';

interface Props {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isAvailable: boolean) => void;
}

const STATION_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  kitchen: {
    label: 'Kitchen',
    color: 'bg-blue-500/20 text-blue-400',
    icon: <UtensilsCrossed className="w-3 h-3" />,
  },
  grill: {
    label: 'Grill',
    color: 'bg-orange-500/20 text-orange-400',
    icon: <Flame className="w-3 h-3" />,
  },
  drinks: {
    label: 'Drinks',
    color: 'bg-cyan-500/20 text-cyan-400',
    icon: <GlassWater className="w-3 h-3" />,
  },
  dessert: {
    label: 'Desserts',
    color: 'bg-pink-500/20 text-pink-400',
    icon: <IceCream className="w-3 h-3" />,
  },
  other: {
    label: 'Other',
    color: 'bg-zinc-500/20 text-zinc-400',
    icon: <Package className="w-3 h-3" />,
  },
};

export default function MenuItemCard({ item, onEdit, onDelete, onToggle }: Props) {
  const queryClient = useQueryClient();

  const handleToggle = () => {
    queryClient.setQueryData(['menu-items'], (old: MenuItem[] | undefined) =>
      old?.map((i) =>
        i._id === item._id ? { ...i, isAvailable: !item.isAvailable } : i
      )
    );
    onToggle(item._id, !item.isAvailable);
  };

  const station = item.station ? STATION_CONFIG[item.station] : STATION_CONFIG['kitchen'];
  const hasDiscount = item.discountedPrice != null && item.discountedPrice < item.price;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 relative overflow-visible">

      {/* Image + Toggle */}
      <div className="relative">
        <div className={`w-full h-36 rounded-lg overflow-hidden bg-zinc-800 transition-opacity duration-200 ${
          !item.isAvailable ? 'opacity-50' : 'opacity-100'
        }`}>
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
              No Image
            </div>
          )}
        </div>

        {/* Toggle switch */}
        <button
          onClick={handleToggle}
          className={`absolute -top-2 -right-2 w-10 h-5 rounded-full transition-all duration-200 z-50 shadow-md ${
            item.isAvailable ? 'bg-green-500 hover:bg-green-600' : 'bg-zinc-600 hover:bg-zinc-500'
          }`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
            item.isAvailable ? 'left-5' : 'left-0.5'
          }`} />
        </button>
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-2 transition-opacity duration-200 ${!item.isAvailable ? 'opacity-60' : 'opacity-100'}`}>

        {/* Name + Veg/NonVeg + Price */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              {item.isVeg ? (
                <Leaf className="w-3.5 h-3.5 text-green-400 shrink-0" />
              ) : (
                <Drumstick className="w-3.5 h-3.5 text-red-400 shrink-0" />
              )}
              <span className="text-white font-semibold text-sm truncate">{item.name}</span>
            </div>
            <p className="text-zinc-500 text-xs">{item.category?.name}</p>
          </div>

          {/* Price block */}
          <div className="text-right shrink-0">
            {hasDiscount ? (
              <>
                <p className="text-orange-400 font-bold text-sm">₹{item.discountedPrice}</p>
                <p className="text-zinc-600 text-xs line-through">₹{item.price}</p>
              </>
            ) : (
              <p className="text-orange-400 font-bold text-sm">₹{item.price}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-zinc-500 text-xs line-clamp-2">{item.description}</p>
        )}

        {/* Station + Prep Time */}
        <div className="flex items-center gap-2">
          {station && (
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${station.color}`}>
              {station.icon}
              {station.label}
            </span>
          )}
          {item.preparationTime && (
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock3 className="w-3 h-3" />
              {item.preparationTime}m
            </span>
          )}
        </div>

        {/* Bottom row — Status + Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            item.isAvailable
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </span>

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