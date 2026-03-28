import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order       from '../models/Order';
import Bill        from '../models/Bill';
import Table       from '../models/Table';
import RawMaterial from '../models/RawMaterial';
import Attendance  from '../models/Attendance';
import Employee    from '../models/Employee';
import MenuItem    from '../models/MenuItem';
import Vendor      from '../models/Vendor';

const toDay = () => {
  const d = new Date(); d.setHours(0,0,0,0); return d;
};
const toNight = () => {
  const d = new Date(); d.setHours(23,59,59,999); return d;
};

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const rid   = new mongoose.Types.ObjectId(restaurantId);
    const start = toDay();
    const end   = toNight();

    const [
      revenueAgg,
      todayOrderCount,
      activeOrders,
      orderStatusBreakdown,
      tables,
      topItems,
      lowStockItems,
      attendanceToday,
      hourlyRevenue,
      recentBills,
      menuCountResult,     
      empCountResult,      
      vendorCountResult,   
    ] = await Promise.all([

      
      Bill.aggregate([
        { $match: { restaurant: rid, paymentStatus: 'paid', createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 }, avg: { $avg: '$totalAmount' } } },
      ]),

      
      Order.countDocuments({ restaurant: rid, createdAt: { $gte: start, $lte: end } }),

      
      Order.find({
        restaurant: rid,
        status: { $in: ['pending', 'accepted', 'preparing', 'ready'] },
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .select('orderNumber tableNumber items status createdAt totalAmount'),

      
      Order.aggregate([
        { $match: { restaurant: rid, createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      
      Table.find({ restaurant: rid, isActive: true })
        .select('tableNumber floor status capacity')
        .sort({ floor: 1, tableNumber: 1 }),

      
      Order.aggregate([
        { $match: { restaurant: rid, createdAt: { $gte: start, $lte: end }, status: { $nin: ['cancelled'] } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { quantity: -1 } },
        { $limit: 5 },
        { $project: { name: '$_id', quantity: 1, revenue: 1, _id: 0 } },
      ]),

      
      RawMaterial.find({
        restaurant: rid,
        isActive: true,
        $expr: { $lte: ['$currentStock', '$minThreshold'] },
      }).select('name currentStock minThreshold unit').limit(6),

      
      Attendance.find({
        restaurant: rid,
        date: { $gte: start, $lte: end },
      }).populate('employee', 'name role'),

      
      Bill.aggregate([
        { $match: { restaurant: rid, paymentStatus: 'paid', createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: { $hour: { date: '$createdAt', timezone: 'Asia/Kolkata' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { hour: '$_id', revenue: 1, orders: 1, _id: 0 } },
      ]),

      
      Bill.find({ restaurant: rid, paymentStatus: 'paid' })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('billNumber tableNumber totalAmount paymentMethod createdAt'),

      
      MenuItem.countDocuments({ restaurant: rid, isAvailable: true }),

      
      Employee.countDocuments({ restaurant: rid, isActive: true }),

      
      Vendor.countDocuments({ restaurant: rid, isActive: true }),
    ]);


    const rev = revenueAgg[0] || { total: 0, count: 0, avg: 0 };
    const tableStats = {
      total:     tables.length,
      available: tables.filter((t: any) => t.status === 'available').length,
      occupied:  tables.filter((t: any) => t.status === 'occupied').length,
      reserved:  tables.filter((t: any) => t.status === 'reserved').length,
    };

    const statusMap: Record<string, number> = {};
    orderStatusBreakdown.forEach((s: any) => { statusMap[s._id] = s.count; });

    const presentStaff = attendanceToday.filter(
      (a: any) => a.dayStatus === 'present' || a.status === 'active'
    );
    const staffByRole: Record<string, number> = {};
    presentStaff.forEach((a: any) => {
      const role = a.employee?.role || 'other';
      staffByRole[role] = (staffByRole[role] || 0) + 1;
    });

    const hourlyFilled = Array.from({ length: 24 }, (_, h) => {
      const f = hourlyRevenue.find((r: any) => r.hour === h);
      return { hour: h, revenue: f?.revenue ?? 0, orders: f?.orders ?? 0 };
    });

    const peakHour = hourlyFilled.reduce(
      (max, h) => h.revenue > max.revenue ? h : max,
      { hour: 0, revenue: 0, orders: 0 }
    );

    const dailyTarget = 10000;

    res.json({
      success: true,
      kpi: {
        todayRevenue:    Math.round(rev.total),
        todayOrders:     todayOrderCount,
        pendingOrders:   activeOrders.filter((o: any) => o.status === 'pending').length,
        avgOrderValue:   Math.round(rev.avg || 0),
        tableStats,
        dailyTarget,
        revenueProgress: Math.min(Math.round((rev.total / dailyTarget) * 100), 100),
        menuCount:       menuCountResult,    // ← fixed
        empCount:        empCountResult,     // ← fixed
        vendorCount:     vendorCountResult,  // ← fixed
      },
      orderStatus: {
        pending:   statusMap['pending']   || 0,
        accepted:  statusMap['accepted']  || 0,
        preparing: statusMap['preparing'] || 0,
        ready:     statusMap['ready']     || 0,
        served:    statusMap['served']    || 0,
        cancelled: statusMap['cancelled'] || 0,
        billed:    statusMap['billed']    || 0,
      },
      activeOrders,
      tables,
      topItems,
      lowStockItems,
      staff: {
        totalPresent: presentStaff.length,
        byRole:       staffByRole,
      },
      hourlyRevenue: hourlyFilled,
      peakHour,
      recentActivity: recentBills,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};