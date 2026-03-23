import mongoose, { Document, Schema } from 'mongoose';

export type LogType = 'add' | 'remove' | 'wastage' | 'expiry' | 'auto_deduct';

export interface IRawMaterialLog extends Document {
  restaurant: mongoose.Types.ObjectId;
  rawMaterial: mongoose.Types.ObjectId;
  type: LogType;
  quantity: number;
  unit: string;
  previousStock: number;
  newStock: number;
  reason?: string;
  createdBy?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;  
  createdAt: Date;
}

const RawMaterialLogSchema = new Schema<IRawMaterialLog>(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    rawMaterial: {
      type: Schema.Types.ObjectId,
      ref: 'RawMaterial',
      required: true
    },
    type: {
      type: String,
      enum: ['add', 'remove', 'wastage', 'expiry', 'auto_deduct'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    previousStock: {
      type: Number,
      required: true
    },
    newStock: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      trim: true,
      default: ''
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      default: null  
    }
  },
  { timestamps: true }
);


RawMaterialLogSchema.index({ restaurant: 1, createdAt: -1 });
RawMaterialLogSchema.index({ rawMaterial: 1, createdAt: -1 });
RawMaterialLogSchema.index({ type: 1 });

export default mongoose.model<IRawMaterialLog>('RawMaterialLog', RawMaterialLogSchema);
