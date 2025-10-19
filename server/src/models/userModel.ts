import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

// Extend the IUser interface for internal use
interface IUserInternal extends IUser {
  _skipPasswordHashing?: boolean;
  profileImage?: string;
}

const userSchema = new Schema<IUserInternal>({
  // Basic info
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },
  displayName: { type: String, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  secondaryEmail: { 
    type: String, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone: { 
    type: String, 
    trim: true, 
    match: [/^\+?[0-9]{7,15}$/, 'Please enter a valid phone number']
  },
  country: { type: String, trim: true },
  state: { type: String, trim: true },
  zipCode: { type: String, trim: true },
  profileImage: { type: String, trim: true },

  // Authentication
  password: { type: String, required: true, select: false }, // Hashed password (select: false hides it by default)
  name: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  otp: { type: String },
  otpExpires: { type: Date },
  lastLogin: { type: Date, default: Date.now },
  
  // Email verification
  verificationToken: String,
  verificationTokenExpiresAt: Date,

  // Address book
  addresses: [{
    label: { type: String, default: 'Home' },
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }],

  // Orders reference
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],

  // Wishlist reference
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],

  // Gifts reference
  gifts: [{ type: Schema.Types.ObjectId, ref: 'GiftCard' }],

  // Account status
  isActive: { type: Boolean, default: true },

  // Security
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  resetPasswordExpiresAt: Date, // For compatibility with new auth system

  // Rewards and offers
  availableOffers: { type: Number, default: 0 }

}, {
  timestamps: true
});

// Pre-save: hash password if modified
userSchema.pre('save', async function(this: IUserInternal, next) {
  // Skip hashing if the internal flag is set
  if (this._skipPasswordHashing) {
    delete this._skipPasswordHashing; // Remove the flag
    return next();
  }
  
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Method: check password validity
userSchema.methods.comparePassword = async function(this: IUser, candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add a static method to set password correctly
userSchema.statics.setPassword = async function(userId: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return this.findByIdAndUpdate(userId, { password: hashedPassword });
};

// Index for faster email search
userSchema.index({ email: 1 });

const UserModel = mongoose.model<IUserInternal, mongoose.Model<IUserInternal> & { setPassword: (userId: string, password: string) => Promise<IUserInternal | null> }>('User', userSchema);

export { UserModel };
export default UserModel;
