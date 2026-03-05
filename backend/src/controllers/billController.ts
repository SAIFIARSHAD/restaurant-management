import { Request, Response } from 'express';
import Bill from '../models/Bill';
import Order from '../models/Order';
import Table from '../models/Table';
import { generateBillPDF } from '../services/billPdfService';

// Generate Bill from Order
export const generateBill = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { orderId, customerName, customerPhone, discount, serviceCharge, paymentMode } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      restaurant: req.user.restaurantId
    }).populate('table');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const existingBill = await Bill.findOne({ order: orderId });
    if (existingBill) {
      return res.status(400).json({
        success: false,
        message: 'Bill already generated for this order',
        bill: existingBill
      });
    }

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

// Show Bill by ID
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

// Show All Bills
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

    if (bill.table) {
      await Table.findByIdAndUpdate(bill.table, { status: 'available' });
    }

    res.json({ success: true, message: 'Payment done! Table is now available.', bill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// NEW — Download Bill PDF
export const downloadBillPDF = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const bill = await Bill.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurantId
    }).populate('restaurant table');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    const restaurant = bill.restaurant as any;
    const table = bill.table as any;

    const billData = {
      billNumber: bill._id.toString().slice(-8).toUpperCase(),
      restaurantName: restaurant?.name || 'Restaurant',
      //restaurantAddress: restaurant?.address || '',
      
      restaurantAddress: restaurant?.address
  ? `${restaurant.address.street || ''}, ${restaurant.address.city || ''}, ${restaurant.address.state || ''} - ${restaurant.address.zipCode || ''}`
  : '',
      restaurantGSTIN: restaurant?.gstin || 'N/A',
      customerName: bill.customerName || 'Walk-in Customer',
      customerPhone: bill.customerPhone || 'N/A',
      tableNumber: table?.tableNumber?.toString() || 'N/A',
      paymentMethod: bill.paymentMode || 'Cash',
      isInterState: false,
      createdAt: (bill as any).createdAt,
      items: bill.items.map((item: any) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        gstRate: item.gstRate || 5,
      })),
    };

    generateBillPDF(billData, res);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
