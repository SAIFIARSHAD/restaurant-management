import { Router } from 'express';
import {
  getKitchenOrders,
  updateKitchenOrderStatus,
  getCompletedOrders,
  updateKitchenItemStatus,
} from '../controllers/kdsController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Active orders for KDS board (optional ?station= filter)
router.get(
  '/orders',
  protect,
  authorize('admin', 'kitchen'),
  getKitchenOrders
);

// Today's completed orders (optional ?station= filter)
router.get(
  '/orders/completed',
  protect,
  authorize('admin', 'kitchen'),
  getCompletedOrders
);

// Full order-level status update from KDS
router.patch(
  '/orders/:id/status',
  protect,
  authorize('admin', 'kitchen'),
  updateKitchenOrderStatus
);

// ← NEW: Item-level status update — multi-station KDS core action
router.patch(
  '/orders/:orderId/items/:itemId/status',
  protect,
  authorize('admin', 'kitchen'),
  updateKitchenItemStatus
);

export default router;