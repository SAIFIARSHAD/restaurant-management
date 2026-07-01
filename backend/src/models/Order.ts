import mongoose, { Document, Schema } from 'mongoose';

export type StationType = 'grill' | 'drinks' | 'kitchen' | 'dessert' | 'other';

export type OrderItemStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled'
  | 'billed';

export interface IOrderItem {
  menuItem: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  station?: StationType;
  status: OrderItemStatus;
  startedAt?: Date;
  readyAt?: Date;
  servedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export interface IOrder extends Document {
  restaurant: mongoose.Types.ObjectId;
  table: mongoose.Types.ObjectId;
  tableNumber: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  items: IOrderItem[];
  status: OrderStatus;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'upi';
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  notes?: string;
  cancellationReason?: string;
  createdBy?: mongoose.Types.ObjectId | null;
  servedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: '' },
    station: {
      type: String,
      enum: ['grill', 'drinks', 'kitchen', 'dessert', 'other'],
      default: 'kitchen',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'preparing', 'ready', 'served', 'cancelled'],
      default: 'pending',
    },
    startedAt: { type: Date },
    readyAt: { type: Date },
    servedAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String, default: '' },
  },
  { _id: true }
);

const OrderSchema = new Schema<IOrder>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    table: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
    tableNumber: { type: String, required: true, trim: true },
    orderNumber: { type: String, unique: true, sparse: true, trim: true },
    customerName: { type: String, default: '', trim: true },
    customerPhone: { type: String, default: '', trim: true },
    items: {
      type: [OrderItemSchema],
      default: [],
      validate: {
        validator: (items: IOrderItem[]) => Array.isArray(items) && items.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'preparing', 'ready', 'served', 'cancelled', 'billed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi'],
    },
    subtotal: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: '', trim: true },
    cancellationReason: { type: String, default: '', trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    servedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);