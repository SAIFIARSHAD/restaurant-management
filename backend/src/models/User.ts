import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'manager' | 'kitchen' | 'waiter';
  restaurant?: mongoose.Types.ObjectId;  
  isActive: boolean;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'manager', 'kitchen', 'waiter'],
      default: 'admin',
    },
    restaurant: {                                    
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null                                  
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Password hash before save
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password as string, 12);
});

// Password compare method
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
