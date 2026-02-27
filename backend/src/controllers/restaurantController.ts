import { Request, Response } from 'express';
import Restaurant from '../models/Restaurant';

// @POST /api/restaurants
export const createRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, address, cuisine, settings } = req.body;

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const existing = await Restaurant.findOne({ slug });
    if (existing) {
      res.status(400).json({ success: false, message: 'Restaurant name already taken' });
      return;
    }

    const restaurant = await Restaurant.create({
      name,
      slug,
      owner: (req as any).user.id,
      email,
      phone,
      address,
      cuisine,
      settings,
    });

    res.status(201).json({ success: true, message: 'Restaurant created!', restaurant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/restaurants/my
export const getMyRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findOne({ owner: (req as any).user.id });
    if (!restaurant) {
      res.status(404).json({ success: false, message: 'No restaurant found' });
      return;
    }
    res.status(200).json({ success: true, restaurant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/restaurants/:id
export const updateRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findOneAndUpdate(
      { _id: req.params.id, owner: (req as any).user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      res.status(404).json({ success: false, message: 'Restaurant not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Restaurant updated!', restaurant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
