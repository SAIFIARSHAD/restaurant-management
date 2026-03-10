import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  restaurant: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  date: Date;
  paymentMethod: 'cash' | 'bank' | 'upi' | 'card' | 'other';
  note?: string;
  addedBy: mongoose.Types.ObjectId;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'ExpenseCategory', required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank', 'upi', 'card', 'other'],
      default: 'cash',
    },
    note: { type: String, trim: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
