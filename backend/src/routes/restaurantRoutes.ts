import { Router } from 'express';
import {
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
} from '../controllers/restaurantController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.post('/', protect, authorize('admin', 'superadmin'), createRestaurant);
router.get('/my', protect, getMyRestaurant);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateRestaurant);

export default router;
