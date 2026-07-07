import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Volume2, VolumeX } from 'lucide-react';
import { useKDSSocket } from '../hooks/useKDSSocket';
import {
  getCompletedOrders,
  getKDSOrders,
  updateItemStatus as updateItemStatusApi,
  updateOrderStatus as updateOrderStatusApi,
} from '../services/kdsApi';
import { useKDSStore } from '../store/kdsStore';
import type { IOrder, IOrderItem, IStation, KDSUser, OrderStatus } from '../types/kds.types';
import KDSOrderCard from '../components/KDSOrderCard';
import KDSOrderDetailModal from '../components/KDSOrderDetailModal';

type TabKey = 'all' | 'pending' | 'accepted' | 'preparing' | 'ready' | 'served';
type DateFilterKey = 'today' | 'yesterday' | 'last3Days' | 'last7Days' | 'custom';

function getSession(): { user?: KDSUser; station?: IStation; expiresAt?: number } | null {
  const raw = localStorage.getItem('kds_session');
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    if (!session?.expiresAt || Date.now() > session.expiresAt) {
      localStorage.removeItem('kds_session');
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem('kds_session');
    return null;
  }
}

function toDateInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getRangeForFilter(
  dateFilter: DateFilterKey,
  customFrom: string,
  customTo: string
): { from?: string; to?: string } {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setHours(23, 59, 59, 999);

  if (dateFilter === 'today') {
    return { from: startOfToday.toISOString(), to: endOfToday.toISOString() };
  }

  if (dateFilter === 'yesterday') {
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - 1);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { from: start.toISOString(), to: end.toISOString() };
  }

  if (dateFilter === 'last3Days') {
    const from = new Date();
    from.setDate(from.getDate() - 3);
    return { from: from.toISOString(), to: endOfToday.toISOString() };
  }

  if (dateFilter === 'last7Days') {
    const from = new Date();
    from.setDate(from.getDate() - 7);
    return { from: from.toISOString(), to: endOfToday.toISOString() };
  }

  if (dateFilter === 'custom' && customFrom && customTo) {
    const from = new Date(customFrom);
    const to = new Date(customTo);
    to.setHours(23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
  }

  return {};
}

