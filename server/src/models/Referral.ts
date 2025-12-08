import mongoose from 'mongoose';

const ReferralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'converted', 'expired', 'completed'],
    default: 'pending'
  },
  creditsAwarded: {
    type: Boolean,
    default: false
  },
  creditsAmount: {
    type: Number,
    default: 2 // Default 2 credits per successful referral
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  convertedAt: {
    type: Date
  },
  // Track what action triggered conversion (purchase, verification, etc.)
  conversionType: {
    type: String,
    enum: ['registration', 'purchase', 'verification', 'manual'],
    default: 'registration'
  }
});

// Create compound index to prevent duplicate referrals
ReferralSchema.index({ referrer: 1, referred: 1 }, { unique: true });

// Create index for faster queries
ReferralSchema.index({ referrer: 1, status: 1 });
ReferralSchema.index({ referred: 1 });

export const Referral = mongoose.model('Referral', ReferralSchema);