import express from 'express';
import {
  createRecipe,
  getRecipes,
  getRecipeByMenuItem,
  updateRecipe,
  deleteRecipe
} from '../controllers/recipeController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, createRecipe);
router.get('/', protect, getRecipes);
router.get('/menuitem/:menuItemId', protect, getRecipeByMenuItem);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);

export default router;
