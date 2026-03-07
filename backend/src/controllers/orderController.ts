import { Request, Response } from 'express';
import Order from '../models/Order';
import Table from '../models/Table';
import MenuItem from '../models/MenuItem';
import { emitNewOrder, emitOrderAccepted, emitOrderReady, emitOrderCancelled, emitToStation } from '../socket/socketHandler';
import { io } from '../server';
import Recipe from '../models/Recipe';
import RawMaterial from '../models/RawMaterial';
import { calculateDeduction } from '../utils/unitConverter';


// Helper — restaurantId
const getRestaurantId = (req: Request) => {
  const user = (req as any).user;
  const restaurant = user?.restaurant;

  if (!restaurant) return null;

  if (restaurant['$oid']) {
    return restaurant['$oid'];
  }

  if (restaurant._id) {
    return restaurant._id.toString();
  }
  return restaurant.toString();
};

// Create Order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { tableId, items, notes } = req.body;
    const restaurantId = getRestaurantId(req);
    const userId = (req as any).user.id;

    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant not found for this user' });
    }

    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) return res.status(404).json({ success: false, message: `Menu item not found: ${item.menuItemId}` });

      subtotal += menuItem.price * item.quantity;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        notes: item.notes || '',
        station: menuItem.station || 'kitchen'
      });
    }

    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const totalAmount = subtotal + tax;

    const count = await Order.countDocuments({ restaurant: restaurantId });
    const orderNumber = `ORD-${String(count + 1).padStart(4, '0')}`;

    const order = await Order.create({
      restaurant: restaurantId,
      table: tableId,
      tableNumber: table.tableNumber,
      orderNumber,
      items: orderItems,
      subtotal,
      tax,
      totalAmount,
      notes,
      createdBy: userId
    });

    await Table.findByIdAndUpdate(tableId, { status: 'occupied' });

    //  notify Kitchen at real-time 
    emitNewOrder(io, restaurantId, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      items: order.items,
      notes: order.notes,
      status: order.status,
      createdAt: (order as any).createdAt
    });
// Per-Station emit
const stationGroups: { [key: string]: any[] } = {};

    for (const item of order.items) {
      const station = (item as any).station || 'kitchen';
      if (!stationGroups[station]) {
        stationGroups[station] = [];
      }
      stationGroups[station].push(item);
    }

    Object.keys(stationGroups).forEach(stationType => {
      emitToStation(io, restaurantId, stationType, 'new_station_order', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        items: stationGroups[stationType],
        notes: order.notes,
        createdAt: (order as any).createdAt
      });
    });



    res.status(201).json({ success: true, message: 'Order created!', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { status, tableNumber } = req.query;

    const filter: any = { restaurant: restaurantId };
    if (status) filter.status = status;
    if (tableNumber) filter.tableNumber = tableNumber;

    const orders = await Order.find(filter)
      .populate('table', 'tableNumber floor')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Order
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table', 'tableNumber floor')
      .populate('createdBy', 'name');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Order Status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const restaurantId = getRestaurantId(req);

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'served' ? { servedAt: new Date() } : {}) },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (status === 'served' || status === 'cancelled') {
      await Table.findByIdAndUpdate(order.table, { status: 'available' });
    }

    // emit karo
    if (restaurantId) {
      const payload = {
        orderId: order._id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        status: order.status
      };

  if (status === 'accepted') {
  const fullOrder = await Order.findById(req.params.id);

  if (fullOrder) {
    for (const item of fullOrder.items) {
      const recipe = await Recipe.findOne({
        menuItem: item.menuItem,
        isActive: true
      });

      if (recipe) {
        for (const ingredient of recipe.ingredients) {
          const rawMaterial = await RawMaterial.findById(ingredient.rawMaterial);
          if (!rawMaterial) continue;

          // Unit conversion + deduction
          const deductAmount = calculateDeduction(
            ingredient.quantity,
            ingredient.unit,
            rawMaterial.unit,
            item.quantity
          );

          await RawMaterial.findByIdAndUpdate(
            ingredient.rawMaterial,
            { $inc: { currentStock: -deductAmount } }
          );

          // Low Stock Alert — Check after deduction
          const updatedMaterial = await RawMaterial.findById(ingredient.rawMaterial);
          if (updatedMaterial && updatedMaterial.currentStock <= updatedMaterial.minThreshold) {
            io.to(`restaurant_${restaurantId}`).emit('low_stock_alert', {
              materialId: updatedMaterial._id,
              name: updatedMaterial.name,
              currentStock: updatedMaterial.currentStock,
              minThreshold: updatedMaterial.minThreshold,
              unit: updatedMaterial.unit,
              message: ` Low Stock! ${updatedMaterial.name} sirf ${updatedMaterial.currentStock} ${updatedMaterial.unit} bacha hai!`
            });
          }
        }
      }
    }
  }
  emitOrderAccepted(io, restaurantId, payload);
}

      if (status === 'ready') emitOrderReady(io, restaurantId, payload);
      if (status === 'cancelled') emitOrderCancelled(io, restaurantId, payload);
    }

    res.json({ success: true, message: 'Order status updated!', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Payment
export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentMethod },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, message: 'Payment updated!', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
