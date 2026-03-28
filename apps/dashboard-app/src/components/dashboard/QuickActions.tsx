
import { useNavigate } from 'react-router-dom';
import { BookOpen, Grid3x3, BarChart2, Package, Users, ChefHat } from 'lucide-react';

const ACTIONS = [
  { label: 'Menu Items',       icon: BookOpen,  path: '/dashboard/menu',        color: 'text-orange-400  bg-orange-500/10  border-orange-500/20  hover:bg-orange-500/20'  }, // ← Replace New Order
  { label: 'Employees',  icon: Users,     path: '/dashboard/employees',   color: 'text-pink-400    bg-pink-500/10    border-pink-500/20    hover:bg-pink-500/20'    }, // ← Replace KDS
  { label: 'Tables',     icon: Grid3x3,   path: '/dashboard/tables',      color: 'text-blue-400    bg-blue-500/10    border-blue-500/20    hover:bg-blue-500/20'    },
  { label: 'Analytics',  icon: BarChart2, path: '/dashboard/analytics',   color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' },
  { label: 'Inventory',  icon: Package,   path: '/dashboard/inventory',   color: 'text-amber-400   bg-amber-500/10   border-amber-500/20   hover:bg-amber-500/20'  },
  { label: 'KDS',        icon: ChefHat,   path: '/kds',         color: 'text-purple-400  bg-purple-500/10  border-purple-500/20  hover:bg-purple-500/20' }, // ← Staff ko KDS se replace
];

export const QuickActions = () => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {ACTIONS.map((a) => (
        <button
          key={a.label}
          onClick={() => navigate(a.path)}
          className={`flex flex-col items-center gap-2 rounded-2xl border p-3
                      transition-all duration-200 active:scale-95 ${a.color}`}
        >
          <a.icon className="w-5 h-5" />
          <span className="text-[11px] font-semibold text-gray-300">{a.label}</span>
        </button>
      ))}
    </div>
  );
};