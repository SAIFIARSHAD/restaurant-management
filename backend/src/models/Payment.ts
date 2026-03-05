import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  orderId: string;
  paymentId: string;
  signature: string;
  amount: number;
  currency: string;
  status: 'created' | 'verified' | 'failed';
  restaurantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: String, required: true },
    paymentId: { type: String, default: '' },
    signature: { type: String, default: '' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'verified', 'failed'],
      default: 'created',
    },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
