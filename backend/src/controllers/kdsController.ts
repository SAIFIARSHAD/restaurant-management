import { Request, Response } from 'express';
import Order from '../models/Order';

export const getKitchenOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const orders = await Order.find({
      restaurant: req.user.restaurantId,
      status: { $in: ['pending', 'preparing'] }
    })
      .populate('table', 'tableNumber floor')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateKitchenOrderStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { status } = req.body;
    const validStatuses = ['preparing', 'ready', 'served'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Use: preparing, ready, served'
      });
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        restaurant: req.user.restaurantId
      },
      { status },
      { new: true }
    ).populate('table', 'tableNumber floor');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(req.user.restaurantId.toString()).emit('orderStatusUpdated', {
        orderId: order._id,
        status: order.status,
        tableNumber: order.tableNumber
      });
    }

    res.json({ success: true, message: 'Kitchen status updated!', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCompletedOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      restaurant: req.user.restaurantId,
      status: 'served',
      createdAt: { $gte: today }
    })
      .populate('table', 'tableNumber')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
