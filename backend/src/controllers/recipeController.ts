import { Request, Response } from 'express';
import Recipe from '../models/Recipe';

const getRestaurantId = (req: Request) => {
  const user = (req as any).user;
  const restaurant = user?.restaurant;
  if (!restaurant) return null;
  if (restaurant['$oid']) return restaurant['$oid'];
  if (restaurant._id) return restaurant._id.toString();
  return restaurant.toString();
};

// Create Recipe
export const createRecipe = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant not found' });
    }

    const { menuItem, ingredients } = req.body;

    // Check duplicate recipe
    const existing = await Recipe.findOne({ menuItem, restaurant: restaurantId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Recipe already exists for this item. Use update instead.'
      });
    }

    const recipe = await Recipe.create({
      restaurant: restaurantId,
      menuItem,
      ingredients
    });

    const populated = await recipe.populate([
      { path: 'menuItem', select: 'name price' },
      { path: 'ingredients.rawMaterial', select: 'name unit currentStock' }
    ]);

    res.status(201).json({ success: true, message: 'Recipe created!', recipe: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Recipes
export const getRecipes = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);

    const recipes = await Recipe.find({ restaurant: restaurantId, isActive: true })
      .populate('menuItem', 'name price image')
      .populate('ingredients.rawMaterial', 'name unit currentStock unitCost');

    res.json({ success: true, count: recipes.length, recipes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Recipe by MenuItem
export const getRecipeByMenuItem = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);

    const recipe = await Recipe.findOne({
      menuItem: req.params.menuItemId,
      restaurant: restaurantId
    })
      .populate('menuItem', 'name price')
      .populate('ingredients.rawMaterial', 'name unit currentStock');

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    res.json({ success: true, recipe });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Recipe
export const updateRecipe = async (req: Request, res: Response) => {
  try {
    const { ingredients } = req.body;

    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { ingredients },
      { new: true }
    )
      .populate('menuItem', 'name price')
      .populate('ingredients.rawMaterial', 'name unit currentStock');

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    res.json({ success: true, message: 'Recipe updated!', recipe });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Recipe
export const deleteRecipe = async (req: Request, res: Response) => {
  try {
    await Recipe.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Recipe deleted!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
