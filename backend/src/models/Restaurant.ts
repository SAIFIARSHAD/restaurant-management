import mongoose, { Document, Schema } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  slug: string;
  owner: mongoose.Types.ObjectId;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  logo?: string;
  coverImage?: string;
  cuisine: string[];
  isActive: boolean;
  subscription: {
    plan: 'free' | 'basic' | 'premium';
    expiresAt: Date;
  };
  settings: {
    currency: string;
    timezone: string;
    taxRate: number;
    serviceCharge: number;
  };
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    logo: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    cuisine: [{ type: String }],
    isActive: { type: Boolean, default: true },
    subscription: {
      plan: { type: String, enum: ['free', 'basic', 'premium'], default: 'free' },
      expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    },
    settings: {
      currency: { type: String, default: 'INR' },
      timezone: { type: String, default: 'Asia/Kolkata' },
      taxRate: { type: Number, default: 18 },
      serviceCharge: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