export default function KDSBoardPage() {
  const navigate = useNavigate();

  const {
    user,
    selectedStation,
    setUser,
    setSelectedStation,
    orders,
    completedOrders,
    setOrders,
    setCompletedOrders,
    isConnected,
    updateOrderStatus,
    updateItemStatus,
    soundEnabled,
    setSoundEnabled,
    audioUnlocked,
    setAudioUnlocked,
  } = useKDSStore();

  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterKey>('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  const session = getSession();
  const currentUser = user || session?.user || null;
  const currentStation = selectedStation || session?.station || null;

  useEffect(() => {
    if (!session?.user) {
      navigate('/login', { replace: true });
      return;
    }

    if (!session?.station) {
      navigate('/station-select', { replace: true });
      return;
    }

    if (!user && session.user) setUser(session.user);
    if (!selectedStation && session.station) setSelectedStation(session.station);
  }, [navigate, selectedStation, session, setSelectedStation, setUser, user]);

  useKDSSocket(currentUser?.restaurant || '', currentStation?.stationType);

  useEffect(() => {
    const timer = setInterval(() => {
      const validSession = getSession();
      if (!validSession) {
        navigate('/login', { replace: true });
        return;
      }
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  useEffect(() => {
    if (!currentStation) return;
    if (dateFilter === 'custom' && (!customFrom || !customTo)) return;

    const { from, to } = getRangeForFilter(dateFilter, customFrom, customTo);

    const loadOrders = async () => {
      try {
        setLoading(true);

        const [active, completed] = await Promise.all([
          getKDSOrders({
            station: currentStation.stationType,
            fromDate: from,
            toDate: to,
          }),
          getCompletedOrders({
            station: currentStation.stationType,
            fromDate: from,
            toDate: to,
          }),
        ]);

        setOrders(active);
        setCompletedOrders(completed);
      } catch (error) {
        console.error('Failed to load KDS orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [currentStation, dateFilter, customFrom, customTo, setCompletedOrders, setOrders]);

  useEffect(() => {
    if (!selectedOrder) return;

    const latest =
      [...orders, ...completedOrders].find((o) => o._id === selectedOrder._id) || null;

    if (latest) setSelectedOrder(latest);
  }, [orders, completedOrders, selectedOrder]);

  const allOrders = useMemo(() => {
    const map = new Map<string, IOrder>();

    [...orders, ...completedOrders].forEach((order) => {
      map.set(order._id, order);
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, completedOrders]);

  const filteredByDate = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    return allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      if (Number.isNaN(orderDate.getTime())) return false;

      if (dateFilter === 'today') {
        return orderDate >= startOfToday;
      }

      if (dateFilter === 'yesterday') {
        const start = new Date(startOfToday);
        start.setDate(start.getDate() - 1);
        return orderDate >= start && orderDate < startOfToday;
      }

      if (dateFilter === 'last3Days') {
        const from = new Date();
        from.setDate(from.getDate() - 3);
        return orderDate >= from;
      }

      if (dateFilter === 'last7Days') {
        const from = new Date();
        from.setDate(from.getDate() - 7);
        return orderDate >= from;
      }

      if (dateFilter === 'custom') {
        if (!customFrom || !customTo) return true;
        const from = new Date(customFrom);
        const to = new Date(customTo);
        to.setHours(23, 59, 59, 999);
        return orderDate >= from && orderDate <= to;
      }

      return true;
    });
  }, [allOrders, customFrom, customTo, dateFilter]);

  const filteredByTab = useMemo(() => {
    if (activeTab === 'all') return filteredByDate;
    return filteredByDate.filter((order) => order.status === activeTab);
  }, [activeTab, filteredByDate]);

  const visibleOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return filteredByTab;

    return filteredByTab.filter((order) => {
      const orderMatch = order.orderNumber.toLowerCase().includes(query);
      const tableMatch = order.tableNumber?.toLowerCase().includes(query);
      const itemMatch = order.items.some((item) =>
        item.name.toLowerCase().includes(query)
      );

      return orderMatch || tableMatch || itemMatch;
    });
  }, [filteredByTab, searchTerm]);

  const counts = useMemo(
    () => ({
      all: filteredByDate.length,
      pending: filteredByDate.filter((o) => o.status === 'pending').length,
      accepted: filteredByDate.filter((o) => o.status === 'accepted').length,
      preparing: filteredByDate.filter((o) => o.status === 'preparing').length,
      ready: filteredByDate.filter((o) => o.status === 'ready').length,
      served: filteredByDate.filter((o) => o.status === 'served').length,
    }),
    [filteredByDate]
  );

  const getElapsedMinutes = (order: IOrder) => {
    const created = new Date(order.createdAt).getTime();
    if (Number.isNaN(created)) return 0;

    const freezeStatuses: OrderStatus[] = ['ready', 'served', 'billed'];

    if (freezeStatuses.includes(order.status)) {
      const itemReadyTimes = order.items
        .map((item) => item.readyAt)
        .filter(Boolean)
        .map((value) => new Date(value as string).getTime())
        .filter((time) => !Number.isNaN(time));

      if (itemReadyTimes.length > 0) {
        const freezeAt = Math.max(...itemReadyTimes);
        return Math.max(0, Math.floor((freezeAt - created) / 60000));
      }
    }

    return Math.max(0, Math.floor((now.getTime() - created) / 60000));
  };

  const getElapsedLabel = (status: OrderStatus) => {
    if (status === 'pending' || status === 'accepted' || status === 'preparing') {
      return 'Prep Time';
    }

    if (status === 'ready' || status === 'served' || status === 'billed') {
      return 'Ready In';
    }

    return 'Prep Time';
  };

  const handleAdvanceOrder = async (order: IOrder, status: OrderStatus) => {
    try {
      setActionLoading(order._id);
      await updateOrderStatusApi(order._id, status);
      updateOrderStatus(order._id, status);
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (order: IOrder, reason: string) => {
    try {
      setActionLoading(order._id);
      await updateOrderStatusApi(order._id, 'cancelled', reason);
      updateOrderStatus(order._id, 'cancelled');
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdvanceItem = async (orderId: string, item: IOrderItem) => {
    const nextMap: Record<string, string> = {
      pending: 'accepted',
      accepted: 'preparing',
      preparing: 'ready',
      ready: 'served',
    };

    const nextStatus = nextMap[item.status];
    if (!nextStatus) return;

    try {
      setActionLoading(item._id);
      const res = await updateItemStatusApi(
        orderId,
        item._id,
        nextStatus as IOrderItem['status']
      );
      updateItemStatus(
        orderId,
        item._id,
        nextStatus as IOrderItem['status'],
        res.orderStatus
      );
    } catch (error) {
      console.error('Failed to update item status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnableAlerts = async () => {
    try {
      const audio = new Audio('/sounds/new-order.mp3');
      audio.preload = 'auto';
      audio.muted = true;

      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;

      setSoundEnabled(true);
      setAudioUnlocked(true);
    } catch (error) {
      console.warn('Enable alerts failed:', error);
    }
  };

  const handleToggleSound = async () => {
    if (soundEnabled) {
      setSoundEnabled(false);
      return;
    }

    if (!audioUnlocked) {
      await handleEnableAlerts();
      return;
    }

    setSoundEnabled(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('kds_session');
    navigate('/login', { replace: true });
  };

  const handleChangeStation = () => {
    const raw = localStorage.getItem('kds_session');
    const sessionData = raw ? JSON.parse(raw) : {};

    localStorage.setItem(
      'kds_session',
      JSON.stringify({
        ...sessionData,
        station: null,
      })
    );

    navigate('/station-select', { replace: true });
  };

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'accepted', label: 'Accepted', count: counts.accepted },
    { key: 'preparing', label: 'Preparing', count: counts.preparing },
    { key: 'ready', label: 'Ready', count: counts.ready },
    { key: 'served', label: 'Served', count: counts.served },
  ];

  if (!currentUser || !currentStation) return null;

  return (
    <div className="h-screen overflow-hidden bg-zinc-950 text-white">
      {!audioUnlocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-orange-500/20 bg-zinc-900 p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/25 bg-orange-500/10 text-2xl text-orange-400">
              🔔
            </div>

            <h2 className="text-xl font-bold text-white">Enable order alerts</h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Tap to enable sound alerts for new orders.
            </p>

            <button
              onClick={handleEnableAlerts}
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Tap to enable alerts
            </button>
          </div>
        </div>
      )}

      <div className="flex h-screen flex-col">
        <header className="z-30 flex-none border-b border-zinc-800 bg-zinc-900">
          <div className="px-4 md:px-6 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/25 text-orange-400">
                  <span className="text-base">🍽️</span>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-base md:text-lg font-bold tracking-tight text-white">
                      ZaikaFlow KDS
                    </h1>
                    <span className="hidden sm:inline rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-[11px] text-zinc-300">
                      {currentStation.name}
                    </span>
                  </div>

                  <p className="truncate text-[11px] text-zinc-500">
                    {currentStation.stationType} • {currentUser.name}
                  </p>
                </div>
              </div>

              <div className="flex flex-none items-center gap-2">
                <div className="hidden md:block w-52">
                  <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5">
                    <Search className="h-3.5 w-3.5 text-zinc-500" />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search order, table..."
                      className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 outline-none"
                    />
                  </div>
                </div>

                <div
                  className={`hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                    isConnected
                      ? 'border-green-500/25 bg-green-500/10 text-green-400'
                      : 'border-red-500/25 bg-red-500/10 text-red-400'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                    }`}
                  />
                  {isConnected ? 'Live' : 'Offline'}
                </div>

                <button
                  onClick={handleToggleSound}
                  className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    soundEnabled
                      ? 'border-orange-500/25 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-3.5 w-3.5" />
                  ) : (
                    <VolumeX className="h-3.5 w-3.5" />
                  )}
                  {soundEnabled ? 'Sound On' : 'Enable Sound'}
                </button>

                <button
                  onClick={handleChangeStation}
                  className="rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-400 transition hover:bg-orange-500/20"
                >
                  Station
                </button>

                <button
                  onClick={handleLogout}
                  className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="mt-2 md:hidden">
              <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-zinc-500" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search order, table, items..."
                  className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 outline-none"
                />
              </div>

              <div className="mt-2 flex sm:hidden">
                <button
                  onClick={handleToggleSound}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    soundEnabled
                      ? 'border-orange-500/25 bg-orange-500/10 text-orange-400'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-3.5 w-3.5" />
                  ) : (
                    <VolumeX className="h-3.5 w-3.5" />
                  )}
                  {soundEnabled ? 'Sound On' : 'Enable Sound'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 md:px-6 pt-4 space-y-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3.5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Order Status
              </p>
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activeTab === tab.key
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-zinc-800 text-white/80 hover:bg-zinc-700 border border-zinc-700/50'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3.5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Date Range
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    ['today', 'Today'],
                    ['yesterday', 'Yesterday'],
                    ['last3Days', 'Last 3 Days'],
                    ['last7Days', 'Last 7 Days'],
                    ['custom', 'Custom'],
                  ] as [DateFilterKey, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setDateFilter(key);
                      if (key !== 'custom') {
                        setCustomFrom('');
                        setCustomTo('');
                      }
                    }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      dateFilter === key
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}

                {dateFilter === 'custom' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      value={customFrom}
                      max={customTo || undefined}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-1.5 outline-none"
                    />
                    <span className="text-zinc-600 text-sm">→</span>
                    <input
                      type="date"
                      value={customTo}
                      min={customFrom || undefined}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-1.5 outline-none"
                    />
                    {(!customFrom || !customTo) && (
                      <button
                        onClick={() => {
                          const t = new Date();
                          setCustomFrom(toDateInputValue(t));
                          setCustomTo(toDateInputValue(t));
                        }}
                        className="text-xs px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg"
                      >
                        Set Today
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <main className="px-4 md:px-6 py-6">
            {!loading && visibleOrders.length > 0 && (
              <div className="mb-3 hidden grid-cols-12 gap-4 px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-600 lg:grid">
                <div className="col-span-3">Order</div>
                <div className="col-span-4">Items</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Date & Time</div>
                <div className="col-span-1 text-right">Time Taken</div>
              </div>
            )}

            {loading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-zinc-900 rounded-xl h-16 animate-pulse" />
                ))}
              </div>
            ) : visibleOrders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-zinc-500 text-lg">No orders found</p>
                <p className="text-zinc-600 text-sm mt-1">
                  Try changing the status or date filter
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {visibleOrders.map((order) => (
                  <KDSOrderCard
                    key={order._id}
                    order={order}
                    elapsed={getElapsedMinutes(order)}
                    elapsedLabel={getElapsedLabel(order.status)}
                    onClick={() => setSelectedOrder(order)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>

        {selectedOrder && (
          <KDSOrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onAdvanceOrder={handleAdvanceOrder}
            onCancelOrder={handleCancelOrder}
            actionLoadingId={actionLoading}
          />
        )}
      </div>
    </div>
  );
}