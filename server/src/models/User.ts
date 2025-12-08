import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  referralCode: string;
  credits: number;
  referredBy: mongoose.Types.ObjectId; // Track who referred this user
  totalReferrals: number; // Track total referrals made
  successfulReferrals: number; // Track successful conversions
  isVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  referralCode: {
    type: String,
    unique: true,
    default: function() {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `REF-${timestamp}-${randomStr}`.toUpperCase();
    }
  },
  credits: {
    type: Number,
    default: 0
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  totalReferrals: {
    type: Number,
    default: 0
  },
  successfulReferrals: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook
UserSchema.pre('save', async function() {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      throw error;
    }
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Export model
export const User = mongoose.model<IUser>('User', UserSchema);