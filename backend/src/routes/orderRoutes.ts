import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePayment
} from '../controllers/orderController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // routes protected

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/payment', updatePayment);

export default router;
