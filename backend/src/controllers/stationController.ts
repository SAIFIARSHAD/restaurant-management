import { Request, Response } from 'express';
import Station from '../models/Station';
import Order from '../models/Order';

const getRestaurantId = (req: Request): string | null => {
  const user = (req as any).user;
  const restaurant = user?.restaurant;
  if (!restaurant) return null;
  if (restaurant['$oid']) return restaurant['$oid'];
  if (restaurant._id) return restaurant._id.toString();
  return restaurant.toString();
};

// POST /api/stations
export const createStation = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) {
      res.status(400).json({ success: false, message: 'Restaurant not found' });
      return;
    }

    const { name, stationType, color } = req.body;

    const station = await Station.create({
      name,
      stationType,
      color: color || '#6366f1',
      restaurant: restaurantId,
    });

    res.status(201).json({ success: true, message: 'Station created!', station });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/stations
export const getStations = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = getRestaurantId(req);

    const stations = await Station.find({
      restaurant: restaurantId,
      isActive: true,
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, stations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/stations/orders/:stationType
export const getStationOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = getRestaurantId(req);
    const { stationType } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      restaurant: restaurantId,
      status: { $in: ['pending', 'accepted', 'preparing'] },
      createdAt: { $gte: today },
    })
      .populate('table', 'tableNumber floor')
      .sort({ createdAt: 1 });

    // Filter only items belonging to this station
    const stationOrders = orders
      .map((order) => {
        const stationItems = order.items.filter(
          (item: any) => item.station === stationType
        );
        if (stationItems.length === 0) return null;

        return {
          _id: order._id,
          orderNumber: order.orderNumber,
          tableNumber: order.tableNumber,
          status: order.status,
          notes: order.notes,
          createdAt: (order as any).createdAt,
          items: stationItems,
        };
      })
      .filter(Boolean);

    res.status(200).json({ success: true, orders: stationOrders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/stations/:id
export const updateStation = async (req: Request, res: Response): Promise<void> => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!station) {
      res.status(404).json({ success: false, message: 'Station not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Station updated!', station });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/stations/:id
export const deleteStation = async (req: Request, res: Response): Promise<void> => {
  try {
    await Station.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Station deleted!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};