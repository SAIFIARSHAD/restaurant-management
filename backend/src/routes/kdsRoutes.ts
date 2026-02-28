import { Router } from 'express';
import {
  getKitchenOrders,
  updateKitchenOrderStatus,
  getCompletedOrders
} from '../controllers/kdsController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Kitchen orders (pending + preparing)
router.get('/orders', protect, authorize('admin', 'kitchen'), getKitchenOrders);

// Kitchen status update
router.patch('/orders/:id/status', protect, authorize('admin', 'kitchen'), updateKitchenOrderStatus);

// Today completed orders
router.get('/orders/completed', protect, authorize('admin', 'kitchen'), getCompletedOrders);

export default router;
