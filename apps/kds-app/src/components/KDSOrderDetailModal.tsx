import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { IOrder, OrderStatus } from '../types/kds.types';
import {
  STATUS_CONFIG,
  DEFAULT_STATUS,
  formatDateTime,
  normalizeStatus,
  getSafeStatusConfig,
} from './KDSOrderCard';

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

function statusChipClasses(status: unknown) {
  const cfg = getSafeStatusConfig(status);
  return cfg.color;
}

function getPrimaryActionLabel(status: OrderStatus): string | null {
  if (status === 'pending') return 'Accept Order';
  if (status === 'accepted') return 'Start Cooking';
  if (status === 'preparing') return 'Mark Ready';
  if (status === 'ready') return 'Serve Order';
  return null;
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

  const safeOrderStatus = normalizeStatus(order.status);
  const cfg = getSafeStatusConfig(order.status) ?? DEFAULT_STATUS;
  const StatusIcon = cfg.icon;
  const currentIndex = STATUS_FLOW.indexOf(safeOrderStatus);
  const nextStatus = currentIndex >= 0 ? STATUS_FLOW[currentIndex + 1] : 'accepted';
  const primaryActionLabel = getPrimaryActionLabel(safeOrderStatus);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900">
          <div className="flex flex-col gap-3 border-b border-zinc-800 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-lg font-bold text-white">#{order.orderNumber}</h2>
              <p className="text-sm text-zinc-400">
                Table {order.tableNumber || order.table?.tableNumber || '--'}
                {order.table?.floor && (
                  <span className="ml-1 text-zinc-500">· {order.table.floor} Floor</span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${cfg.color}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {cfg.label}
              </span>

              <button
                onClick={onClose}
                className="rounded-lg bg-zinc-800 p-1.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {safeOrderStatus === 'cancelled' && order.cancellationReason && (
            <div className="mx-5 mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-400">
                Cancellation Reason
              </p>
              <p className="text-sm text-zinc-300">{order.cancellationReason}</p>
            </div>
          )}

          <div className="border-b border-zinc-800 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Order Overview
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500">Created</p>
                <p className="mt-0.5 text-zinc-200">
                  {dateFormatted}, {timeFormatted}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">Items</p>
                <p className="mt-0.5 text-zinc-200">{order.items.length}</p>
              </div>
            </div>
          </div>

          <div className="border-b border-zinc-800 p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Order Items
            </h3>

            <div className="space-y-3">
              {order.items.map((item) => {
                const safeItemStatus = normalizeStatus(item.status);

                return (
                  <div
                    key={item._id}
                    className="rounded-lg border border-zinc-800 bg-zinc-800/40 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {item.quantity}x {item.name}
                        </p>

                        {item.station && (
                          <p className="mt-0.5 text-xs capitalize text-zinc-600">
                            {item.station}
                          </p>
                        )}

                        {item.notes && (
                          <p className="mt-1 text-xs text-zinc-500">Note: {item.notes}</p>
                        )}
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusChipClasses(
                          safeItemStatus
                        )}`}
                      >
                        {STATUS_CONFIG[safeItemStatus]?.label ?? 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {order.notes && (
            <div className="mx-5 mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
                Special Instructions
              </p>
              <p className="text-sm text-zinc-300">{order.notes}</p>
            </div>
          )}

          <div className="space-y-3 p-5">
            {safeOrderStatus !== 'served' &&
              safeOrderStatus !== 'cancelled' &&
              safeOrderStatus !== 'billed' && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  {nextStatus && primaryActionLabel && (
                    <button
                      onClick={() => onAdvanceOrder(order, nextStatus)}
                      disabled={actionLoadingId === order._id}
                      className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                    >
                      {primaryActionLabel}
                    </button>
                  )}

                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={actionLoadingId === order._id}
                    className="rounded-lg bg-red-500/20 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
                  >
                    Cancel Order
                  </button>
                </div>
              )}

            <button
              onClick={onClose}
              className="w-full rounded-lg bg-zinc-800 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-red-500/30 bg-zinc-900 p-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="rounded-lg bg-red-500/20 p-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>

              <div>
                <h3 className="font-bold text-white">Cancel Order</h3>
                <p className="text-xs text-zinc-500">#{order.orderNumber}</p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
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
                className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none"
              />

              {cancelError && <p className="mt-1 text-xs text-red-400">{cancelError}</p>}
            </div>

            <div className="flex flex-wrap gap-2">
              {['Customer request', 'Item unavailable', 'Wrong order', 'Kitchen issue'].map(
                (r) => (
                  <button
                    key={r}
                    onClick={() => setCancelReason(r)}
                    className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-700"
                  >
                    {r}
                  </button>
                )
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setCancelError('');
                }}
                className="flex-1 rounded-lg bg-zinc-800 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
              >
                Go Back
              </button>

              <button
                onClick={handleCancelConfirm}
                disabled={actionLoadingId === order._id}
                className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
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