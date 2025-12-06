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
    enum: ['pending', 'converted', 'expired'],
    default: 'pending'
  },
  creditsAwarded: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  convertedAt: {
    type: Date
  }
});

// Create compound index to prevent duplicate referrals
ReferralSchema.index({ referrer: 1, referred: 1 }, { unique: true });

export const Referral = mongoose.model('Referral', ReferralSchema);