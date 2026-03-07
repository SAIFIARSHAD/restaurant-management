import { Request, Response } from 'express';
import Vendor from '../models/Vendor';
import RawMaterial from '../models/RawMaterial';

const getRestaurantId = (req: Request) => {
  const user = (req as any).user;
  const restaurant = user?.restaurant;
  if (!restaurant) return null;
  if (restaurant['$oid']) return restaurant['$oid'];
  if (restaurant._id) return restaurant._id.toString();
  return restaurant.toString();
};

// Create Vendor
export const createVendor = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant not found' });
    }

    const { name, contactPerson, phone, email, address, materials } = req.body;

    const vendor = await Vendor.create({
      restaurant: restaurantId,
      name,
      contactPerson,
      phone,
      email,
      address,
      materials: materials || []
    });

    res.status(201).json({ success: true, message: 'Vendor created!', vendor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Vendors
export const getVendors = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);

    const vendors = await Vendor.find({ restaurant: restaurantId, isActive: true })
      .populate('materials', 'name unit currentStock')
      .sort({ name: 1 });

    res.json({ success: true, count: vendors.length, vendors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Vendor
export const getVendorById = async (req: Request, res: Response) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('materials', 'name unit currentStock minThreshold');

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    res.json({ success: true, vendor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Vendor
export const updateVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    res.json({ success: true, message: 'Vendor updated!', vendor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Vendor (soft delete)
export const deleteVendor = async (req: Request, res: Response) => {
  try {
    await Vendor.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Vendor deleted!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Low Stock Materials with Vendor Info
export const getLowStockWithVendors = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);

    // Find Low stock materials
    const lowStockMaterials = await RawMaterial.find({
      restaurant: restaurantId,
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minThreshold'] }
    });

    
    const result = await Promise.all(
      lowStockMaterials.map(async (material) => {
        const vendor = await Vendor.findOne({
          restaurant: restaurantId,
          materials: material._id,
          isActive: true
        });

        return {
          material: {
            _id: material._id,
            name: material.name,
            currentStock: material.currentStock,
            minThreshold: material.minThreshold,
            unit: material.unit
          },
          vendor: vendor ? {
            _id: vendor._id,
            name: vendor.name,
            phone: vendor.phone,
            contactPerson: vendor.contactPerson
          } : null
        };
      })
    );

    res.json({
      success: true,
      count: result.length,
      lowStockItems: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
