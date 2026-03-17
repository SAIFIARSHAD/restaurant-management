import { Router } from 'express';
import { upload as cloudinaryUpload } from '../middleware/multerConfig'; 
import {
  createCategory, getCategories, updateCategory, deleteCategory,
  createItem, getItems, updateItem, deleteItem, toggleAvailability
} from '../controllers/MenuController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// CATEGORY ROUTES (no file upload)
router.post('/categories', protect, authorize('admin', 'superadmin', 'manager'), createCategory);
router.get('/categories/:restaurantId', getCategories);
router.put('/categories/:id', protect, authorize('admin', 'superadmin', 'manager'), updateCategory);
router.delete('/categories/:id', protect, authorize('admin', 'superadmin'), deleteCategory);

// ITEM ROUTES (Cloudinary upload)
router.post('/items', protect, authorize('admin', 'superadmin', 'manager'), cloudinaryUpload.single('image'), createItem);
router.get('/items/:restaurantId', getItems);
router.put('/items/:id/toggle', protect, authorize('admin', 'superadmin', 'manager'), toggleAvailability);
router.put('/items/:id', protect, authorize('admin', 'superadmin', 'manager'), cloudinaryUpload.single('image'), updateItem);
router.delete('/items/:id', protect, authorize('admin', 'superadmin'), deleteItem);

export default router;
