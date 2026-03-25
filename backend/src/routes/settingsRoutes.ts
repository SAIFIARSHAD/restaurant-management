import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/roleMiddleware';
import {
  getPayrollSettings,
  updatePayrollSettings,
  updateOvertimeEligibility,
} from '../controllers/settingsController';

const router = Router();

router.use(protect);

router.get('/payroll',              getPayrollSettings);
router.put('/payroll', requireRole('admin'), updatePayrollSettings);
router.patch('/overtime-eligibility', requireRole('admin', 'manager'), updateOvertimeEligibility);

export default router;
