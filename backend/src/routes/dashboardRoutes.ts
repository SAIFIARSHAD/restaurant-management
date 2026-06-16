import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.use(protect);
router.use(requireRole('admin', 'manager'));
router.get('/', getDashboardData);

export default router;