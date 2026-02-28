import mongoose, { Document, Schema } from 'mongoose';

export interface ITable extends Document {
  restaurant: mongoose.Types.ObjectId;
  tableNumber: string;
  capacity: number;
  floor?: string;
  status: 'available' | 'occupied' | 'reserved' | 'inactive';
  qrCode: string;
  qrCodeUrl: string;
  isActive: boolean;
}

const TableSchema = new Schema<ITable>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableNumber: { type: String, required: true },
    capacity: { type: Number, default: 4 },
    floor: { type: String, default: 'Ground' },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'inactive'],
      default: 'available',
    },
    qrCode: { type: String, default: '' },
    qrCodeUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITable>('Table', TableSchema);
