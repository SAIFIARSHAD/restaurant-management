import cron from 'node-cron';
import Attendance from '../models/Attendance';

// Run After 5 Min
export const startAttendanceCron = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      // lastHeartbeat older than 5 min 
      const staleAttendances = await Attendance.find({
        status: 'active',
        lastHeartbeat: { $lt: fiveMinutesAgo },
      });

      for (const attendance of staleAttendances) {
        const logoutTime = attendance.lastHeartbeat; 
        const loginTime = new Date(attendance.loginTime);
        const shiftDuration = Math.floor(
          (logoutTime.getTime() - loginTime.getTime()) / 60000
        );
        const overtimeMinutes = shiftDuration > 480 ? shiftDuration - 480 : 0;

        await Attendance.findByIdAndUpdate(attendance._id, {
          $set: {
            logoutTime,
            shiftDuration,
            overtimeMinutes,
            status: 'auto-logout',
          },
        });
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
