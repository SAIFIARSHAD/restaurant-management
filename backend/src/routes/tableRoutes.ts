import { Router } from 'express';
import {
  createTable,
  getTables,
  updateTableStatus,
  deleteTable,
} from '../controllers/tableController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.post('/', protect, authorize('admin', 'superadmin', 'manager'), createTable);
router.get('/:restaurantId', getTables);
router.put('/:id/status', protect, updateTableStatus);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteTable);

export default router;
