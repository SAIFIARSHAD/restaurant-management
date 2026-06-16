import { Router } from 'express';
import { protect as authenticate, authorize as authorizeRoles } from '../middleware/auth';
import { checkRestaurantIp } from '../middleware/ipCheckMiddleware';
import {
  addEmployee, getAllEmployees, getEmployeeById,
  updateEmployee, deleteEmployee, updateRestaurantIp
} from '../controllers/employeeController';
import {
  markLogin, markLogout, heartbeat,
  getTodayAttendance, getEmployeeAttendance
} from '../controllers/attendanceController';

const router = Router();
router.use(authenticate);

// Employee CRUD (Admin/Manager only)
router.post('/', authorizeRoles('admin', 'manager'), addEmployee);
router.get('/', authorizeRoles('admin', 'manager'), getAllEmployees);
router.get('/:id', authorizeRoles('admin', 'manager'), getEmployeeById);
router.put('/:id', authorizeRoles('admin', 'manager'), updateEmployee);
router.delete('/:id', authorizeRoles('admin'), deleteEmployee);

// IP Management (Admin only)
router.put('/network/ip', authorizeRoles('admin'), updateRestaurantIp);

// Attendance (IP Check required)
router.post('/attendance/login', checkRestaurantIp, markLogin);
router.post('/attendance/logout', checkRestaurantIp, markLogout);
router.post('/attendance/heartbeat', checkRestaurantIp, heartbeat);
router.get('/attendance/today', authorizeRoles('admin', 'manager'), getTodayAttendance);
router.get('/attendance/:id', authorizeRoles('admin', 'manager'), getEmployeeAttendance);

export default router;
