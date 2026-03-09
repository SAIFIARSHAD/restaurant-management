import { Router } from 'express';
import {
  exportSalesExcel,
  exportGSTPDF,
  exportTopItemsExcel,
} from '../controllers/exportController';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.use(protect);
router.use(requireRole('admin', 'manager'));

router.get('/sales/excel', exportSalesExcel);
router.get('/gst/pdf', exportGSTPDF);
router.get('/top-items/excel', exportTopItemsExcel);

export default router;
