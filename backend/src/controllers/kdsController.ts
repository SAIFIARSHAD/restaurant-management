import { Request, Response } from 'express';
import Order from '../models/Order';
import type { IOrderItem, OrderStatus } from '../models/Order';
import { io } from '../server';
import { emitToStation } from '../socket/socketHandler';
import { recalculateOrderStatus } from './orderController';
import Recipe from '../models/Recipe';
import RawMaterial from '../models/RawMaterial';
import RawMaterialLog from '../models/RawMaterialLog';
import { calculateDeduction } from '../utils/unitConverter';

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

const getTodayStart = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getTodayEnd = (): Date => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};

const buildDateFilter = (req: Request): Record<string, any> => {
  const { fromDate, toDate } = req.query;

  if (fromDate || toDate) {
    const range: Record<string, Date> = {};

    if (fromDate && typeof fromDate === 'string') {
      const from = new Date(fromDate);
      if (!Number.isNaN(from.getTime())) {
        range.$gte = from;
      }
    }

    if (toDate && typeof toDate === 'string') {
      const to = new Date(toDate);
      if (!Number.isNaN(to.getTime())) {
        range.$lte = to;
      }
    }

    if (Object.keys(range).length > 0) {
      return { createdAt: range };
    }
  }

  return {
    createdAt: { $gte: getTodayStart(), $lte: getTodayEnd() },
  };
};

const deductInventoryForOrder = async (order: any, restaurantId: string) => {
  for (const item of order.items as any[]) {
    const recipe = await Recipe.findOne({
      menuItem: item.menuItem,
      isActive: true,
    });

    if (!recipe) {
      console.log(`No recipe found for menuItem: ${item.menuItem}`);
      continue;
    }

    for (const ingredient of recipe.ingredients) {
      const rawMaterial = await RawMaterial.findById(ingredient.rawMaterial);
      if (!rawMaterial) continue;

      const deductAmount = calculateDeduction(
        ingredient.quantity,
        ingredient.unit,
        rawMaterial.unit,
        item.quantity
      );

      const previousStock = rawMaterial.currentStock;

      await RawMaterial.findByIdAndUpdate(ingredient.rawMaterial, {
        $inc: { currentStock: -deductAmount },
      });

      console.log(
        `KDS stock deducted: ${rawMaterial.name} → -${deductAmount} ${rawMaterial.unit}`
      );

      const updatedMaterial = await RawMaterial.findById(ingredient.rawMaterial);

      await RawMaterialLog.create({
        restaurant: restaurantId,
        rawMaterial: ingredient.rawMaterial,
        type: 'auto_deduct',
        quantity: deductAmount,
        unit: rawMaterial.unit,
        previousStock,
        newStock: updatedMaterial?.currentStock ?? 0,
        reason: `Order #${order.orderNumber} — ${item.name} x${item.quantity}`,
        orderId: order._id,
      });

      if (
        updatedMaterial &&
        updatedMaterial.currentStock <= updatedMaterial.minThreshold
      ) {
        io.to(`restaurant_${restaurantId}`).emit('low_stock_alert', {
          materialId: updatedMaterial._id,
          name: updatedMaterial.name,
          currentStock: updatedMaterial.currentStock,
          minThreshold: updatedMaterial.minThreshold,
          unit: updatedMaterial.unit,
          message: `Low Stock! ${updatedMaterial.name} sirf ${updatedMaterial.currentStock} ${updatedMaterial.unit} bacha hai!`,
        });
      }
    }
  }
};

