import { useEffect, useState, useRef } from 'react';
import { useQueryClient }              from '@tanstack/react-query';
import {
  ShoppingBag, Clock, CheckCircle2, ChefHat,
  UtensilsCrossed, XCircle, Receipt,
} from 'lucide-react';
import { useSocket }    from '../../hooks/useSocket';
import { useDashboard } from '../../hooks/useDashboard';
import api              from '../../api/axios';
import { useNavigate } from 'react-router-dom';

interface OrderItem { name: string; quantity: number; }
interface Order {
  _id:         string;
  orderNumber: string;
  tableNumber: string;
  items:       OrderItem[];
  status:      'pending' | 'accepted' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'billed';
  totalAmount: number;
  createdAt:   string;
}

const STATUS_CFG = {
  pending:   { label: 'Pending',   color: 'text-amber-400',   bg: 'bg-amber-400/10   border-amber-400/30',   icon: Clock           },
  accepted:  { label: 'Accepted',  color: 'text-blue-400',    bg: 'bg-blue-400/10    border-blue-400/30',    icon: CheckCircle2    },
  preparing: { label: 'Preparing', color: 'text-purple-400',  bg: 'bg-purple-400/10  border-purple-400/30',  icon: ChefHat         },
  ready:     { label: 'Ready',     color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', icon: UtensilsCrossed },
  served:    { label: 'Served',    color: 'text-gray-400',    bg: 'bg-gray-400/10    border-gray-400/30',    icon: CheckCircle2    },
  cancelled: { label: 'Cancelled', color: 'text-red-400',     bg: 'bg-red-400/10     border-red-400/30',     icon: XCircle         },
  billed:    { label: 'Billed',    color: 'text-teal-400',    bg: 'bg-teal-400/10    border-teal-400/30',    icon: Receipt         },
};

const timeAgo = (date: string) => {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
};


const getTodayStr = () => new Date().toDateString();

const asOrder = (fn: (o: Order) => void) => (...args: unknown[]) => fn(args[0] as Order);


const isTodayOrder = (createdAt: string) => {
  return new Date(createdAt).toDateString() === getTodayStr();
};

export const LiveOrdersPanel = () => {
  const queryClient         = useQueryClient();
  const { on, off }         = useSocket();
  const { data: dashboard } = useDashboard();

  const [orders,      setOrders]      = useState<Order[]>([]);
  const [filter,      setFilter]      = useState<string>('all');
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const todayRef = useRef(getTodayStr());
  const navigate = useNavigate();

  
  const fetchTodayOrders = () => {
    api.get('/orders', {
      params: {
        limit: 100,
        
      },
    })
      .then(({ data }) => {
        const all: Order[] = data.orders ?? data.data ?? [];
        
        const todayOrders = all.filter(o => isTodayOrder(o.createdAt));
        setOrders(todayOrders);
      })
      .catch(() => {});
  };

  
  useEffect(() => {
    fetchTodayOrders();

    const midnightCheck = setInterval(() => {
      const currentDay = getTodayStr();
      if (currentDay !== todayRef.current) {
        
        todayRef.current = currentDay;
        setOrders([]);
        setNewOrderIds(new Set());
        fetchTodayOrders();
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    }, 60000); 

    return () => clearInterval(midnightCheck);
  }, []);

  
  useEffect(() => {
    const onNew = asOrder((order: Order) => {
      
      if (!isTodayOrder(order.createdAt)) return;
      setOrders((prev) => [order, ...prev]);
      setNewOrderIds((prev) => new Set(prev).add(order._id));
      setTimeout(() => {
        setNewOrderIds((prev) => {
          const s = new Set(prev); s.delete(order._id); return s;
        });
      }, 3000);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    const onUpdate = asOrder((updated: Order) => {
      setOrders((prev) =>
        prev.map((o) => o._id === updated._id ? updated : o)
      );
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    on('new_order',       onNew);
    on('order_accepted',  onUpdate);
    on('order_preparing', onUpdate);
    on('order_ready',     onUpdate);
    on('order_billed',    onUpdate);
    on('order_cancelled', onUpdate);

    return () => {
      off('new_order',       onNew);
      off('order_accepted',  onUpdate);
      off('order_preparing', onUpdate);
      off('order_ready',     onUpdate);
      off('order_billed',    onUpdate);
      off('order_cancelled', onUpdate);
    };
  }, [on, off, queryClient]);

  const stats   = dashboard?.orderStatus ?? {};
  const total   = orders.length;

  
  const STAT_BOXES = [
    { label: 'Total',     value: total,                        color: 'text-white',       icon: ShoppingBag     },
    { label: 'Pending',   value: stats['pending']   ?? 0,      color: 'text-amber-400',   icon: Clock           },
    { label: 'Accepted',  value: stats['accepted']  ?? 0,      color: 'text-blue-400',    icon: CheckCircle2    },
    { label: 'Preparing', value: stats['preparing'] ?? 0,      color: 'text-purple-400',  icon: ChefHat         },
    { label: 'Ready',     value: stats['ready']     ?? 0,      color: 'text-emerald-400', icon: UtensilsCrossed },
    { label: 'Billed',    value: stats['billed']    ?? 0,      color: 'text-teal-400',    icon: Receipt         }, // ✅ NEW
    { label: 'Cancelled', value: stats['cancelled'] ?? 0,      color: 'text-red-400',     icon: XCircle         },
  ];

  
  const FILTERS = ['all', 'pending', 'accepted', 'preparing', 'ready', 'billed', 'cancelled'];
  const filtered = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter);

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <h3 className="text-sm font-bold text-white">Today Live</h3>
          <span className="text-[10px] text-gray-600">(auto refresh 30s)</span>
        </div>

      </div>

      
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        {STAT_BOXES.map((box) => (
          <div key={box.label}
            className="bg-gray-800/60 border border-gray-700/50 rounded-xl
                       p-3 flex flex-col items-center gap-1.5 text-center
                       hover:bg-gray-800 transition-all duration-200">
            <box.icon className={`w-4 h-4 ${box.color}`} />
            <p className={`text-xl font-black ${box.color}`}>{box.value}</p>
            <p className="text-[10px] text-gray-500 leading-tight">{box.label}</p>
          </div>
        ))}
      </div>

      
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all
              ${filter === f
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'}`}
          >
            {f === 'all' ? `All (${orders.length})` : f}
          </button>
        ))}
      </div>


{filtered.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-12 text-gray-700">
    <ShoppingBag className="w-10 h-10 mb-2 opacity-30" />
    <p className="text-sm">No orders today</p>
  </div>
) : (
  <>
    
    <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr] gap-3
                    px-3 py-2 text-[10px] font-semibold text-gray-500
                    uppercase tracking-wider border-b border-gray-700/50">
      <span>Order</span>
      <span>Items</span>
      <span>Status</span>
      <span>Table</span>
      <span>Time</span>
      <span className="text-right">Total</span>
    </div>

    
    <div className="max-h-[360px] overflow-y-auto
                    scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
      {filtered.slice(0, 10).map((order) => {
        const cfg        = STATUS_CFG[order.status] ?? STATUS_CFG.pending;
        const StatusIcon = cfg.icon;
        const isNew      = newOrderIds.has(order._id);

        return (
          <div
            key={order._id}
            className={`grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr] gap-3 items-center
                        px-3 py-3 border-b border-gray-700/30 transition-all duration-200
                        hover:bg-gray-800/40 rounded-lg
                        ${isNew ? 'bg-orange-500/5 ring-1 ring-orange-500/30' : ''}`}
          >
            
            <div>
              <p className="text-xs font-black text-orange-400">
                #{order.orderNumber}
                {isNew && (
                  <span className="ml-1 text-[9px] bg-orange-500 text-white
                                   px-1.5 py-0.5 rounded-full animate-pulse">
                    NEW
                  </span>
                )}
              </p>
            </div>

            
            <div>
              <p className="text-xs text-gray-300 truncate">
                {order.items.slice(0, 2).map(i => `${i.quantity}x ${i.name}`).join(', ')}
                {order.items.length > 2 && (
                  <span className="text-gray-600"> +{order.items.length - 2} more</span>
                )}
              </p>
              <p className="text-[10px] text-gray-600">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
            </div>

            
            <div>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold
                               px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                <StatusIcon className="w-2.5 h-2.5" />
                {cfg.label}
              </span>
            </div>

            
            <div>
              <p className="text-xs text-gray-400">Table {order.tableNumber}</p>
            </div>

            
            <div>
              <p className="text-xs text-gray-400">{timeAgo(order.createdAt)}</p>
            </div>

            
            <div className="text-right">
              <p className="text-xs font-bold text-emerald-400">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        );
      })}
    </div>

    
    {filtered.length > 10 && (
      <div className="pt-2 text-center border-t border-gray-700/30">
        <button
          onClick={() => navigate('/dashboard/orders')}
          className="text-xs text-orange-400 hover:text-orange-300 font-semibold
                     flex items-center gap-1 mx-auto transition-colors"
        >
          View All {filtered.length} Orders
          <span className="text-lg leading-none">→</span>
        </button>
      </div>
    )}
  </>
)}
    </div>
  );
};