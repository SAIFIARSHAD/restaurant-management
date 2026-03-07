// src/routes/analyticsRoutes.ts

import { Router } from 'express';
import {
  getDashboardStats,
  getHourlySales,
  getWeeklyRevenue,
  getCategorySales,
  getTableTurnover,
} from '../controllers/analyticsController';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.use(protect);
router.use(requireRole('admin', 'manager'));

router.get('/dashboard', getDashboardStats);
router.get('/hourly-sales', getHourlySales);
router.get('/weekly-revenue', getWeeklyRevenue);
router.get('/category-sales', getCategorySales);
router.get('/table-turnover', getTableTurnover);

export default router;
