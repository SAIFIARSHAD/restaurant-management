import {
  AlertCircle,
  CheckCircle2,
  ChefHat,
  Clock3,
  ClipboardList,
  LoaderCircle,
  Receipt,
  RefreshCw,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicOrderStatus } from '../services/customerService';
import type { PublicOrderStatusData } from '../types/customer';

export default function CustomerOrderStatusPage() {
  const { orderToken = '' } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [statusData, setStatusData] = useState<PublicOrderStatusData | null>(null);

  const fetchStatus = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!orderToken) {
        setError('Order token is missing.');
        setIsLoading(false);
        return;
      }

      try {
        if (silent) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setError('');
        const response = await getPublicOrderStatus(orderToken);
        setStatusData(response.data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch order status.';
        setError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [orderToken]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchStatus();
    }, 0);

    const interval = window.setInterval(() => {
      fetchStatus({ silent: true });
    }, 10000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [fetchStatus]);

  const currency = statusData?.restaurant.currency || 'INR';

  const timelineSteps = useMemo(() => {
    if (!statusData) return [];

    const timeline = statusData.timeline;

    return [
      {
        key: 'pending',
        label: 'Order received',
        done:
          timeline.isPending ||
          timeline.isAccepted ||
          timeline.isPreparing ||
          timeline.isReady ||
          timeline.isServed ||
          timeline.isCompleted,
      },
      {
        key: 'accepted',
        label: 'Accepted by restaurant',
        done:
          timeline.isAccepted ||
          timeline.isPreparing ||
          timeline.isReady ||
          timeline.isServed ||
          timeline.isCompleted,
      },
      {
        key: 'preparing',
        label: 'Preparing',
        done:
          timeline.isPreparing ||
          timeline.isReady ||
          timeline.isServed ||
          timeline.isCompleted,
      },
      {
        key: 'ready',
        label: 'Ready',
        done:
          timeline.isReady || timeline.isServed || timeline.isCompleted,
      },
      {
        key: 'served',
        label: 'Served',
        done: timeline.isServed || timeline.isCompleted,
      },
    ];
  }, [statusData]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Loading order status...</span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error || !statusData) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Unable to load order status
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              {error || 'Order status data is unavailable.'}
            </p>
          </div>
        </section>
      </main>
    );
  }

  const { order, restaurant, table, timeline } = statusData;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-700">
                Live Order Tracking
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    {restaurant.name}
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Order {order.orderNumber} • Table {table.tableNumber}
                    {table.floor ? ` • ${table.floor}` : ''}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => fetchStatus({ silent: true })}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Current Status</p>
            <p className="mt-2 text-2xl font-semibold capitalize text-slate-900">
              {order.status}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Payment</p>
            <p className="mt-2 text-2xl font-semibold capitalize text-slate-900">
              {order.paymentStatus || 'unpaid'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {currency} {order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Order progress</h2>
              <p className="mt-1 text-sm text-slate-500">
                Auto-refresh runs every 10 seconds.
              </p>
            </div>
          </div>

          {timeline.isCancelled ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              This order has been cancelled by the restaurant.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {timelineSteps.map((step, index) => (
                <div key={step.key} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        step.done
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {step.done ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Clock3 className="h-5 w-5" />
                      )}
                    </div>
                    {index !== timelineSteps.length - 1 ? (
                      <div
                        className={`mt-2 h-8 w-0.5 ${
                          step.done ? 'bg-emerald-300' : 'bg-slate-200'
                        }`}
                      />
                    ) : null}
                  </div>

                  <div className="pt-1">
                    <p className="text-base font-semibold text-slate-900">{step.label}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {step.done ? 'Completed' : 'Waiting'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <ClipboardList className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Ordered items</h2>
            </div>

            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {currency} {item.price} × {item.quantity}
                    </p>
                    {item.notes ? (
                      <p className="mt-2 text-xs text-slate-500">Note: {item.notes}</p>
                    ) : null}
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {currency} {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Receipt className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Bill summary</h2>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{currency} {order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span>{currency} {order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Discount</span>
                  <span>{currency} {order.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span>{currency} {order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <UtensilsCrossed className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Order details</h2>
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-900">Order No:</span> {order.orderNumber}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Table:</span> {table.tableNumber}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Payment:</span> {order.paymentStatus}
                </p>
                {order.notes ? (
                  <p>
                    <span className="font-semibold text-slate-900">Notes:</span> {order.notes}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}