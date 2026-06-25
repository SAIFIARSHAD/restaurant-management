import { Request, Response } from 'express';
import Order from '../models/Order';
import { io } from '../server';

const getRestaurantId = (req: Request): string | null => {
  const fromHeader = req.headers['x-restaurant-id'] as string;
  if (fromHeader) return fromHeader;
  const user = (req as any).user;
  const restaurant = user?.restaurant;
  if (!restaurant) return null;
  if (restaurant['$oid']) return restaurant['$oid'];
  if (restaurant._id) return restaurant._id.toString();
  return restaurant.toString();
};

// GET /api/kds/orders
export const getKitchenOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = getRestaurantId(req);
    const { station } = req.query;

    if (!restaurantId) {
      res.status(400).json({ success: false, message: 'Restaurant ID required' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      restaurant: restaurantId,
      status: { $in: ['pending', 'accepted', 'preparing', 'ready'] },
      createdAt: { $gte: today },
    })
      .populate('table', 'tableNumber floor')
      .sort({ createdAt: 1 });

    // Filter items by station if provided
    if (station && typeof station === 'string') {
      const filtered = orders
        .map((order) => {
          const stationItems = order.items.filter(
            (item: any) => (item.station || 'kitchen') === station
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

      res.status(200).json({ success: true, orders: filtered });
      return;
    }

    res.status(200).json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/kds/orders/:id/status
export const updateKitchenOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const restaurantId = getRestaurantId(req);

    const validStatuses = ['accepted', 'preparing', 'ready'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status from KDS' });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const payload = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      status: order.status,
    };

    // Emit to dashboard + customer app
    if (restaurantId) {
      if (status === 'accepted') {
        io.to(`waiter_${restaurantId}`).emit('order_accepted', payload);
        io.to(`restaurant_${restaurantId}`).emit('order_accepted', payload);
      }
      if (status === 'preparing') {
        io.to(`restaurant_${restaurantId}`).emit('order_preparing', payload);
      }
      if (status === 'ready') {
        io.to(`waiter_${restaurantId}`).emit('order_ready', payload);
        io.to(`restaurant_${restaurantId}`).emit('order_ready', payload);
      }
    }

    res.status(200).json({ success: true, message: 'Status updated!', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/kds/orders/completed
export const getCompletedOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = getRestaurantId(req);
    const { station } = req.query;

    if (!restaurantId) {
      res.status(400).json({ success: false, message: 'Restaurant ID required' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      restaurant: restaurantId,
      status: { $in: ['ready', 'served', 'billed'] },
      createdAt: { $gte: today },
    })
      .sort({ createdAt: -1 })
      .limit(50);

    if (station && typeof station === 'string') {
      const filtered = orders
        .map((order) => {
          const stationItems = order.items.filter(
            (item: any) => (item.station || 'kitchen') === station
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

      res.status(200).json({ success: true, orders: filtered });
      return;
    }

    res.status(200).json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};