import { Router } from 'express';
import {
  generateBill,
  getBill,
  getAllBills,
  markBillPaid,
  downloadBillPDF,
} from '../controllers/billController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Generate Bill (by order)
router.post('/generate', protect, authorize('admin', 'cashier'), generateBill);

// Show All Bills
router.get('/', protect, authorize('admin', 'cashier'), getAllBills);

// Download Bill PDF  
router.get('/:id/pdf', protect, authorize('admin', 'cashier'), downloadBillPDF);

// Show Single Bill
router.get('/:id', protect, authorize('admin', 'cashier'), getBill);

// Payment Mark as Paid
router.patch('/:id/pay', protect, authorize('admin', 'cashier'), markBillPaid);

export default router;
