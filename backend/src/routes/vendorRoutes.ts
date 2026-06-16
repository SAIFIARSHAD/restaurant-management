import express from 'express';
import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  getLowStockWithVendors
} from '../controllers/vendorController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, createVendor);
router.get('/', protect, getVendors);
router.get('/low-stock', protect, getLowStockWithVendors);  
router.get('/:id', protect, getVendorById);
router.put('/:id', protect, updateVendor);
router.delete('/:id', protect, deleteVendor);

export default router;
