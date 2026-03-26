import mongoose, { Document, Schema } from 'mongoose';
export interface IShiftTemplate {
  _id: mongoose.Types.ObjectId;
  name: string;
  shiftStartTime: string;
  shiftEndTime: string;
  shiftHours: number;
  halfDayThreshold: number;
  overtimeBufferMinutes: number;
  overtimeRatePerHour: number;
  salaryCalculationOn:   '22' | '24' | '26' | '28' | '30' | '31' | 'actual'; 
  isDefault: boolean;
}

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
  networkConfig?: {
    ipRange: string;
    allowedIp: string;
    lastUpdated?: Date;
    updatedBy?: mongoose.Types.ObjectId;
  };
  payrollSettings: {
    salaryCalculationOn: '22' | '24' | '26' | '28' | '30' | '31' | 'actual';
    shiftStartTime: string;
    shiftEndTime: string;
    shiftHours: number;
    halfDayThreshold: number;
    overtimeBufferMinutes: number;
    overtimeRatePerHour: number;
  };
  shiftTemplates: IShiftTemplate[];   
}


const ShiftTemplateSchema = new Schema<IShiftTemplate>(
  {
    name:                  { type: String, required: true, trim: true },
    shiftStartTime:        { type: String, required: true },
    shiftEndTime:          { type: String, required: true },
    shiftHours:            { type: Number, required: true },
    halfDayThreshold:      { type: Number, default: 4.5  },
    overtimeBufferMinutes: { type: Number, default: 20   },
    overtimeRatePerHour:   { type: Number, default: 50   },
    salaryCalculationOn:   { type:    String, enum:    ['22', '24', '26', '28', '30', '31', 'actual'], default: '26' },
    isDefault:             { type: Boolean, default: false },
  },
  { _id: true }
);

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name:       { type: String, required: true, trim: true },
    slug:       { type: String, required: true, unique: true, lowercase: true },
    owner:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
    email:      { type: String, required: true },
    phone:      { type: String, required: true },
    address: {
      street:  { type: String, default: '' },
      city:    { type: String, default: '' },
      state:   { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    logo:       { type: String, default: '' },
    coverImage: { type: String, default: '' },
    cuisine:    [{ type: String }],
    isActive:   { type: Boolean, default: true },
    subscription: {
      plan:      { type: String, enum: ['free', 'basic', 'premium'], default: 'free' },
      expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    },
    settings: {
      currency:      { type: String, default: 'INR' },
      timezone:      { type: String, default: 'Asia/Kolkata' },
      taxRate:       { type: Number, default: 18 },
      serviceCharge: { type: Number, default: 0  },
    },
    networkConfig: {
      ipRange:     { type: String, default: '' },
      allowedIp:   { type: String, default: '' },
      lastUpdated: { type: Date },
      updatedBy:   { type: Schema.Types.ObjectId, ref: 'User' },
    },
    payrollSettings: {
      salaryCalculationOn: {
        type:    String,
        enum:    ['22', '24', '26', '28', '30', '31', 'actual'],
        default: '26',
      },
      shiftStartTime:        { type: String,  default: '09:00' },
      shiftEndTime:          { type: String,  default: '18:00' },
      shiftHours:            { type: Number,  default: 9       },
      halfDayThreshold:      { type: Number,  default: 4.5     },
      overtimeBufferMinutes: { type: Number,  default: 20      },
      overtimeRatePerHour:   { type: Number,  default: 50      },
    },
    shiftTemplates: { type: [ShiftTemplateSchema], default: [] },  
  },
  { timestamps: true }
);

export default mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
