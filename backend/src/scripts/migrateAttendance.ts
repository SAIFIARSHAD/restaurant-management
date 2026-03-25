import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('MongoDB Connected');

  const db = mongoose.connection.db!;
  const collection = db.collection('attendances');

  // Purane documents — jinme sessions array nahi hai
  const oldDocs = await collection.find({
    sessions: { $exists: false },
  }).toArray();

  console.log(`Found ${oldDocs.length} old attendance documents`);

  let migrated = 0;

  for (const doc of oldDocs) {
    const loginTime  = doc.loginTime  ? new Date(doc.loginTime)  : null;
    const logoutTime = doc.logoutTime ? new Date(doc.logoutTime) : null;

    // Duration calculate karo
    let durationMinutes = doc.shiftDuration || 0;
    if (loginTime && logoutTime && !durationMinutes) {
      durationMinutes = Math.floor(
        (logoutTime.getTime() - loginTime.getTime()) / 60000
      );
    }

    // Session object banao
    const sessions = loginTime
      ? [{
          loginTime,
          logoutTime:      logoutTime ?? undefined,
          durationMinutes,
          loginIp:         doc.loginIp || '0.0.0.0',
        }]
      : [];

    const totalMinutes    = durationMinutes;
    const overtimeMinutes = doc.overtimeMinutes || 0;

    // dayStatus decide karo
    const totalHours = totalMinutes / 60;
    let dayStatus: string;
    if      (totalHours >= 9)   dayStatus = 'present';
    else if (totalHours >= 4.5) dayStatus = 'half-day';
    else                        dayStatus = 'absent';

    // Agar logoutTime nahi hai aur status active tha
    const status = doc.status === 'active' && !logoutTime
      ? 'auto-logout'
      : (doc.status || 'completed');

    await collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          sessions,
          totalMinutes,
          overtimeMinutes,
          dayStatus,
          status,
          lastHeartbeat: doc.lastHeartbeat || doc.loginTime || new Date(),
        },
        $unset: {
          loginTime:     '',
          logoutTime:    '',
          shiftDuration: '',
          loginIp:       '',
        },
      }
    );

    migrated++;
  }

  console.log(`✅ Migration complete — ${migrated} documents migrated`);
  await mongoose.disconnect();
};

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
