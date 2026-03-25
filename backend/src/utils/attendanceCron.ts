// backend/src/utils/attendanceCron.ts
import cron from 'node-cron';
import Attendance from '../models/Attendance';
import Restaurant from '../models/Restaurant';

export const startAttendanceCron = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      // lastHeartbeat older than 5 min — active sessions
      const staleAttendances = await Attendance.find({
        status:        'active',
        lastHeartbeat: { $lt: fiveMinutesAgo },
      });

      for (const attendance of staleAttendances) {
        // Active session dhundo (logoutTime nahi hai jo)
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

        // Sab sessions ka total minutes calculate karo
        const totalMinutes = attendance.sessions.reduce(
          (sum, s) => sum + (s.durationMinutes || 0), 0
        );

        // Restaurant payroll settings fetch karo
        const restaurant      = await Restaurant.findById(attendance.restaurant);
        const payrollSettings = restaurant?.payrollSettings ?? {
          shiftHours:            9,
          halfDayThreshold:      4.5,
          overtimeBufferMinutes: 20,
        };

        // Day status calculate karo
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
