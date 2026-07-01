import { useEffect, useMemo, useState } from 'react';
import { updateItemStatus, updateOrderStatus } from '../services/kdsApi';
import { useKDSStore } from '../store/kdsStore';
import type {
  IOrder,
  IOrderItem,
  KDSColumnType,
  OrderItemStatus,
} from '../types/kds.types';

interface Props {
  order: IOrder;
  columnId: KDSColumnType;
}

const ITEM_STATUS_COLORS: Record<OrderItemStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  accepted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  preparing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ready: 'bg-green-500/20 text-green-400 border-green-500/30',
  served: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const NEXT_ITEM_STATUS: Partial<Record<OrderItemStatus, OrderItemStatus>> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'served',
};

function ElapsedTimer({ createdAt }: { createdAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const { elapsedLabel, isDelayed } = useMemo(() => {
    const diff = Math.floor((now - new Date(createdAt).getTime()) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;

    return {
      elapsedLabel: `${m}m ${s}s`,
      isDelayed: diff > 600,
    };
  }, [now, createdAt]);

  return (
    <span
      className={`text-xs font-mono px-2 py-0.5 rounded-full ${
        isDelayed
          ? 'bg-red-500/20 text-red-400 animate-pulse'
          : 'bg-gray-700 text-gray-300'
      }`}
    >
      {elapsedLabel}
    </span>
  );
}

export default function OrderCard({ order, columnId }: Props) {
  const {
    updateItemStatus: storeUpdateItem,
    updateOrderStatus: storeUpdateOrder,
  } = useKDSStore();

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const handleItemAction = async (item: IOrderItem) => {
    const nextStatus = NEXT_ITEM_STATUS[item.status];
    if (!nextStatus) return;

    setLoadingItemId(item._id);
    try {
      const res = await updateItemStatus(order._id, item._id, nextStatus);
      storeUpdateItem(order._id, item._id, nextStatus, res.orderStatus);
    } catch (err) {
      console.error('Item status update failed:', err);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleOrderAccept = async () => {
    setLoadingOrder(true);
    try {
      await updateOrderStatus(order._id, 'accepted');
      storeUpdateOrder(order._id, 'accepted');
    } catch (err) {
      console.error('Order accept failed:', err);
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleOrderReady = async () => {
    setLoadingOrder(true);
    try {
      await updateOrderStatus(order._id, 'ready');
      storeUpdateOrder(order._id, 'ready');
    } catch (err) {
      console.error('Order ready failed:', err);
    } finally {
      setLoadingOrder(false);
    }
  };

  const isCompleted = columnId === 'completed';

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-3 transition-all ${
        isCompleted
          ? 'bg-gray-900/50 border-gray-800 opacity-60'
          : order.status === 'ready'
          ? 'bg-green-950/40 border-green-700/50'
          : order.status === 'pending'
          ? 'bg-yellow-950/30 border-yellow-700/30'
          : 'bg-gray-900 border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-base">
            #{order.orderNumber}
          </span>
          <span className="text-gray-400 text-sm">T-{order.tableNumber}</span>
        </div>
        <ElapsedTimer createdAt={order.createdAt} />
      </div>

      {order.notes && (
        <div className="text-xs text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
          📝 {order.notes}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {order.items.map((item) => {
          const nextStatus = NEXT_ITEM_STATUS[item.status];
          const isLoading = loadingItemId === item._id;
          const isCancelled = item.status === 'cancelled';

          return (
            <div
              key={item._id}
              className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 border ${
                isCancelled
                  ? 'opacity-40 line-through bg-gray-800/30 border-gray-700'
                  : 'bg-gray-800/50 border-gray-700/50'
              }`}
            >
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium truncate">
                    {item.name}
                  </span>
                  <span className="text-gray-400 text-xs shrink-0">
                    x{item.quantity}
                  </span>
                </div>

                {item.notes && (
                  <span className="text-orange-300 text-xs mt-0.5 truncate">
                    {item.notes}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    ITEM_STATUS_COLORS[item.status]
                  }`}
                >
                  {item.status}
                </span>

                {!isCompleted && nextStatus && !isCancelled && (
                  <button
                    onClick={() => handleItemAction(item)}
                    disabled={isLoading}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-40 min-w-[70px] text-center"
                  >
                    {isLoading ? '...' : `→ ${nextStatus}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isCompleted && (
        <div className="flex gap-2 mt-1">
          {order.status === 'pending' && (
            <button
              onClick={handleOrderAccept}
              disabled={loadingOrder}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-40"
            >
              {loadingOrder ? 'Accepting...' : '✓ Accept Ticket'}
            </button>
          )}

          {(order.status === 'accepted' || order.status === 'preparing') && (
            <button
              onClick={handleOrderReady}
              disabled={loadingOrder}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-40"
            >
              {loadingOrder ? 'Marking...' : '✓ Mark Ready'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}