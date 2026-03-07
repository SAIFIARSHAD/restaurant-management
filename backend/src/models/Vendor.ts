import mongoose, { Document, Schema } from 'mongoose';

export interface IVendor extends Document {
  restaurant: mongoose.Types.ObjectId;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  materials: mongoose.Types.ObjectId[];  
  isActive: boolean;
}

const VendorSchema = new Schema<IVendor>(
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
    contactPerson: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      trim: true
    },
    address: {
      type: String
    },
    materials: [
      {
        type: Schema.Types.ObjectId,
        ref: 'RawMaterial'
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<IVendor>('Vendor', VendorSchema);
