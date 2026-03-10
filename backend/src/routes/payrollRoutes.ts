import express from 'express';
import {
  calculateSalary,
  getAllPayroll,
  getEmployeePayroll,
  markSalaryPaid,
  generatePayslip
} from '../controllers/payrollController';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/roleMiddleware'; 
const router = express.Router();

// All routes protected
router.use(protect);
router.use(requireRole('admin', 'manager')); 

// Payroll Routes
router.post('/calculate/:employeeId', calculateSalary);
router.get('/all', getAllPayroll);
router.get('/:employeeId', getEmployeePayroll);
router.patch('/:id/pay', markSalaryPaid);
router.get('/:id/payslip', generatePayslip);

export default router;
