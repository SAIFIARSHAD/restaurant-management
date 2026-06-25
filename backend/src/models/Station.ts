import mongoose, { Document, Schema } from 'mongoose';

export interface IStation extends Document {
  name: string;
  stationType: string;
  color: string;
  restaurant: mongoose.Types.ObjectId;
  isActive: boolean;
}

const StationSchema = new Schema<IStation>(
  {
    name: { type: String, required: true, trim: true },
    stationType: {
      type: String,
      required: true,
      enum: ['grill', 'drinks', 'kitchen', 'dessert', 'other'],
      default: 'kitchen',
    },
    color: { type: String, default: '#6366f1' },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IStation>('Station', StationSchema);