import { Router } from 'express';
import {
  createTable,
  getTables,
  updateTable,
  updateTableStatus,
  mergeTables,
  unmergeTables,
  regenerateQR,
  deleteTable,
} from '../controllers/tableController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.post('/',                protect, authorize('admin', 'superadmin', 'manager'), createTable);
router.get('/',                 protect, getTables);                                   
router.put('/:id',              protect, authorize('admin', 'superadmin', 'manager'), updateTable);
router.patch('/:id/status',     protect, updateTableStatus);
router.post('/merge',           protect, authorize('admin', 'superadmin', 'manager'), mergeTables);
router.post('/unmerge',         protect, authorize('admin', 'superadmin', 'manager'), unmergeTables);
router.post('/:id/regenerate-qr', protect, authorize('admin', 'superadmin'), regenerateQR);
router.delete('/:id',           protect, authorize('admin', 'superadmin'), deleteTable);

export default router;
