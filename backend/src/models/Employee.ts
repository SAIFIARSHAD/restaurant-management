import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  restaurant: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  role: 'manager' | 'cashier' | 'kitchen' | 'waiter' | 'delivery';
  salary: number;
  salaryType: 'monthly' | 'daily' | 'hourly';
  joiningDate: Date;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  isActive: boolean;
  userId: mongoose.Types.ObjectId; 
  createdAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ['manager', 'cashier', 'kitchen', 'waiter', 'delivery'],
      required: true,
    },
    salary: { type: Number, required: true },
    salaryType: {
      type: String,
      enum: ['monthly', 'daily', 'hourly'],
      default: 'monthly',
    },
    joiningDate: { type: Date, required: true },
    bankDetails: {
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' },
    },
    isActive: { type: Boolean, default: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
