import { Router } from 'express';
import {
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
} from '../controllers/restaurantController';
import { protect, authorize } from '../middleware/auth';
import { updatePayrollSettings } from '../controllers/restaurantController';


const router = Router();

router.post('/', protect, authorize('admin', 'superadmin'), createRestaurant);
router.get('/my', protect, getMyRestaurant);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateRestaurant);
router.patch('/payroll-settings', protect, authorize('admin'), updatePayrollSettings);

export default router;
