import { Request, Response } from 'express';
import RawMaterialLog from '../models/RawMaterialLog';

const getRestaurantId = (req: Request) => {
  const user = (req as any).user;
  const restaurant = user?.restaurant;
  if (!restaurant) return null;
  if (restaurant['$oid']) return restaurant['$oid'];
  if (restaurant._id) return restaurant._id.toString();
  return restaurant.toString();
};

// Get All Logs — filter by type, material, date
export const getLogs = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { type, materialId, startDate, endDate, limit = 50, page = 1 } = req.query;

    const filter: any = { restaurant: restaurantId };

    // Filter by type
    if (type) filter.type = type;

    // Filter by specific material
    if (materialId) filter.rawMaterial = materialId;

    // Filter by date range
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate)   filter.createdAt.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await RawMaterialLog.countDocuments(filter);

    const logs = await RawMaterialLog.find(filter)
      .populate('rawMaterial', 'name unit')
      .populate('createdBy', 'name role')
      .populate('orderId', 'orderNumber tableNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: logs.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      logs
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Logs by Material ID
export const getLogsByMaterial = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { materialId } = req.params;

    const logs = await RawMaterialLog.find({
      restaurant: restaurantId,
      rawMaterial: materialId
    })
      .populate('rawMaterial', 'name unit')
      .populate('createdBy', 'name role')
      .populate('orderId', 'orderNumber tableNumber')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, count: logs.length, logs });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Log Summary — for dashboard
export const getLogSummary = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);

    const summary = await RawMaterialLog.aggregate([
      { $match: { restaurant: new (require('mongoose').Types.ObjectId)(restaurantId) } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    res.json({ success: true, summary });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
