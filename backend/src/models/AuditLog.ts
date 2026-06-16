import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  restaurant: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  userName: string;
  role: string;
  action: string;       
  module: string;       
  description: string;
  ipAddress: string;
  statusCode: number;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    role: String,
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW'],
      required: true
    },
    module: { type: String, required: true },
    description: { type: String, required: true },
    ipAddress: String,
    statusCode: Number
  },
  { timestamps: true }
);

// After 90 days auto delete
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
