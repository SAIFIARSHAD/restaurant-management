import { Request, Response } from 'express';
import Order from '../models/Order';
import Bill from '../models/Bill';
import mongoose from 'mongoose';

const getRestaurantId = (req: Request) => {
  const user = (req as any).user;
  const restaurant = user?.restaurant;
  if (!restaurant) return null;
  if (restaurant['$oid']) return restaurant['$oid'];
  if (restaurant._id) return restaurant._id.toString();
  return restaurant.toString();
};

// Date range helper
const getDateRange = (req: Request) => {
  const { startDate, endDate } = req.query;

  const start = startDate
    ? new Date(startDate as string)
    : new Date(new Date().setHours(0, 0, 0, 0)); // Aaj ka start

  const end = endDate
    ? new Date(endDate as string)
    : new Date(new Date().setHours(23, 59, 59, 999)); // Aaj ka end

  return { start, end };
};

// 1. Sales Summary
export const getSalesSummary = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { start, end } = getDateRange(req);

    const orders = await Order.find({
      restaurant: restaurantId,
      status: { $in: ['served', 'billed'] },
      createdAt: { $gte: start, $lte: end }
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalSubtotal = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalTax = orders.reduce((sum, o) => sum + o.tax, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      success: true,
      period: { start, end },
      summary: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalSubtotal: Math.round(totalSubtotal * 100) / 100,
        totalTax: Math.round(totalTax * 100) / 100,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Revenue Report — Day wise breakdown
export const getRevenueReport = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { start, end } = getDateRange(req);

    const revenue = await Order.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId!),
          status: { $in: ['served', 'billed'] },
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          totalTax: { $sum: '$tax' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      period: { start, end },
      revenue
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GST Report
export const getGSTReport = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { start, end } = getDateRange(req);

    const orders = await Order.find({
      restaurant: restaurantId,
      status: { $in: ['served', 'billed'] },
      createdAt: { $gte: start, $lte: end }
    });

    const totalTaxableAmount = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalGST = orders.reduce((sum, o) => sum + o.tax, 0);
    const cgst = totalGST / 2;  // 2.5%
    const sgst = totalGST / 2;  // 2.5%

    // Month wise GST breakdown
    const monthlyGST = await Order.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId!),
          status: { $in: ['served', 'billed'] },
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          taxableAmount: { $sum: '$subtotal' },
          totalGST: { $sum: '$tax' },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      period: { start, end },
      gstSummary: {
        totalTaxableAmount: Math.round(totalTaxableAmount * 100) / 100,
        totalGST: Math.round(totalGST * 100) / 100,
        cgst: Math.round(cgst * 100) / 100,
        sgst: Math.round(sgst * 100) / 100,
      },
      monthlyBreakdown: monthlyGST
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Top Selling Items
export const getTopItems = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { start, end } = getDateRange(req);
    const limit = parseInt(req.query.limit as string) || 10;

    const topItems = await Order.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId!),
          status: { $in: ['served', 'billed'] },
          createdAt: { $gte: start, $lte: end }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit }
    ]);

    res.json({
      success: true,
      period: { start, end },
      topItems
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Payment Mode Report
export const getPaymentReport = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { start, end } = getDateRange(req);

    const paymentData = await Bill.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId!),
          paymentStatus: 'paid',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json({
      success: true,
      period: { start, end },
      paymentBreakdown: paymentData
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Daily Summary — Today Total
export const getDailySummary = async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);

            const now = new Date();
        const ISTOffset = 5.5 * 60 * 60 * 1000; // 5:30 hours in ms

        const todayStart = new Date(
        new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime() - ISTOffset
        );
        const todayEnd = new Date(
        new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime() - ISTOffset
        );

    const orders = await Order.find({
      restaurant: restaurantId,
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const summary = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      acceptedOrders: orders.filter(o => o.status === 'accepted').length,
      readyOrders: orders.filter(o => o.status === 'ready').length,
      servedOrders: orders.filter(o => o.status === 'served').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter(o => o.status === 'served')
        .reduce((sum, o) => sum + o.totalAmount, 0),
      totalTax: orders
        .filter(o => o.status === 'served')
        .reduce((sum, o) => sum + o.tax, 0)
    };

    res.json({
      success: true,
      date: todayStart,
      summary
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
