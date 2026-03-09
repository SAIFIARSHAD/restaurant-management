import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Attendance from '../models/Attendance';
import Employee from '../models/Employee';
import { getClientIp } from '../middleware/ipCheckMiddleware';

// LOGIN → ATTENDANCE START
export const markLogin = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const userId = (req as any).user.id;
    const clientIp = getClientIp(req);

    // Find Employee 
    const employee = await Employee.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      isActive: true,
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Today already login ?
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingActive = await Attendance.findOne({
      employee: employee._id,
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      date: { $gte: today },
      status: 'active',
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: 'Already logged in',
        data: existingActive,
      });
    }

    // Attendance create 
    const now = new Date();
    const attendance = await Attendance.create({
      restaurant: restaurantId,
      employee: employee._id,
      date: now,
      loginTime: now,
      lastHeartbeat: now,
      loginIp: clientIp,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: ` Login recorded at ${now.toLocaleTimeString('en-IN')}`,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// LOGOUT → ATTENDANCE END 
export const markLogout = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const userId = (req as any).user.id;

    const employee = await Employee.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      restaurant: new mongoose.Types.ObjectId(restaurantId),
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Find Active attendance
    const attendance = await Attendance.findOne({
      employee: employee._id,
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      status: 'active',
    });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'No active session found' });
    }

    const now = new Date();
    const loginTime = new Date(attendance.loginTime);

    // calculate Shift duration (minutes)
    const shiftDuration = Math.floor((now.getTime() - loginTime.getTime()) / 60000);

    // calculate Overtime (480 min = After 8 hours )
    const overtimeMinutes = shiftDuration > 480 ? shiftDuration - 480 : 0;

    await Attendance.findByIdAndUpdate(attendance._id, {
      $set: {
        logoutTime: now,
        shiftDuration,
        overtimeMinutes,
        status: 'completed',
      },
    });

    res.status(200).json({
      success: true,
      message: `Logout recorded at ${now.toLocaleTimeString('en-IN')}`,
      data: {
        loginTime: attendance.loginTime,
        logoutTime: now,
        shiftDuration: `${Math.floor(shiftDuration / 60)}h ${shiftDuration % 60}m`,
        overtimeMinutes,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// HEARTBEAT → KEEP ALIVE 
export const heartbeat = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const userId = (req as any).user.id;

    const employee = await Employee.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      restaurant: new mongoose.Types.ObjectId(restaurantId),
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await Attendance.findOneAndUpdate(
      { employee: employee._id, status: 'active' },
      { $set: { lastHeartbeat: new Date() } }
    );

    res.status(200).json({ success: true, message: 'Heartbeat recorded' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// GET TODAY ATTENDANCE 
export const getTodayAttendance = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.find({
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      date: { $gte: today, $lt: tomorrow },
    }).populate('employee', 'name role phone');

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// GET EMPLOYEE ATTENDANCE HISTORY
export const getEmployeeAttendance = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate as string) : new Date();
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
    restaurant: new mongoose.Types.ObjectId(restaurantId as string),
    employee: new mongoose.Types.ObjectId(id as string),   
    date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    // Calculate Summary
    const totalDays = attendance.length;
    const totalMinutes = attendance.reduce((s, a) => s + (a.shiftDuration || 0), 0);
    const totalOvertime = attendance.reduce((s, a) => s + (a.overtimeMinutes || 0), 0);

    res.status(200).json({
      success: true,
      summary: {
        totalDays,
        totalHours: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
        totalOvertime: `${Math.floor(totalOvertime / 60)}h ${totalOvertime % 60}m`,
      },
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
