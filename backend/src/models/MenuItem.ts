import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  image?: string;
  category: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  isVeg: boolean;
  isAvailable: boolean;
  preparationTime: number;
  tags: string[];
  customizations: {
    name: string;
    options: {
      label: string;
      price: number;
    }[];
  }[];
  sortOrder: number;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, default: null },
    image: { type: String, default: '' },
    category: { type: Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number, default: 15 },
    tags: [{ type: String }],
    customizations: [
      {
        name: { type: String },
        options: [
          {
            label: { type: String },
            price: { type: Number, default: 0 },
          },
        ],
      },
    ],
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
