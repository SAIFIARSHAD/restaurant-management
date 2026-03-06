import mongoose, { Document, Schema } from 'mongoose';

export interface IRawMaterial extends Document {
  restaurant: mongoose.Types.ObjectId;
  name: string;
  unit: 'kg' | 'g' | 'litre' | 'ml' | 'piece' | 'dozen' | 'packet';
  currentStock: number;
  minThreshold: number;
  unitCost: number;
  supplier?: string;
  lastPurchaseDate?: Date;
  isActive: boolean;
}

const RawMaterialSchema = new Schema<IRawMaterial>(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    unit: {
      type: String,
      enum: ['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'packet'],
      required: true
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0
    },
    minThreshold: {
      type: Number,
      required: true,
      default: 0
    },
    unitCost: {
      type: Number,
      required: true,
      default: 0
    },
    supplier: {
      type: String,
      trim: true
    },
    lastPurchaseDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<IRawMaterial>('RawMaterial', RawMaterialSchema);
