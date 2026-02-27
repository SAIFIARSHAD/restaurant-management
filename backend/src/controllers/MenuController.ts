import { Request, Response } from 'express';
import MenuCategory from '../models/MenuCategory';
import MenuItem from '../models/MenuItem';


// @POST /api/menu/categories
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, image, sortOrder, restaurantId } = req.body;

    const category = await MenuCategory.create({
      name, description, image, sortOrder,
      restaurant: restaurantId,
    });

    res.status(201).json({ success: true, message: 'Category created!', category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/menu/categories/ restaurantId
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await MenuCategory.find({
      restaurant: req.params.restaurantId,
      isActive: true,
    }).sort({ sortOrder: 1 });

    res.status(200).json({ success: true, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/menu/categories/ id
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await MenuCategory.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Category updated!', category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @DELETE /api/menu/categories/ id
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    await MenuCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ITEM CONTROLLERS

// @POST /api/menu/items
export const createItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, message: 'Item created!', item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/menu/items/:restaurantId
export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await MenuItem.find({
      restaurant: req.params.restaurantId,
      isAvailable: true,
    }).populate('category', 'name').sort({ sortOrder: 1 });

    res.status(200).json({ success: true, items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/menu/items/:id
export const updateItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Item updated!', item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @DELETE /api/menu/items/:id
export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Item deleted!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
