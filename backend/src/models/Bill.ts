import mongoose, { Document, Schema } from 'mongoose';

export interface IBill extends Document {
  restaurant: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  table: mongoose.Types.ObjectId;
  tableNumber: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  items: {
    menuItem: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    gstRate: number;
    itemTotal: number;
  }[];
  subtotal: number;
  cgst: number;
  sgst: number;
  totalTax: number;
  discount: number;
  serviceCharge: number;
  totalAmount: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'wallet' | 'razorpay';
  paymentStatus: 'pending' | 'paid' | 'partial';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  billNumber: string;
  createdBy: mongoose.Types.ObjectId;
  paidAt?: Date;
}

const BillSchema = new Schema<IBill>(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    table: {
      type: Schema.Types.ObjectId,
      ref: 'Table'
    },
    tableNumber: String,
    orderNumber: String,
    customerName: String,
    customerPhone: String,
    items: [
      {
        menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
        name: String,
        price: Number,
        quantity: Number,
        gstRate: { type: Number, default: 5 },
        itemTotal: Number
      }
    ],
    subtotal: { type: Number, required: true },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMode: {
      type: String,
      enum: ['cash', 'card', 'upi', 'wallet', 'razorpay'],
      default: 'cash'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partial'],
      default: 'pending'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    billNumber: {
      type: String,
      unique: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    paidAt: Date
  },
  { timestamps: true }
);

// Auto bill number generate
BillSchema.pre('save', async function () {
  if (!this.billNumber) {
    const count = await mongoose.model('Bill').countDocuments({
      restaurant: this.restaurant
    });
    this.billNumber = `BILL-${String(count + 1).padStart(4, '0')}`;
  }
});

export default mongoose.model<IBill>('Bill', BillSchema);
