import Employee   from '../models/Employee';
import Restaurant from '../models/Restaurant';

export const getShiftSettings = async (
  restaurantId: string,
  employeeId:   string
) => {
  const [employee, restaurant] = await Promise.all([
    Employee.findById(employeeId),
    Restaurant.findById(restaurantId),
  ]);

  if (employee?.shiftTemplateId && restaurant?.shiftTemplates?.length) {
    const template = restaurant.shiftTemplates
      .find(t => t._id.toString() === employee.shiftTemplateId!.toString());

    if (template) {
      return {
        shiftHours:            template.shiftHours,
        halfDayThreshold:      template.halfDayThreshold,
        overtimeBufferMinutes: template.overtimeBufferMinutes,
        overtimeRatePerHour:   template.overtimeRatePerHour,
        salaryCalculationOn:   template.salaryCalculationOn ?? '26', 
      };
    }
  }

  
  return {
    shiftHours:            restaurant?.payrollSettings?.shiftHours            ?? 9,
    halfDayThreshold:      restaurant?.payrollSettings?.halfDayThreshold      ?? 4.5,
    overtimeBufferMinutes: restaurant?.payrollSettings?.overtimeBufferMinutes ?? 20,
    overtimeRatePerHour:   restaurant?.payrollSettings?.overtimeRatePerHour   ?? 50,
    salaryCalculationOn:   restaurant?.payrollSettings?.salaryCalculationOn   ?? '26', 
  };
};
