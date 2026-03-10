import mongoose, { Document, Schema } from 'mongoose';

export interface IPayroll extends Document {
  restaurant: mongoose.Types.ObjectId;
  employee: mongoose.Types.ObjectId;
  month: number;
  year: number;
  basicSalary: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  overtimeHours: number;
  overtimePay: number;
  earnedSalary: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'paid';
  paidAt?: Date;
  paidBy?: mongoose.Types.ObjectId;
}

const PayrollSchema = new Schema<IPayroll>(
  {
    restaurant: { 
      type: Schema.Types.ObjectId, 
      ref: 'Restaurant', 
      required: true 
    },
    employee: { 
      type: Schema.Types.ObjectId, 
      ref: 'Employee', 
      required: true 
    },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    workingDays: { type: Number, required: true },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    overtimePay: { type: Number, default: 0 },
    earnedSalary: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['pending', 'paid'], 
      default: 'pending' 
    },
    paidAt: { type: Date },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);


PayrollSchema.index(
  { employee: 1, month: 1, year: 1 }, 
  { unique: true }
);

export default mongoose.model<IPayroll>('Payroll', PayrollSchema);
