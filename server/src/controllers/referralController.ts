import { Request, Response } from 'express';
import { Referral } from '../models/Referral';
import { User } from '../models/User';
import mongoose from 'mongoose';

export class ReferralController {
  // Get referral stats
  static async getStats(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      console.log('📊 Fetching stats for user:', userId);

      // Get user first to get current credits
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get counts
      const [totalReferred, convertedReferrals] = await Promise.all([
        Referral.countDocuments({ referrer: userId }),
        Referral.find({
          referrer: userId,
          status: 'converted',
          creditsAwarded: true
        })
      ]);

      const convertedUsers = convertedReferrals.length;
      const totalCreditsEarned = convertedUsers * 2; // 2 credits per conversion

      console.log('📈 Stats calculated:', {
        totalReferred,
        convertedUsers,
        totalCreditsEarned,
        userCredits: user.credits
      });

      res.json({
        success: true,
        stats: {
          totalReferred,
          convertedUsers,
          totalCreditsEarned,
          currentCredits: user.credits || 0,
          referralCode: user.referralCode || ''
        }
      });
    } catch (error: any) {
      console.error('❌ Get referral stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get referral stats',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get referral history
  static async getHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      console.log('📋 Fetching referral history for user:', userId);

      const referrals = await Referral.find({ referrer: userId })
        .populate('referred', 'email name createdAt')
        .sort({ createdAt: -1 })
        .lean();

      console.log(`📋 Found ${referrals.length} referrals`);

      const formattedReferrals = referrals.map(ref => ({
        referredEmail: (ref.referred as any)?.email || 'Unknown',
        referredName: (ref.referred as any)?.name || 'Unknown',
        status: ref.status,
        createdAt: ref.createdAt,
        convertedAt: ref.convertedAt,
        creditsAwarded: ref.creditsAwarded,
        credits: ref.creditsAwarded ? 2 : 0
      }));

      res.json({
        success: true,
        referrals: formattedReferrals
      });
    } catch (error: any) {
      console.error('❌ Get referral history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get referral history',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}