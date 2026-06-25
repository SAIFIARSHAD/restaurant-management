import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCw, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useKDSStore } from '../store/kdsStore';
import { useKitchenSocket } from '../hooks/useKitchenSocket';
import { fetchKitchenOrders, updateOrderStatus } from '../services/kdsService';
import type { OrderStatus, StationType } from '../types/kds';
import OrderCard from '../components/OrderCard';

const STATION_LABELS: Record<StationType, string> = {
  kitchen: 'Kitchen',
  grill:   'Grill / Tandoor',
  drinks:  'Drinks',
  dessert: 'Dessert',
  other:   'Other',
};

export default function KitchenDisplayPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { session, orders, setSession, setOrders, updateOrderStatus: updateLocal } = useKDSStore();
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  // Read params and set session
  useEffect(() => {
    const restaurantId = searchParams.get('restaurantId');
    const station      = searchParams.get('station') as StationType;
    const screenName   = searchParams.get('screenName') ?? '';

    if (!restaurantId || !station) {
      navigate('/');
      return;
    }

    setSession({ restaurantId, station, screenName });
  }, []);

  // Socket
  useKitchenSocket();

  // Fetch initial orders
  useEffect(() => {
    if (!session) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchKitchenOrders(session.restaurantId, session.station);
        setOrders(data);
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [session]);

  // Clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    updateLocal(orderId, status);
    try {
      await updateOrderStatus(orderId, status);
    } catch {
      console.error('Status update failed');
    }
  };

  const handleRefresh = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const data = await fetchKitchenOrders(session.restaurantId, session.station);
      setOrders(data);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  const pendingOrders   = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing' || o.status === 'accepted');
  const readyOrders     = orders.filter((o) => o.status === 'ready');

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 bg-[#1a1f35] px-6 py-3">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="ZaikaFlow" className="w-8 h-8 rounded-full object-cover" />
          <div>
            <p className="text-sm font-bold text-white">
              {session ? STATION_LABELS[session.station] : 'KDS'}
              {session?.screenName ? ` — ${session.screenName}` : ''}
            </p>
            <p className="text-xs text-slate-500">ZaikaFlow Kitchen Display</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Clock */}
          <span className="text-sm font-mono text-slate-400">
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>

          {/* Online indicator */}
          <div className={`flex items-center gap-1.5 text-xs font-medium ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isOnline ? 'Live' : 'Offline'}
          </div>

          {/* Order count */}
          <span className="rounded-full bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-semibold text-orange-400">
            {orders.length} Active
          </span>

          <button
            onClick={handleRefresh}
            className="rounded-xl bg-white/5 border border-white/10 p-2 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => navigate('/')}
            className="rounded-xl bg-white/5 border border-white/10 p-2 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Columns */}
      <div className="flex-1 grid grid-cols-3 gap-0 divide-x divide-white/10 overflow-hidden">

        {/* Pending */}
        <section className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-yellow-500/5">
            <h2 className="text-sm font-bold text-yellow-400">Pending</h2>
            <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-400">
              {pendingOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {loading ? (
              <p className="text-xs text-slate-600 text-center mt-8">Loading...</p>
            ) : pendingOrders.length === 0 ? (
              <p className="text-xs text-slate-600 text-center mt-8">No pending orders</p>
            ) : (
              pendingOrders.map((order) => (
                <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
              ))
            )}
          </div>
        </section>

        {/* Preparing */}
        <section className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-orange-500/5">
            <h2 className="text-sm font-bold text-orange-400">Preparing</h2>
            <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-400">
              {preparingOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {preparingOrders.length === 0 ? (
              <p className="text-xs text-slate-600 text-center mt-8">No orders in preparation</p>
            ) : (
              preparingOrders.map((order) => (
                <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
              ))
            )}
          </div>
        </section>

        {/* Ready */}
        <section className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-green-500/5">
            <h2 className="text-sm font-bold text-green-400">Ready</h2>
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-400">
              {readyOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {readyOrders.length === 0 ? (
              <p className="text-xs text-slate-600 text-center mt-8">No orders ready yet</p>
            ) : (
              readyOrders.map((order) => (
                <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}