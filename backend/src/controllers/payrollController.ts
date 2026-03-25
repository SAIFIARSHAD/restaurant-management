import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Payroll from '../models/Payroll';
import Employee from '../models/Employee';
import Attendance from '../models/Attendance';
import Restaurant from '../models/Restaurant';
import PDFDocument from 'pdfkit';

// Helper: Days in Month
const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month, 0).getDate();
};

// CALCULATE SALARY
export const calculateSalary = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const employeeId   = req.params.employeeId          as string;
    const { month, year } = req.body;

    const employee = await Employee.findOne({
      _id:        new mongoose.Types.ObjectId(employeeId),
      restaurant: new mongoose.Types.ObjectId(restaurantId),
    });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const restaurant      = await Restaurant.findById(restaurantId);
    const payrollSettings = restaurant?.payrollSettings;

    // Working days calculation
    const getDaysInMonth = (m: number, y: number) => new Date(y, m, 0).getDate();
    let workingDays: number;
    if (payrollSettings?.salaryCalculationOn === 'actual') {
      workingDays = getDaysInMonth(month, year);
    } else {
      workingDays = parseInt(payrollSettings?.salaryCalculationOn || '26');
    }

    const overtimeRatePerHour = payrollSettings?.overtimeRatePerHour || 50;

    // Fetch attendance
    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month, 0, 23, 59, 59);

    const attendances = await Attendance.find({
      employee:   new mongoose.Types.ObjectId(employeeId),
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      date:       { $gte: startDate, $lte: endDate },
    });

    // Count full days and half days
    const fullDays = attendances.filter(a => a.dayStatus === 'present').length;
    const halfDays = attendances.filter(a => a.dayStatus === 'half-day').length;
    const presentDays  = fullDays + halfDays * 0.5;   // 2 half days = 1 day
    const absentDays   = Math.max(0, workingDays - (fullDays + halfDays));

    // Overtime — only if eligible
    const totalOvertimeMinutes = employee.overtimeEligible
      ? attendances.reduce((sum, a) => sum + (a.overtimeMinutes || 0), 0)
      : 0;
    const overtimeHours = parseFloat((totalOvertimeMinutes / 60).toFixed(2));

    // Salary calculation
    const basicSalary  = employee.salary;
    const perDaySalary = basicSalary / workingDays;
    const earnedSalary = parseFloat((perDaySalary * presentDays).toFixed(2));
    const deductions   = parseFloat((perDaySalary * absentDays).toFixed(2));
    const overtimePay  = parseFloat((overtimeHours * overtimeRatePerHour).toFixed(2));
    const netSalary    = parseFloat((earnedSalary + overtimePay).toFixed(2));

    // Duplicate check
    const existing = await Payroll.findOne({
      employee: new mongoose.Types.ObjectId(employeeId),
      month,
      year,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Salary for ${month}/${year} already calculated`,
        data: existing,
      });
    }

    const payroll = await Payroll.create({
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      employee:   new mongoose.Types.ObjectId(employeeId),
      month,
      year,
      basicSalary,
      workingDays,
      presentDays,
      absentDays,
      overtimeHours,
      overtimePay,
      earnedSalary,
      deductions,
      netSalary,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Salary calculated successfully',
      data:    payroll,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
// GET ALL PAYROLL
export const getAllPayroll = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const { month, year } = req.query;

    const filter: any = { 
      restaurant: new mongoose.Types.ObjectId(restaurantId) 
    };
    if (month) filter.month = parseInt(month as string);
    if (year) filter.year = parseInt(year as string);

    const payrolls = await Payroll.find(filter)
      .populate('employee', 'name role phone')
      .sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// GET SINGLE EMPLOYEE PAYROLL HISTORY
export const getEmployeePayroll = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const employeeId = req.params.employeeId as string;

    const payrolls = await Payroll.find({
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      employee: new mongoose.Types.ObjectId(employeeId),
    }).sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// MARK SALARY AS PAID
export const markSalaryPaid = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const id = req.params.id as string;

    const payroll = await Payroll.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(id), 
        restaurant: new mongoose.Types.ObjectId(restaurantId) 
      },
      {
        $set: {
          status: 'paid',
          paidAt: new Date(),
          paidBy: new mongoose.Types.ObjectId((req as any).user._id),
        },
      },
      { new: true }
    );

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Salary marked as paid',
      data: payroll,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
// ─── 5. GENERATE PAYSLIP PDF ─────────────────────────────────────────────────
export const generatePayslip = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const id = req.params.id as string;

    const payroll = await Payroll.findOne({
      _id: new mongoose.Types.ObjectId(id),
      restaurant: new mongoose.Types.ObjectId(restaurantId),
    }).populate('employee', 'name email phone role');

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    const emp = payroll.employee as any;

    const monthNames = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=payslip-${emp.name}-${monthNames[payroll.month - 1]}-${payroll.year}.pdf`
    );

    doc.pipe(res);

    //  Header
    doc.fillColor('#2563EB').fontSize(22)
      .text(restaurant?.name || 'Restaurant', { align: 'center' })
      .fillColor('#000000').fontSize(12)
      .text('SALARY PAYSLIP', { align: 'center' })
      .moveDown(0.5);

    doc.fontSize(11)
      .text(`Month: ${monthNames[payroll.month - 1]} ${payroll.year}`, { align: 'center' })
      .moveDown(1);

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);

    // Employee Details
    doc.fontSize(13).fillColor('#2563EB').text('Employee Details')
      .fillColor('#000000').fontSize(11).moveDown(0.3);
    doc.text(`Name   : ${emp.name}`);
    doc.text(`Email  : ${emp.email}`);
    doc.text(`Phone  : ${emp.phone}`);
    doc.text(`Role   : ${emp.role}`);
    doc.moveDown(1);

    // Attendance Summary
    doc.fontSize(13).fillColor('#2563EB').text('Attendance Summary')
      .fillColor('#000000').fontSize(11).moveDown(0.3);
    doc.text(`Working Days   : ${payroll.workingDays} days`);
    doc.text(`Present Days   : ${payroll.presentDays} days`);
    doc.text(`Absent Days    : ${payroll.absentDays} days`);
    doc.text(`Overtime Hours : ${payroll.overtimeHours} hrs`);
    doc.moveDown(1);

    // Salary Breakdown
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);
    doc.fontSize(13).fillColor('#2563EB').text('Salary Breakdown')
      .fillColor('#000000').fontSize(11).moveDown(0.3);
    doc.text(`Basic Salary  : ₹ ${payroll.basicSalary.toLocaleString()}`);
    doc.text(`Earned Salary : ₹ ${payroll.earnedSalary.toLocaleString()}`);
    doc.text(`Overtime Pay  : ₹ ${payroll.overtimePay.toLocaleString()}`);
    doc.text(`Deductions    : ₹ ${payroll.deductions.toLocaleString()}`);
    doc.moveDown(0.5);

    // Net Salary
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);
    doc.fontSize(14).fillColor('#16A34A')
      .text(`NET SALARY : ₹ ${payroll.netSalary.toLocaleString()}`, { align: 'right' })
      .fillColor('#000000').moveDown(1);

    // Status
    doc.fontSize(11)
      .text(`Payment Status : ${payroll.status.toUpperCase()}`, { align: 'right' });

    if (payroll.paidAt) {
      doc.text(
        `Paid On : ${new Date(payroll.paidAt).toLocaleDateString('en-IN')}`,
        { align: 'right' }
      );
    }

    // Footer
    doc.moveDown(2).fontSize(9).fillColor('#888888')
      .text('This is a system generated payslip.', { align: 'center' });

    doc.end();

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

