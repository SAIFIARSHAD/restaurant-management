import mongoose, { Document, Schema } from 'mongoose';

export interface IStation extends Document {
  restaurant: mongoose.Types.ObjectId;
  name: string;
  type: 'grill' | 'drinks' | 'kitchen' | 'dessert' | 'other';
  isActive: boolean;
}

const StationSchema = new Schema<IStation>(
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
    type: {
      type: String,
      enum: ['grill', 'drinks', 'kitchen', 'dessert', 'other'],
      default: 'kitchen'
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

export default mongoose.model<IStation>('Station', StationSchema);
