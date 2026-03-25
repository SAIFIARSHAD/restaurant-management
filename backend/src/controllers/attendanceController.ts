import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Attendance from '../models/Attendance';
import Employee   from '../models/Employee';
import Restaurant from '../models/Restaurant';
import { getClientIp } from '../middleware/ipCheckMiddleware';

const toDateOnly = (d: Date): Date => {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
};

const recalculateDayStatus = (
  totalMinutes: number,
  payrollSettings: {
    shiftHours: number;
    halfDayThreshold: number;
    overtimeBufferMinutes: number;
  }
): { dayStatus: 'present' | 'half-day' | 'absent'; overtimeMinutes: number } => {
  const totalHours        = totalMinutes / 60;
  const shiftMinutes      = payrollSettings.shiftHours * 60;
  const overtimeThreshold = shiftMinutes + payrollSettings.overtimeBufferMinutes;

  let dayStatus: 'present' | 'half-day' | 'absent' = 'absent';
  if (totalHours >= payrollSettings.shiftHours) {
    dayStatus = 'present';
  } else if (totalHours >= payrollSettings.halfDayThreshold) {
    dayStatus = 'half-day';
  }

  const overtimeMinutes = totalMinutes > overtimeThreshold
    ? totalMinutes - overtimeThreshold
    : 0;

  return { dayStatus, overtimeMinutes: Math.floor(overtimeMinutes) };
};


export const markLogin = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const userId       = (req as any).user.id           as string;
    const clientIp     = getClientIp(req);

    const employee = await Employee.findOne({
      userId:     new mongoose.Types.ObjectId(userId),
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      isActive:   true,
    });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const now      = new Date();
    const dateOnly = toDateOnly(now);

    
    let attendance = await Attendance.findOne({
      employee:   employee._id,
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      date:       dateOnly,
    });

    if (!attendance) {
      attendance = await Attendance.create({
        restaurant:    new mongoose.Types.ObjectId(restaurantId),
        employee:      employee._id,
        date:          dateOnly,
        sessions:      [],
        totalMinutes:  0,
        overtimeMinutes: 0,
        dayStatus:     'absent',
        lastHeartbeat: now,
        status:        'active',
      });
    }

    const hasActiveSession = attendance.sessions.some(
      s => s.loginTime && !s.logoutTime
    );
    if (hasActiveSession) {
      return res.status(400).json({
        success: false,
        message: 'Already logged in — please logout first',
      });
    }

    attendance.sessions.push({
      loginTime:       now,
      logoutTime:      undefined,
      durationMinutes: 0,
      loginIp:         clientIp,
    });
    attendance.lastHeartbeat = now;
    attendance.status        = 'active';
    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Login recorded at ${now.toLocaleTimeString('en-IN')}`,
      data:    attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};


export const markLogout = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const userId       = (req as any).user.id           as string;

    const employee = await Employee.findOne({
      userId:     new mongoose.Types.ObjectId(userId),
      restaurant: new mongoose.Types.ObjectId(restaurantId),
    });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const now      = new Date();
    const dateOnly = toDateOnly(now);

    const attendance = await Attendance.findOne({
      employee:   employee._id,
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      date:       dateOnly,
      status:     'active',
    });
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'No active session found' });
    }

    const activeSession = attendance.sessions
      .slice()
      .reverse()
      .find(s => !s.logoutTime);

    if (!activeSession) {
      return res.status(400).json({ success: false, message: 'No active session found' });
    }

    const sessionMinutes = Math.floor(
      (now.getTime() - new Date(activeSession.loginTime).getTime()) / 60000
    );
    activeSession.logoutTime      = now;
    activeSession.durationMinutes = sessionMinutes;

    
    const totalMinutes = attendance.sessions.reduce(
      (sum, s) => sum + (s.durationMinutes || 0), 0
    );

    
    const restaurant      = await Restaurant.findById(restaurantId);
    const payrollSettings = restaurant?.payrollSettings ?? {
      shiftHours:            9,
      halfDayThreshold:      4.5,
      overtimeBufferMinutes: 20,
    };

    const { dayStatus, overtimeMinutes } = recalculateDayStatus(
      totalMinutes,
      payrollSettings
    );

    attendance.totalMinutes    = totalMinutes;
    attendance.overtimeMinutes = overtimeMinutes;
    attendance.dayStatus       = dayStatus;
    attendance.status          = 'completed';
    await attendance.save();

    const hrs  = Math.floor(sessionMinutes / 60);
    const mins = sessionMinutes % 60;

    res.status(200).json({
      success: true,
      message: `Logout recorded at ${now.toLocaleTimeString('en-IN')}`,
      data: {
        sessionDuration: `${hrs}h ${mins}m`,
        totalToday:      `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
        dayStatus,
        overtimeMinutes,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const heartbeat = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const userId       = (req as any).user.id           as string;

    const employee = await Employee.findOne({
      userId:     new mongoose.Types.ObjectId(userId),
      restaurant: new mongoose.Types.ObjectId(restaurantId),
    });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await Attendance.findOneAndUpdate(
      {
        employee:   employee._id,
        restaurant: new mongoose.Types.ObjectId(restaurantId),
        status:     'active',
      },
      { $set: { lastHeartbeat: new Date() } }
    );

    res.status(200).json({ success: true, message: 'Heartbeat recorded' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const getTodayAttendance = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;

    const today    = toDateOnly(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.find({
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      date:       { $gte: today, $lt: tomorrow },
    }).populate('employee', 'name role phone');

    res.status(200).json({
      success: true,
      count:   attendance.length,
      data:    attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const getEmployeeAttendance = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const { id }       = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate as string)
      : new Date(new Date().setDate(1));
    const end   = endDate
      ? new Date(endDate as string)
      : new Date();
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      employee:   new mongoose.Types.ObjectId(id),
      date:       { $gte: start, $lte: end },
    }).sort({ date: -1 });

    const totalDays     = attendance.length;
    const fullDays      = attendance.filter(a => a.dayStatus === 'present').length;
    const halfDays      = attendance.filter(a => a.dayStatus === 'half-day').length;
    const totalMinutes  = attendance.reduce((s, a) => s + a.totalMinutes,    0);
    const totalOvertime = attendance.reduce((s, a) => s + a.overtimeMinutes, 0);

    res.status(200).json({
      success: true,
      summary: {
        totalDays,
        fullDays,
        halfDays,
        totalHours:    `${Math.floor(totalMinutes  / 60)}h ${totalMinutes  % 60}m`,
        totalOvertime: `${Math.floor(totalOvertime / 60)}h ${totalOvertime % 60}m`,
      },
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
