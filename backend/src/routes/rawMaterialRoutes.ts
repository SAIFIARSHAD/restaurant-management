import express from 'express';
import {
  createRawMaterial,
  getRawMaterials,
  getRawMaterialById,
  updateRawMaterial,
  updateStock,
  deleteRawMaterial
} from '../controllers/rawMaterialController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, createRawMaterial);
router.get('/', protect, getRawMaterials);
router.get('/:id', protect, getRawMaterialById);
router.put('/:id', protect, updateRawMaterial);
router.patch('/:id/stock', protect, updateStock);
router.delete('/:id', protect, deleteRawMaterial);

export default router;
