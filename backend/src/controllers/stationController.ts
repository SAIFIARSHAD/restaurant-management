import { Request, Response } from 'express';
import Order from '../models/Order';
import MenuItem from '../models/MenuItem';

const getRestaurantId = (req: Request) => {
  const user = (req as any).user;
  const restaurant = user?.restaurant;
  if (!restaurant) return null;
  if (restaurant['$oid']) return restaurant['$oid'];
  if (restaurant._id) return restaurant._id.toString();
  return restaurant.toString();
};

// Create Station (MenuItem assign station)
export const createStation = async (req: Request, res: Response) => {
  try {
    const { menuItemId, station } = req.body;

    const menuItem = await MenuItem.findByIdAndUpdate(
      menuItemId,
      { station },
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'MenuItem not found' });
    }

    res.json({ success: true, message: `Station '${station}' assigned!`, menuItem });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Stations (distinct stations in menu)
export const getStations = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);

    const stations = await MenuItem.distinct('station', {
      restaurant: restaurantId,
      station: { $ne: null }
    });

    res.json({ success: true, stations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Orders By Station Type
export const getStationOrders = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { stationType } = req.params;
    const { status } = req.query;

    const filter: any = {
      restaurant: restaurantId,
      'items.station': stationType,
      status: { $nin: ['served', 'cancelled'] } // default active orders
    };

    if (status) filter.status = status; 

    const orders = await Order.find(filter)
      .populate('table', 'tableNumber floor')
      .sort({ createdAt: 1 }); // Older order first

   
    const filteredOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      status: order.status,
      notes: order.notes,
      createdAt: (order as any).createdAt,
      items: order.items.filter(
        (item: any) => item.station === stationType
      )
    }));

    res.json({
      success: true,
      stationType,
      count: filteredOrders.length,
      orders: filteredOrders
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Station (Change MenuItem station)
export const updateStation = async (req: Request, res: Response) => {
  try {
    const { station } = req.body;

    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { station },
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'MenuItem not found' });
    }

    res.json({ success: true, message: 'Station updated!', menuItem });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Station (Remove station field)
export const deleteStation = async (req: Request, res: Response) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { $unset: { station: '' } },
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'MenuItem not found' });
    }

    res.json({ success: true, message: 'Station removed!', menuItem });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
