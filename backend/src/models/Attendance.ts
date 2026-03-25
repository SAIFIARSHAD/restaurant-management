import mongoose, { Document, Schema } from 'mongoose';

export interface ISession {
  loginTime: Date;
  logoutTime?: Date;
  durationMinutes: number;
  loginIp: string;
}

export interface IAttendance extends Document {
  restaurant: mongoose.Types.ObjectId;
  employee: mongoose.Types.ObjectId;
  date: Date;                                          
  sessions: ISession[];                                
  totalMinutes: number;                                
  overtimeMinutes: number;
  dayStatus: 'present' | 'half-day' | 'absent';
  lastHeartbeat: Date;
  status: 'active' | 'completed' | 'auto-logout';
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    loginTime:       { type: Date, required: true },
    logoutTime:      { type: Date },
    durationMinutes: { type: Number, default: 0 },
    loginIp:         { type: String, required: true },
  },
  { _id: false }
);

const AttendanceSchema = new Schema<IAttendance>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    employee:   { type: Schema.Types.ObjectId, ref: 'Employee',   required: true },
    date:       { type: Date, required: true },         
    sessions:         { type: [SessionSchema], default: [] },
    totalMinutes:     { type: Number, default: 0 },
    overtimeMinutes:  { type: Number, default: 0 },
    dayStatus: {
      type: String,
      enum: ['present', 'half-day', 'absent'],
      default: 'absent',
    },
    lastHeartbeat: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'auto-logout'],
      default: 'active',
    },
  },
  { timestamps: true }
);


AttendanceSchema.index(
  { restaurant: 1, employee: 1, date: 1 },
  { unique: true }
);

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
