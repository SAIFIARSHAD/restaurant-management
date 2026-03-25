import { Request, Response } from 'express';
import Restaurant from '../models/Restaurant';

export const getPayrollSettings = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;

    const restaurant = await Restaurant.findById(restaurantId)
      .select('payrollSettings');

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.status(200).json({
      success: true,
      data:    restaurant.payrollSettings,
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

    
    let shiftHours = 9; 
    if (shiftStartTime && shiftEndTime) {
      const [startH, startM] = shiftStartTime.split(':').map(Number);
      const [endH,   endM  ] = shiftEndTime.split(':').map(Number);
      const startTotal = startH * 60 + startM;
      const endTotal   = endH   * 60 + endM;
      shiftHours = parseFloat(((endTotal - startTotal) / 60).toFixed(2));
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      {
        $set: {
          'payrollSettings.salaryCalculationOn':  salaryCalculationOn,
          'payrollSettings.shiftStartTime':        shiftStartTime,
          'payrollSettings.shiftEndTime':          shiftEndTime,
          'payrollSettings.shiftHours':            shiftHours,
          'payrollSettings.halfDayThreshold':      halfDayThreshold,
          'payrollSettings.overtimeBufferMinutes': overtimeBufferMinutes,
          'payrollSettings.overtimeRatePerHour':   overtimeRatePerHour,
        },
      },
      { new: true }
    ).select('payrollSettings');

    res.status(200).json({
      success: true,
      message: 'Payroll settings updated successfully',
      data:    restaurant?.payrollSettings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};


export const updateOvertimeEligibility = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const { employeeId, overtimeEligible } = req.body;

    const Employee = (await import('../models/Employee')).default;

    const employee = await Employee.findOneAndUpdate(
      {
        _id:        employeeId,
        restaurant: restaurantId,
      },
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
