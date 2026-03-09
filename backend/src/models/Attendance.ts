import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  restaurant: mongoose.Types.ObjectId;
  employee: mongoose.Types.ObjectId;
  date: Date;
  loginTime: Date;
  logoutTime?: Date;
  lastHeartbeat: Date;
  loginIp: string;
  shiftDuration?: number;   
  overtimeMinutes?: number; 
  status: 'active' | 'completed' | 'auto-logout';
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    loginTime: { type: Date, required: true },
    logoutTime: { type: Date },
    lastHeartbeat: { type: Date, required: true },
    loginIp: { type: String, required: true },
    shiftDuration: { type: Number, default: 0 },      
    overtimeMinutes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'completed', 'auto-logout'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
