import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Restaurant from '../models/Restaurant';
import Employee   from '../models/Employee';

const calcShiftHours = (start: string, end: string): number => {
  const [startH, startM] = start.split (':').map(Number);
  const [endH,   endM  ] = end.split(':').map(Number);
  let total = (endH * 60 + endM) - (startH * 60 + startM);
  if (total < 0) total += 24 * 60; 
  return parseFloat((total / 60).toFixed(2));
};

export const getPayrollSettings = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const restaurant   = await Restaurant.findById(restaurantId)
      .select('payrollSettings shiftTemplates');

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        payrollSettings: restaurant.payrollSettings,
        shiftTemplates:  restaurant.shiftTemplates,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};


export const updatePayrollSettings = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const {
      salaryCalculationOn,
      shiftStartTime,
      shiftEndTime,
      halfDayThreshold,
      overtimeBufferMinutes,
      overtimeRatePerHour,
    } = req.body;

    const shiftHours = calcShiftHours(shiftStartTime, shiftEndTime);

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      {
        $set: {
          'payrollSettings.salaryCalculationOn':   salaryCalculationOn,
          'payrollSettings.shiftStartTime':         shiftStartTime,
          'payrollSettings.shiftEndTime':           shiftEndTime,
          'payrollSettings.shiftHours':             shiftHours,
          'payrollSettings.halfDayThreshold':       halfDayThreshold,
          'payrollSettings.overtimeBufferMinutes':  overtimeBufferMinutes,
          'payrollSettings.overtimeRatePerHour':    overtimeRatePerHour,
        },
      },
      { new: true }
    ).select('payrollSettings');

    res.status(200).json({
      success: true,
      message: 'Payroll settings updated',
      data:    restaurant?.payrollSettings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};


export const createShiftTemplate = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const {
      name,
      shiftStartTime,
      shiftEndTime,
      halfDayThreshold,
      overtimeBufferMinutes,
      overtimeRatePerHour,
      salaryCalculationOn,
      isDefault,
    } = req.body;

    const shiftHours = calcShiftHours(shiftStartTime, shiftEndTime);

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    
    if (restaurant.shiftTemplates.length >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 shift templates allowed',
      });
    }

    
    if (isDefault) {
      restaurant.shiftTemplates.forEach(t => { t.isDefault = false; });
    }

    restaurant.shiftTemplates.push({
      _id:                   new mongoose.Types.ObjectId(),
      name,
      shiftStartTime,
      shiftEndTime,
      shiftHours,
      halfDayThreshold:      halfDayThreshold      ?? 4.5,
      overtimeBufferMinutes: overtimeBufferMinutes  ?? 20,
      overtimeRatePerHour:   overtimeRatePerHour    ?? 50,
      salaryCalculationOn:   salaryCalculationOn    ?? '26', 
      isDefault:             isDefault              ?? false,
    });

    await restaurant.save();

    res.status(201).json({
      success: true,
      message: 'Shift template created',
      data:    restaurant.shiftTemplates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};


export const updateShiftTemplate = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const templateId   = req.params.templateId;
    const {
      name,
      shiftStartTime,
      shiftEndTime,
      halfDayThreshold,
      overtimeBufferMinutes,
      overtimeRatePerHour,
      salaryCalculationOn,
      isDefault,
    } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const template = restaurant.shiftTemplates
      .find(t => t._id.toString() === templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    
    if (isDefault) {
      restaurant.shiftTemplates.forEach(t => { t.isDefault = false; });
    }

    const shiftHours = calcShiftHours(shiftStartTime, shiftEndTime);

    template.name                  = name;
    template.shiftStartTime        = shiftStartTime;
    template.shiftEndTime          = shiftEndTime;
    template.shiftHours            = shiftHours;
    template.halfDayThreshold      = halfDayThreshold;
    template.overtimeBufferMinutes = overtimeBufferMinutes;
    template.overtimeRatePerHour   = overtimeRatePerHour;
    template.isDefault             = isDefault ?? false;

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: 'Shift template updated',
      data:    restaurant.shiftTemplates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};


export const deleteShiftTemplate = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const templateId   = req.params.templateId;

    
    const assignedCount = await Employee.countDocuments({
      restaurant:      restaurantId,
      shiftTemplateId: new mongoose.Types.ObjectId(templateId),
    });

    if (assignedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `${assignedCount} employee(s) assigned to this template. Reassign first.`,
      });
    }

    await Restaurant.findByIdAndUpdate(restaurantId, {
      $pull: { shiftTemplates: { _id: new mongoose.Types.ObjectId(templateId) } },
    });

    res.status(200).json({
      success: true,
      message: 'Shift template deleted',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};


export const updateOvertimeEligibility = async (req: Request, res: Response) => {
  try {
    const restaurantId               = (req as any).user.restaurantId as string;
    const { employeeId, overtimeEligible } = req.body;

    const employee = await Employee.findOneAndUpdate(
      { _id: employeeId, restaurant: restaurantId },
      { $set: { overtimeEligible } },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({
      success: true,
      message: `Overtime ${overtimeEligible ? 'enabled' : 'disabled'} for ${employee.name}`,
      data:    employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};


export const assignShiftTemplate = async (req: Request, res: Response) => {
  try {
    const restaurantId               = (req as any).user.restaurantId as string;
    const { employeeId, templateId } = req.body;

    
    if (templateId) {
      const restaurant = await Restaurant.findById(restaurantId);
      const exists     = restaurant?.shiftTemplates
        .some(t => t._id.toString() === templateId);
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Template not found' });
      }
    }

    const employee = await Employee.findOneAndUpdate(
      { _id: employeeId, restaurant: restaurantId },
      { $set: { shiftTemplateId: templateId || null } },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({
      success: true,
      message: templateId
        ? 'Shift template assigned'
        : 'Template removed — default settings will apply',
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
