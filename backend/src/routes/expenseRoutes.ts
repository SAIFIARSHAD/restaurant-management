import express from 'express';
import {
  addCategory,
  getCategories,
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getMonthlyReport,
  getProfitReport,
} from '../controllers/expenseController';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/roleMiddleware';

const router = express.Router();

router.use(protect);

// Category Routes
router.post('/categories', requireRole('admin', 'manager'), addCategory);
router.get('/categories', getCategories);

// Report Routes
router.get('/report/monthly', getMonthlyReport);
router.get('/report/profit', getProfitReport);

// Expense Routes
router.post('/', requireRole('admin', 'manager'), addExpense);
router.get('/', getExpenses);
router.put('/:id', requireRole('admin', 'manager'), updateExpense);
router.delete('/:id', requireRole('admin', 'manager'), deleteExpense);

export default router;
