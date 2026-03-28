import { X, Clock, UtensilsCrossed, ChefHat, Bell, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { Order } from '../../hooks/useOrders';
import { useUpdateOrderStatus, useUpdatePayment } from '../../hooks/useOrders';

interface Props {
  order: Order;
  onClose: () => void;
}

const STATUS_FLOW: Order['status'][] = ['pending', 'accepted', 'preparing', 'ready', 'served', 'billed'];

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Clock },
  accepted:  { label: 'Accepted',  color: 'text-blue-400',   bg: 'bg-blue-500/20',   icon: CheckCircle2 },
  preparing: { label: 'Preparing', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: ChefHat },
  ready:     { label: 'Ready',     color: 'text-green-400',  bg: 'bg-green-500/20',  icon: Bell },
  served:    { label: 'Served',    color: 'text-zinc-400',   bg: 'bg-zinc-500/20',   icon: UtensilsCrossed },
  billed:    { label: 'Billed',    color: 'text-teal-400',   bg: 'bg-teal-500/20',   icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-red-400',    bg: 'bg-red-500/20',    icon: XCircle },
};

const DEFAULT_STATUS = { label: 'Unknown', color: 'text-zinc-400', bg: 'bg-zinc-500/20', icon: Clock };

export default function OrderDetailModal({ order, onClose }: Props) {
  const statusMutation = useUpdateOrderStatus();
  const paymentMutation = useUpdatePayment();

  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[currentIndex + 1];

  const handleStatusUpdate = (status: Order['status']) => {
    statusMutation.mutate({ id: order._id, status }, {
      onSuccess: () => onClose(),
    });
  };

  
  const handleCancelConfirm = () => {
    if (!cancelReason.trim()) {
      setCancelError('Cancellation reason required!');
      return;
    }
    statusMutation.mutate(
      { id: order._id, status: 'cancelled', cancellationReason: cancelReason },
      { onSuccess: () => { setShowCancelModal(false); onClose(); } }
    );
  };

  const handlePayment = (paymentStatus: string, paymentMethod?: string) => {
    paymentMutation.mutate({ id: order._id, paymentStatus, paymentMethod }, {
      onSuccess: () => onClose(),
    });
  };

  const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? DEFAULT_STATUS;
  const StatusIcon = cfg.icon;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

          
          <div className="flex items-center justify-between p-5 border-b border-zinc-800">
            <div>
              <h2 className="text-white font-bold text-lg">#{order.orderNumber}</h2>
              <p className="text-zinc-400 text-sm">
                Table {order.tableNumber}
                {typeof order.table === 'object' && order.table?.floor && (
                  <span className="ml-1 text-zinc-500">· {order.table.floor} Floor</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {cfg.label}
              </span>
              <button onClick={onClose} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          
          {order.status === 'cancelled' && order.cancellationReason && (
            <div className="mx-5 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">Cancellation Reason</p>
              <p className="text-zinc-300 text-sm">{order.cancellationReason}</p>
            </div>
          )}

          
          <div className="p-5 border-b border-zinc-800">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{item.quantity}x {item.name}</p>
                    {item.notes && <p className="text-zinc-500 text-xs mt-0.5">Note: {item.notes}</p>}
                    {item.station && (
                      <span className="text-xs text-zinc-600 capitalize"> {item.station}</span>
                    )}
                  </div>
                  <span className="text-zinc-300 text-sm">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          
          <div className="p-5 border-b border-zinc-800 space-y-2">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">Bill Summary</h3>
            <div className="flex justify-between text-sm text-zinc-300">
              <span>Subtotal</span><span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-300">
              <span>Tax (5%)</span><span>₹{order.tax}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-400">
                <span>Discount</span><span>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800">
              <span>Total</span>
              <span className="text-orange-400">₹{order.totalAmount}</span>
            </div>
          </div>

          
          <div className="p-5 space-y-3">
            {order.status !== 'served' && order.status !== 'cancelled' && order.status !== 'billed' && (
              <div className="flex gap-2">
                {nextStatus && (
                  <button
                    onClick={() => handleStatusUpdate(nextStatus)}
                    disabled={statusMutation.isPending}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Mark as {STATUS_CONFIG[nextStatus].label}
                  </button>
                )}
        
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={statusMutation.isPending}
                  className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel Order
                </button>
              </div>
            )}

            {order.paymentStatus === 'unpaid' && order.status === 'served' && (
              <div className="space-y-2">
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Mark Payment</p>
                <div className="flex gap-2">
                  {(['cash', 'card', 'upi'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => handlePayment('paid', method)}
                      disabled={paymentMutation.isPending}
                      className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-lg text-sm font-medium capitalize transition-colors"
                    >
                      {method.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/30 rounded-2xl w-full max-w-sm p-6 space-y-4">

            <div className="flex items-center gap-3">
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
                onChange={(e) => { setCancelReason(e.target.value); setCancelError(''); }}
                placeholder="e.g. Customer request, Item unavailable..."
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none resize-none"
              />
              {cancelError && (
                <p className="text-red-400 text-xs mt-1">{cancelError}</p>
              )}
            </div>

            
            <div className="flex flex-wrap gap-2">
              {['Customer request', 'Item unavailable', 'Wrong order', 'Payment issue'].map((r) => (
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
                onClick={() => { setShowCancelModal(false); setCancelReason(''); setCancelError(''); }}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={statusMutation.isPending}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {statusMutation.isPending ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