// GET /api/kds/orders
export const getKitchenOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = getRestaurantId(req);
    const { station } = req.query;

    if (!restaurantId) {
      res.status(400).json({ success: false, message: 'Restaurant ID required' });
      return;
    }

    const dateFilter = buildDateFilter(req);

    const orders = await Order.find({
      restaurant: restaurantId,
      status: { $in: ['pending', 'accepted', 'preparing', 'ready'] },
      ...dateFilter,
    })
      .populate('table', 'tableNumber floor')
      .sort({ createdAt: 1 });

    if (station && typeof station === 'string') {
      const filtered = orders
        .map((order) => {
          const stationItems = (order.items as any[]).filter(
            (item) => (item.station || 'kitchen') === station
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

// GET /api/kds/orders/completed
export const getCompletedOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = getRestaurantId(req);
    const { station } = req.query;

    if (!restaurantId) {
      res.status(400).json({ success: false, message: 'Restaurant ID required' });
      return;
    }

    const dateFilter = buildDateFilter(req);

    const orders = await Order.find({
      restaurant: restaurantId,
      status: { $in: ['ready', 'served', 'billed'] },
      ...dateFilter,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    if (station && typeof station === 'string') {
      const filtered = orders
        .map((order) => {
          const stationItems = (order.items as any[]).filter(
            (item) => (item.station || 'kitchen') === station
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
export const updateKitchenOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    const restaurantId = getRestaurantId(req);

    if (!restaurantId) {
      res.status(400).json({ success: false, message: 'Restaurant ID required' });
      return;
    }

    const validStatuses: OrderStatus[] = ['accepted', 'preparing', 'ready'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status from KDS' });
      return;
    }

    const order = await Order.findOne({
      _id: req.params.id,
      restaurant: restaurantId,
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const previousStatus = order.status;

    if (status === 'preparing' && previousStatus !== 'preparing') {
      await deductInventoryForOrder(order, restaurantId);
    }

    const itemStatusMap: Record<string, IOrderItem['status']> = {
      accepted: 'accepted',
      preparing: 'preparing',
      ready: 'ready',
    };

    order.items = (order.items as any[]).map((item) => {
      if (item.status !== 'cancelled' && item.status !== 'served') {
        item.status = itemStatusMap[status];

        if (status === 'preparing' && !item.startedAt) {
          item.startedAt = new Date();
        }

        if (status === 'ready') {
          item.readyAt = new Date();
        }
      }

      return item;
    }) as typeof order.items;

    order.status = status;
    await order.save();

    const payload = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      status: order.status,
    };

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

    io.to(`kds_${restaurantId}`).emit('order_status_updated', payload);

    const affectedStations = new Set(
      (order.items as any[]).map((item) => item.station || 'kitchen')
    );

    affectedStations.forEach((stationType) => {
      emitToStation(
        io,
        restaurantId,
        stationType,
        'station_order_status_updated',
        payload
      );
    });

    res.status(200).json({ success: true, message: 'Status updated!', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/kds/orders/:orderId/items/:itemId/status
export const updateKitchenItemStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;
    const restaurantId = getRestaurantId(req);

    if (!restaurantId) {
      res.status(400).json({ success: false, message: 'Restaurant ID required' });
      return;
    }

    const validItemStatuses: IOrderItem['status'][] = [
      'accepted',
      'preparing',
      'ready',
      'served',
      'cancelled',
    ];

    if (!validItemStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid item status' });
      return;
    }

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurantId,
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const itemIndex = (order.items as any[]).findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      res.status(404).json({ success: false, message: 'Item not found in order' });
      return;
    }

    const item = (order.items as any[])[itemIndex];
    const previousItemStatus = item.status;
    const previousOrderStatus = order.status;

    item.status = status;

    if (status === 'preparing' && !item.startedAt) {
      item.startedAt = new Date();
    }

    if (status === 'ready') {
      item.readyAt = new Date();
    }

    if (status === 'served') {
      item.servedAt = new Date();
    }

    if (status === 'cancelled') {
      item.cancelledAt = new Date();
    }

    const newOrderStatus = recalculateOrderStatus(order.items as IOrderItem[]);

    if (newOrderStatus === 'preparing' && previousOrderStatus !== 'preparing') {
      await deductInventoryForOrder(order, restaurantId);
    }

    if (newOrderStatus !== previousOrderStatus) {
      order.status = newOrderStatus;
    }

    await order.save();

    const itemPayload = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      itemId: item._id,
      itemName: item.name,
      station: item.station || 'kitchen',
      previousStatus: previousItemStatus,
      newStatus: status,
      orderStatus: order.status,
    };

    emitToStation(
      io,
      restaurantId,
      item.station || 'kitchen',
      'item_status_updated',
      itemPayload
    );

    io.to(`kds_${restaurantId}`).emit('item_status_updated', itemPayload);

    if (newOrderStatus !== previousOrderStatus) {
      const orderPayload = {
        orderId: order._id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        status: newOrderStatus,
      };

      io.to(`restaurant_${restaurantId}`).emit('order_status_updated', orderPayload);
      io.to(`kds_${restaurantId}`).emit('order_status_updated', orderPayload);

      const affectedStations = new Set(
        (order.items as any[]).map((orderItem) => orderItem.station || 'kitchen')
      );

      affectedStations.forEach((stationType) => {
        emitToStation(
          io,
          restaurantId,
          stationType,
          'station_order_status_updated',
          orderPayload
        );
      });

      if (newOrderStatus === 'ready') {
        io.to(`waiter_${restaurantId}`).emit('order_ready', orderPayload);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Item status updated!',
      itemId: item._id,
      itemStatus: status,
      orderStatus: order.status,
      order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};