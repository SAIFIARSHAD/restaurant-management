import { Router } from 'express';
import { createOrder, verifyPayment, getAllPayments } from '../controllers/paymentController';
import { protect } from '../middleware/auth'; 

const router = Router();

// POST /api/payments/create-order
router.post('/create-order', protect, createOrder);

// POST /api/payments/verify
router.post('/verify', protect, verifyPayment);

// GET /api/payments 
router.get('/', protect, getAllPayments);

export default router;
