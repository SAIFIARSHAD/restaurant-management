import { Router } from 'express';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  createItem,
  getItems,
  updateItem,
  deleteItem,
} from '../controllers/menuController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

//  CATEGORY ROUTES 
router.post('/categories', protect, authorize('admin', 'superadmin', 'manager'), createCategory);
router.get('/categories/:restaurantId', getCategories);
router.put('/categories/:id', protect, authorize('admin', 'superadmin', 'manager'), updateCategory);
router.delete('/categories/:id', protect, authorize('admin', 'superadmin'), deleteCategory);

// ITEM ROUTES 
router.post('/items', protect, authorize('admin', 'superadmin', 'manager'), createItem);
router.get('/items/:restaurantId', getItems);
router.put('/items/:id', protect, authorize('admin', 'superadmin', 'manager'), updateItem);
router.delete('/items/:id', protect, authorize('admin', 'superadmin'), deleteItem);

export default router;
