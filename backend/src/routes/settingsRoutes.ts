import { Router } from 'express';
import { protect }      from '../middleware/auth';
import { requireRole }  from '../middleware/roleMiddleware';
import {
  getPayrollSettings,
  updatePayrollSettings,
  updateOvertimeEligibility,
  createShiftTemplate,
  updateShiftTemplate,
  deleteShiftTemplate,
  assignShiftTemplate,
} from '../controllers/settingsController';

const router = Router();
router.use(protect);


router.get  ('/payroll',                getPayrollSettings);
router.put  ('/payroll', requireRole('admin'), updatePayrollSettings);


router.patch('/overtime-eligibility', requireRole('admin', 'manager'), updateOvertimeEligibility);


router.post  ('/shift-templates',                requireRole('admin'), createShiftTemplate);
router.put   ('/shift-templates/:templateId',    requireRole('admin'), updateShiftTemplate);
router.delete('/shift-templates/:templateId',    requireRole('admin'), deleteShiftTemplate);


router.patch ('/shift-templates/assign',         requireRole('admin', 'manager'), assignShiftTemplate);

export default router;
