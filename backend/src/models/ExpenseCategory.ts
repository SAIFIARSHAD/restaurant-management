import mongoose, { Document, Schema } from 'mongoose';

export interface IExpenseCategory extends Document {
  restaurant: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
}

const ExpenseCategorySchema = new Schema<IExpenseCategory>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IExpenseCategory>('ExpenseCategory', ExpenseCategorySchema);
