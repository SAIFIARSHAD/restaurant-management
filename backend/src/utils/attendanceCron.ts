import cron from 'node-cron';
import Attendance from '../models/Attendance';
import { getShiftSettings } from './shiftSettingsHelper';


export const startAttendanceCron = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      
      const staleAttendances = await Attendance.find({
        status:        'active',
        lastHeartbeat: { $lt: fiveMinutesAgo },
      });

      for (const attendance of staleAttendances) {
        
        const activeSession = attendance.sessions
          .slice()
          .reverse()
          .find(s => !s.logoutTime);

        if (activeSession) {
          const logoutTime     = attendance.lastHeartbeat;
          const sessionMinutes = Math.floor(
            (logoutTime.getTime() - new Date(activeSession.loginTime).getTime()) / 60000
          );
          activeSession.logoutTime      = logoutTime;
          activeSession.durationMinutes = sessionMinutes;
        }

        
        const totalMinutes = attendance.sessions.reduce(
          (sum, s) => sum + (s.durationMinutes || 0), 0
        );

        
       const payrollSettings = await getShiftSettings(
        attendance.restaurant.toString(),
        attendance.employee.toString()
      );

        
        const totalHours        = totalMinutes / 60;
        const overtimeThreshold = payrollSettings.shiftHours * 60 + payrollSettings.overtimeBufferMinutes;

        let dayStatus: 'present' | 'half-day' | 'absent' = 'absent';
        if (totalHours >= payrollSettings.shiftHours) {
          dayStatus = 'present';
        } else if (totalHours >= payrollSettings.halfDayThreshold) {
          dayStatus = 'half-day';
        }

        const overtimeMinutes = totalMinutes > overtimeThreshold
          ? Math.floor(totalMinutes - overtimeThreshold)
          : 0;

        attendance.totalMinutes    = totalMinutes;
        attendance.overtimeMinutes = overtimeMinutes;
        attendance.dayStatus       = dayStatus;
        attendance.status          = 'auto-logout';
        await attendance.save();
      }

      if (staleAttendances.length > 0) {
        console.log(`Auto-logout: ${staleAttendances.length} employees`);
      }
    } catch (error) {
      console.error('Cron error:', error);
    }
  });

  console.log('Attendance Cron Job Started');
};
