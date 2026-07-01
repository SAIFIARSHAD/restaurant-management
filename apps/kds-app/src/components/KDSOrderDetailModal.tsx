import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { IOrder, OrderStatus } from '../types/kds.types';
import { STATUS_CONFIG, DEFAULT_STATUS, formatDateTime } from './KDSOrderCard';

interface Props {
  order: IOrder;
  onClose: () => void;
  onAdvanceOrder: (order: IOrder, status: OrderStatus) => Promise<void>;
  onCancelOrder: (order: IOrder, reason: string) => Promise<void>;
  actionLoadingId: string | null;
}

const STATUS_FLOW: OrderStatus[] = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'served',
  'billed',
];

function statusChipClasses(status: OrderStatus) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? DEFAULT_STATUS;
  return cfg.color;
}

export default function KDSOrderDetailModal({
  order,
  onClose,
  onAdvanceOrder,
  onCancelOrder,
  actionLoadingId,
}: Props) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? DEFAULT_STATUS;
  const StatusIcon = cfg.icon;
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[currentIndex + 1];
  const { dateFormatted, timeFormatted } = formatDateTime(order.createdAt);

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      setCancelError('Cancellation reason required!');
      return;
    }

    await onCancelOrder(order, cancelReason);
    setShowCancelModal(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 border-b border-zinc-800">
            <div>
              <h2 className="text-white font-bold text-lg">#{order.orderNumber}</h2>
              <p className="text-zinc-400 text-sm">
                Table {order.tableNumber || order.table?.tableNumber || '--'}
                {order.table?.floor && (
                  <span className="ml-1 text-zinc-500">· {order.table.floor} Floor</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full ${cfg.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {cfg.label}
              </span>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {order.status === 'cancelled' && order.cancellationReason && (
            <div className="mx-5 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Cancellation Reason
              </p>
              <p className="text-zinc-300 text-sm">{order.cancellationReason}</p>
            </div>
          )}

          <div className="p-5 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                Order Overview
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500 text-xs">Created</p>
                <p className="text-zinc-200 mt-0.5">
                  {dateFormatted}, {timeFormatted}
                </p>
              </div>

              <div>
                <p className="text-zinc-500 text-xs">Items</p>
                <p className="text-zinc-200 mt-0.5">{order.items.length}</p>
              </div>
            </div>
          </div>

          <div className="p-5 border-b border-zinc-800">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Order Items
            </h3>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="rounded-lg border border-zinc-800 bg-zinc-800/40 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {item.quantity}x {item.name}
                      </p>

                      {item.station && (
                        <p className="text-zinc-600 text-xs mt-0.5 capitalize">
                          {item.station}
                        </p>
                      )}

                      {item.notes && (
                        <p className="text-zinc-500 text-xs mt-1">Note: {item.notes}</p>
                      )}
                    </div>

                    <span
                      className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusChipClasses(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.notes && (
            <div className="mx-5 mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Special Instructions
              </p>
              <p className="text-zinc-300 text-sm">{order.notes}</p>
            </div>
          )}

          <div className="p-5 space-y-3">
            {order.status !== 'served' &&
              order.status !== 'cancelled' &&
              order.status !== 'billed' && (
                <div className="flex flex-col sm:flex-row gap-2">
                  {nextStatus && (
                    <button
                      onClick={() => onAdvanceOrder(order, nextStatus)}
                      disabled={actionLoadingId === order._id}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Mark as{' '}
                      {STATUS_CONFIG[nextStatus as keyof typeof STATUS_CONFIG]?.label ??
                        nextStatus}
                    </button>
                  )}

                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={actionLoadingId === order._id}
                    className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel Order
                  </button>
                </div>
              )}

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/30 rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>

              <div>
                <h3 className="text-white font-bold">Cancel Order</h3>
                <p className="text-zinc-500 text-xs">#{order.orderNumber}</p>
              </div>
            </div>

            <div>
              <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 block">
                Cancellation Reason *
              </label>

              <textarea
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  setCancelError('');
                }}
                placeholder="e.g. Customer request, Item unavailable..."
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none resize-none"
              />

              {cancelError && (
                <p className="text-red-400 text-xs mt-1">{cancelError}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {['Customer request', 'Item unavailable', 'Wrong order', 'Kitchen issue'].map((r) => (
                <button
                  key={r}
                  onClick={() => setCancelReason(r)}
                  className="text-xs px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-full transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setCancelError('');
                }}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
              >
                Go Back
              </button>

              <button
                onClick={handleCancelConfirm}
                disabled={actionLoadingId === order._id}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {actionLoadingId === order._id ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}