import { Router } from 'express';
import {
  generateBill,
  getBill,
  getAllBills,
  markBillPaid
} from '../controllers/billController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Generate Bill generate (by order)
router.post('/generate', protect, authorize('admin', 'cashier'), generateBill);

// Show All bills 
router.get('/', protect, authorize('admin', 'cashier'), getAllBills);

// Show Single bill
router.get('/:id', protect, authorize('admin', 'cashier'), getBill);

// Payment mark as paid
router.patch('/:id/pay', protect, authorize('admin', 'cashier'), markBillPaid);

export default router;
