import { Request, Response } from 'express';
import RawMaterial from '../models/RawMaterial';

const getRestaurantId = (req: Request) => {
  const user = (req as any).user;
  const restaurant = user?.restaurant;
  if (!restaurant) return null;
  if (restaurant['$oid']) return restaurant['$oid'];
  if (restaurant._id) return restaurant._id.toString();
  return restaurant.toString();
};
import RawMaterialLog from '../models/RawMaterialLog';

// Create Raw Material
export const createRawMaterial = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant not found' });
    }

    const { name, unit, currentStock, minThreshold, unitCost, supplier } = req.body;

    const material = await RawMaterial.create({
      restaurant: restaurantId,
      name,
      unit,
      currentStock,
      minThreshold,
      unitCost,
      supplier
    });

    res.status(201).json({ success: true, message: 'Raw material created!', material });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Raw Materials
export const getRawMaterials = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { lowStock } = req.query;

    const filter: any = { restaurant: restaurantId, isActive: true };

    // Low stock filter
    if (lowStock === 'true') {
      filter.$expr = { $lte: ['$currentStock', '$minThreshold'] };
    }

    const materials = await RawMaterial.find(filter).sort({ name: 1 });

    res.json({ success: true, count: materials.length, materials });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Raw Material
export const getRawMaterialById = async (req: Request, res: Response) => {
  try {
    const material = await RawMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Raw material not found' });
    }
    res.json({ success: true, material });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Raw Material
export const updateRawMaterial = async (req: Request, res: Response) => {
  try {
    const material = await RawMaterial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!material) {
      return res.status(404).json({ success: false, message: 'Raw material not found' });
    }
    res.json({ success: true, message: 'Raw material updated!', material });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// updateStock function mein — har case ke baad log save karo:
export const updateStock = async (req: Request, res: Response) => {
  try {
    const { quantity, type, reason } = req.body;
    const restaurantId = getRestaurantId(req);
    const userId = (req as any).user?.id;

    const material = await RawMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Raw material not found' });
    }

    const previousStock = material.currentStock; 
    let message = '';

    switch (type) {
      case 'add':
        material.currentStock += quantity;
        material.lastPurchaseDate = new Date();
        message = 'Stock added successfully';
        break;

      case 'remove':
        if (material.currentStock < quantity) {
          return res.status(400).json({ success: false, message: 'Insufficient stock!' });
        }
        material.currentStock -= quantity;
        message = 'Stock removed successfully';
        break;

      case 'wastage':
        material.currentStock = Math.max(0, material.currentStock - quantity);
        message = 'Wastage recorded successfully';
        break;

      case 'expiry':
        material.currentStock = Math.max(0, material.currentStock - quantity);
        message = 'Expiry deduction recorded successfully';
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid type! Allowed: add | remove | wastage | expiry'
        });
    }

    await material.save();

    
    await RawMaterialLog.create({
      restaurant: restaurantId,
      rawMaterial: material._id,
      type,
      quantity,
      unit: material.unit,
      previousStock,
      newStock: material.currentStock,
      reason: reason || '',
      createdBy: userId || null,
    });

    res.json({ success: true, message, material, reason });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Raw Material (soft delete)
export const deleteRawMaterial = async (req: Request, res: Response) => {
  try {
    await RawMaterial.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Raw material deleted!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
