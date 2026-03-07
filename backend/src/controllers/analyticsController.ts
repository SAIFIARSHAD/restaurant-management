import { Request, Response } from 'express';
import Order from '../models/Order';
import Bill from '../models/Bill';
import mongoose from 'mongoose';

// Helper: IST-aware date range
const getDateRange = (req: Request) => {
  const { startDate, endDate } = req.query;

  const toISTStart = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  };

  const toISTEnd = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  };

  const now = new Date();

  const start = startDate
    ? toISTStart(startDate as string)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const end = endDate
    ? toISTEnd(endDate as string)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  return { start, end };
};

// 1. DASHBOARD STATS
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { start, end } = getDateRange(req);

    const [orderStats, revenueStats] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            restaurant: new mongoose.Types.ObjectId(restaurantId as string),
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
            },
          },
        },
      ]),

      Bill.aggregate([
        {
          $match: {
            restaurant: new mongoose.Types.ObjectId(restaurantId as string),
            createdAt: { $gte: start, $lte: end },
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalTax: { $sum: '$tax' },
            totalDiscount: { $sum: '$discount' },
            avgOrderValue: { $avg: '$totalAmount' },
            totalBills: { $sum: 1 },
          },
        },
      ]),
    ]);

    const orders = orderStats[0] || { totalOrders: 0, cancelledOrders: 0 };
    const revenue = revenueStats[0] || {
      totalRevenue: 0,
      totalTax: 0,
      totalDiscount: 0,
      avgOrderValue: 0,
      totalBills: 0,
    };

    res.json({
      success: true,
      period: { start, end },
      dashboard: {
        totalOrders: orders.totalOrders,
        cancelledOrders: orders.cancelledOrders,
        totalRevenue: revenue.totalRevenue,
        totalTax: revenue.totalTax,
        totalDiscount: revenue.totalDiscount,
        avgOrderValue: parseFloat(revenue.avgOrderValue?.toFixed(2) || '0'),
        totalBills: revenue.totalBills,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// 2. HOURLY SALES 
export const getHourlySales = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { start, end } = getDateRange(req);

    const data = await Order.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId as string),
          status: { $in: ['served', 'billed'] },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $hour: { date: '$createdAt', timezone: 'Asia/Kolkata' } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          hour: '$_id',
          label: {
            $concat: [
              { $toString: '$_id' },
              ':00 - ',
              { $toString: { $add: ['$_id', 1] } },
              ':00',
            ],
          },
          totalOrders: 1,
          totalRevenue: 1,
          _id: 0,
        },
      },
    ]);

    res.json({
      success: true,
      period: { start, end },
      hourlySales: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// 3. WEEKLY REVENUE 
export const getWeeklyRevenue = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;

    // Last 7 days by default
    const end = new Date(new Date().setHours(23, 59, 59, 999));
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const data = await Bill.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId as string),
          paymentStatus: 'paid',
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'Asia/Kolkata',
            },
          },
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          totalRevenue: 1,
          totalOrders: 1,
          _id: 0,
        },
      },
    ]);

    res.json({
      success: true,
      period: { start, end },
      weeklyRevenue: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// 4. CATEGORY-WISE SALES 
export const getCategorySales = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { start, end } = getDateRange(req);

    const data = await Order.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId as string),
          status: { $in: ['served', 'billed'] },
          createdAt: { $gte: start, $lte: end },
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem',
          foreignField: '_id',
          as: 'menuItemData',
        },
      },
      { $unwind: '$menuItemData' },
      {
        $lookup: {
          from: 'menucategories',
          localField: 'menuItemData.category',
          foreignField: '_id',
          as: 'categoryData',
        },
      },
      { $unwind: '$categoryData' },
      {
        $group: {
          _id: '$categoryData.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
      {
        $project: {
          category: '$_id',
          totalQuantity: 1,
          totalRevenue: 1,
          _id: 0,
        },
      },
    ]);

    res.json({
      success: true,
      period: { start, end },
      categorySales: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// 5. TABLE TURNOVER 
export const getTableTurnover = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { start, end } = getDateRange(req);

    const data = await Order.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId as string),
          status: { $in: ['served', 'billed'] },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$tableNumber',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { totalOrders: -1 } },
      {
        $project: {
          tableNumber: '$_id',
          totalOrders: 1,
          totalRevenue: 1,
          _id: 0,
        },
      },
    ]);

    res.json({
      success: true,
      period: { start, end },
      tableTurnover: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
