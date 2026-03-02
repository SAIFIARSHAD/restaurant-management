import { Request, Response } from 'express';
import Bill from '../models/Bill';
import Order from '../models/Order';
import Table from '../models/Table';

// Generate Bill from Order
export const generateBill = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { orderId, customerName, customerPhone, discount, serviceCharge, paymentMode } = req.body;

    // find Order
    const order = await Order.findOne({
      _id: orderId,
      restaurant: req.user.restaurantId
    }).populate('table');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check bill already 
    const existingBill = await Bill.findOne({ order: orderId });
    if (existingBill) {
      return res.status(400).json({
        success: false,
        message: 'Bill already generated for this order',
        bill: existingBill
      });
    }

    // GST Calculate (5% default — CGST 2.5% + SGST 2.5%)
    const subtotal = order.subtotal;
    const discountAmount = discount || 0;
    const serviceChargeAmount = serviceCharge || 0;
    const taxableAmount = subtotal - discountAmount;
    const cgst = parseFloat((taxableAmount * 0.025).toFixed(2));
    const sgst = parseFloat((taxableAmount * 0.025).toFixed(2));
    const totalTax = cgst + sgst;
    const totalAmount = parseFloat(
      (taxableAmount + totalTax + serviceChargeAmount).toFixed(2)
    );

    // Make Bill 
    const bill = await Bill.create({
      restaurant: req.user.restaurantId,
      order: order._id,
      table: order.table,
      tableNumber: order.tableNumber,
      orderNumber: order.orderNumber,
      customerName,
      customerPhone,
      items: order.items.map((item: any) => ({
        menuItem: item.menuItem,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        gstRate: 5,
        itemTotal: item.price * item.quantity
      })),
      subtotal,
      cgst,
      sgst,
      totalTax,
      discount: discountAmount,
      serviceCharge: serviceChargeAmount,
      totalAmount,
      paymentMode: paymentMode || 'cash',
      paymentStatus: 'pending',
      createdBy: req.user.id
    });

    // Order status → billed update 
    await Order.findByIdAndUpdate(order._id, { status: 'billed' });

    res.status(201).json({
      success: true,
      message: 'Bill generated!',
      bill
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Show Bill  by ID
export const getBill = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const bill = await Bill.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurantId
    }).populate('order table createdBy', 'orderNumber tableNumber name email');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    res.json({ success: true, bill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Show All bills 
export const getAllBills = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const bills = await Bill.find({ restaurant: req.user.restaurantId })
      .sort({ createdAt: -1 })
      .populate('table', 'tableNumber')
      .populate('createdBy', 'name');

    res.json({ success: true, count: bills.length, bills });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Payment Mark as Paid
export const markBillPaid = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { paymentMode } = req.body;

    const bill = await Bill.findOneAndUpdate(
      {
        _id: req.params.id,
        restaurant: req.user.restaurantId
      },
      {
        paymentStatus: 'paid',
        paymentMode: paymentMode || 'cash',
        paidAt: new Date()
      },
      { new: true }
    );

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    // do Table available 
    if (bill.table) {
      await Table.findByIdAndUpdate(bill.table, { status: 'available' });
    }

    res.json({ success: true, message: 'Payment done! Table is now available.', bill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
