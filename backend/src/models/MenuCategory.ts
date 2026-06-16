import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuCategory extends Document {
  name: string;
  description?: string;
  image?: string;
  restaurant: mongoose.Types.ObjectId;
  sortOrder: number;
  isActive: boolean;
}

const MenuCategorySchema = new Schema<IMenuCategory>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMenuCategory>('MenuCategory', MenuCategorySchema);
