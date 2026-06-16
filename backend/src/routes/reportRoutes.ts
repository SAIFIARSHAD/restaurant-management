import express from 'express';
import {
  getSalesSummary,
  getRevenueReport,
  getGSTReport,
  getTopItems,
  getPaymentReport,
  getDailySummary
} from '../controllers/reportController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/sales', protect, getSalesSummary);
router.get('/revenue', protect, getRevenueReport);
router.get('/gst', protect, getGSTReport);
router.get('/top-items', protect, getTopItems);
router.get('/payments', protect, getPaymentReport);
router.get('/daily', protect, getDailySummary);

export default router;
