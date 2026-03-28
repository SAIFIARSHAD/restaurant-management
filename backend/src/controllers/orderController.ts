import { Request, Response } from 'express';
import Order from '../models/Order';
import Table from '../models/Table';
import MenuItem from '../models/MenuItem';
import { emitNewOrder, emitOrderAccepted, emitOrderReady, emitOrderCancelled, emitToStation } from '../socket/socketHandler';
import { io } from '../server';
import Recipe from '../models/Recipe';
import RawMaterial from '../models/RawMaterial';
import { calculateDeduction } from '../utils/unitConverter';
import RawMaterialLog from '../models/RawMaterialLog';
import Bill from '../models/Bill';



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

     
const lastOrder = await Order.findOne({ restaurant: restaurantId })
  .sort({ createdAt: -1 })
  .select('orderNumber');

let nextNum = 1;
if (lastOrder?.orderNumber) {
  const lastNum = parseInt(lastOrder.orderNumber.replace('ORD-', '')) || 0;
  nextNum = lastNum + 1;
}

let orderNumber = `ORD-${String(nextNum).padStart(4, '0')}`;


const exists = await Order.findOne({ orderNumber });
if (exists) {
  orderNumber = `ORD-${String(nextNum + 1).padStart(4, '0')}`;
}

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

 
    emitNewOrder(io, restaurantId, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      items: order.items,
      notes: order.notes,
      status: order.status,
      createdAt: (order as any).createdAt
    });

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


export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status, cancellationReason } = req.body;
    const restaurantId = getRestaurantId(req);

    if (status === 'cancelled' && !cancellationReason?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason required!'
      });
    }

    
    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = existingOrder.status; 

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === 'served' ? { servedAt: new Date() } : {}),
        ...(status === 'cancelled' ? { cancellationReason } : {}),
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (status === 'served' || status === 'cancelled') {
      await Table.findByIdAndUpdate(order.table, { status: 'available' });
    }

    const payload = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      status: order.status
    };

    if (restaurantId) {

      if (status === 'preparing' && previousStatus !== 'preparing') {

  const fullOrder = await Order.findById(req.params.id);

  if (fullOrder) {
    for (const item of fullOrder.items) {
      const recipe = await Recipe.findOne({
        menuItem: item.menuItem,
        isActive: true
      });

      if (!recipe) {
        console.log(` No recipe found for menuItem: ${item.menuItem}`);
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

        
        await RawMaterial.findByIdAndUpdate(
          ingredient.rawMaterial,
          { $inc: { currentStock: -deductAmount } }
        );

        console.log(` Stock deducted: ${rawMaterial.name} → -${deductAmount} ${rawMaterial.unit}`);

        
        const updatedMaterial = await RawMaterial.findById(ingredient.rawMaterial);

        await RawMaterialLog.create({
          restaurant: restaurantId,
          rawMaterial: ingredient.rawMaterial,
          type: 'auto_deduct',
          quantity: deductAmount,
          unit: rawMaterial.unit,
          previousStock: previousStock,
          newStock: updatedMaterial?.currentStock ?? 0,
          reason: `Order #${fullOrder.orderNumber} — ${item.name} x${item.quantity}`,
          orderId: fullOrder._id,
          createdBy: undefined,
        });

        
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

  io.to(`restaurant_${restaurantId}`).emit('order_preparing', payload);
}


      if (status === 'accepted') emitOrderAccepted(io, restaurantId, payload);
      if (status === 'ready')    emitOrderReady(io, restaurantId, payload);
      if (status === 'cancelled') emitOrderCancelled(io, restaurantId, payload);
    }

    res.json({ success: true, message: 'Order status updated!', order });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;
    const restaurantId = getRestaurantId(req);
    const userId = (req as any).user.id;

    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    
    if (order.status === 'billed') {
      return res.status(400).json({ success: false, message: 'Order already billed!' });
    }

    
    order.paymentStatus = paymentStatus;
    order.paymentMethod = paymentMethod;
    order.status        = 'billed';        
    await order.save();

    
    const lastBill = await Bill.findOne({ restaurant: restaurantId })
      .sort({ createdAt: -1 })
      .select('billNumber');

    let nextNum = 1;
    if (lastBill?.billNumber) {
      const lastNum = parseInt(lastBill.billNumber.replace('BILL-', '')) || 0;
      nextNum = lastNum + 1;
    }
    const billNumber = `BILL-${String(nextNum).padStart(4, '0')}`;

    
    const bill = await Bill.create({
      restaurant:    restaurantId,
      order:         order._id,
      table:         order.table,
      tableNumber:   order.tableNumber,
      orderNumber:   order.orderNumber,
      customerName:  (order as any).customerName  ?? '',
      customerPhone: (order as any).customerPhone ?? '',
      items:         order.items.map((item: any) => ({
        menuItem:  item.menuItem,
        name:      item.name,
        price:     item.price,
        quantity:  item.quantity,
        gstRate:   5,
        itemTotal: item.price * item.quantity,
      })),
      subtotal:      order.subtotal,
      cgst:          Math.round((order.tax / 2) * 100) / 100,
      sgst:          Math.round((order.tax / 2) * 100) / 100,
      totalTax:      order.tax,
      discount:      order.discount   ?? 0,
      serviceCharge: (order as any).serviceCharge ?? 0,
      totalAmount:   order.totalAmount,
      billNumber,
      paymentMode:   paymentMethod,   
      paymentStatus: 'paid',
      paidAt:        new Date(),
      createdBy:     userId,
    });

    
    await Table.findByIdAndUpdate(order.table, { status: 'available' });

    
    if (restaurantId) {
      io.to(`restaurant_${restaurantId}`).emit('order_billed', {
        orderId:     order._id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        status:      'billed',
        billId:      bill._id,
        billNumber,
      });
    }

    res.json({
      success: true,
      message: 'Payment done & Bill created!',
      order,
      bill,
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};