import { User } from '../models/User';
import { Referral } from '../models/Referral';

export class ReferralService {
  /**
   * Convert pending referral when user makes a purchase
   * This awards credits to both referrer and referred user
   */
  static async convertReferralOnPurchase(userId: string, purchaseAmount: number): Promise<boolean> {
    try {
      console.log(`🛒 Converting referral for purchase by user: ${userId}, Amount: $${purchaseAmount}`);
      
      // Check if user has a pending referral
      const referral = await Referral.findOne({
        referred: userId,
        status: 'pending'
      });

      if (!referral) {
        console.log('ℹ️ No pending referral to convert for user:', userId);
        return false;
      }

      console.log('✅ Found pending referral:', referral._id);

      // Update referral status
      referral.status = 'converted';
      referral.convertedAt = new Date();
      referral.conversionType = 'purchase';
      referral.creditsAwarded = true;
      await referral.save();

      console.log('✅ Referral marked as converted');

      // Award credits to referrer
      const referrer = await User.findById(referral.referrer);
      if (referrer) {
        // Calculate credits based on purchase amount
        let creditsToAward = 2; // Base credits for any purchase
        
        // Bonus credits for larger purchases
        if (purchaseAmount >= 50) creditsToAward += 1;
        if (purchaseAmount >= 100) creditsToAward += 2;
        if (purchaseAmount >= 200) creditsToAward += 3;
        
        // Award credits to referrer
        referrer.credits += creditsToAward;
        referrer.successfulReferrals += 1;
        await referrer.save();
        
        console.log(`💰 Awarded ${creditsToAward} credits to referrer: ${referrer.email}`);
        console.log(`📊 Referrer ${referrer.email} now has ${referrer.credits} total credits`);
        
        // Award credits to referred user as well (optional bonus)
        const user = await User.findById(userId);
        if (user) {
          // Give half the credits to the referred user as incentive
          const userCredits = Math.floor(creditsToAward / 2);
          user.credits += userCredits;
          await user.save();
          
          console.log(`💰 Awarded ${userCredits} bonus credits to referred user: ${user.email}`);
          console.log(`📊 User ${user.email} now has ${user.credits} total credits`);
        }
      } else {
        console.error('❌ Referrer not found for referral:', referral._id);
      }

      console.log('✅ Referral conversion completed successfully');
      return true;
      
    } catch (error: any) {
      console.error('❌ Error converting referral:', error.message);
      return false;
    }
  }

  /**
   * Get referral leaderboard (top referrers)
   */
  static async getLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      console.log(`🏆 Getting leaderboard top ${limit}`);
      
      const topReferrers = await User.find()
        .sort({ successfulReferrals: -1, credits: -1 })
        .limit(limit)
        .select('name email referralCode successfulReferrals credits totalReferrals createdAt')
        .lean();

      console.log(`✅ Found ${topReferrers.length} top referrers`);

      return topReferrers.map((user, index) => ({
        rank: index + 1,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        successfulReferrals: user.successfulReferrals,
        totalReferrals: user.totalReferrals,
        credits: user.credits,
        conversionRate: user.totalReferrals > 0 
          ? ((user.successfulReferrals / user.totalReferrals) * 100).toFixed(1) 
          : '0.0',
        joined: new Date(user.createdAt).toLocaleDateString()
      }));
      
    } catch (error: any) {
      console.error('❌ Error getting leaderboard:', error.message);
      return [];
    }
  }

  /**
   * Get all referrals for a specific user
   */
  static async getUserReferrals(userId: string): Promise<any> {
    try {
      console.log(`📊 Getting referrals for user: ${userId}`);
      
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get referrals made by this user (as referrer)
      const referralsMade = await Referral.find({ referrer: userId })
        .populate('referred', 'name email createdAt credits')
        .sort({ createdAt: -1 })
        .lean();

      // Get referrals where this user was referred (as referred)
      const referredBy = await Referral.findOne({ referred: userId })
        .populate('referrer', 'name email referralCode')
        .lean();

      // Calculate stats
      const totalReferrals = referralsMade.length;
      const pendingReferrals = referralsMade.filter(r => r.status === 'pending').length;
      const convertedReferrals = referralsMade.filter(r => r.status === 'converted').length;
      const totalEarnedCredits = user.credits;

      console.log(`✅ Found ${totalReferrals} referrals for user ${user.email}`);

      return {
        user: {
          name: user.name,
          email: user.email,
          referralCode: user.referralCode,
          credits: user.credits,
          totalReferrals: user.totalReferrals,
          successfulReferrals: user.successfulReferrals
        },
        stats: {
          totalReferrals,
          pendingReferrals,
          convertedReferrals,
          totalEarnedCredits,
          conversionRate: totalReferrals > 0 ? ((convertedReferrals / totalReferrals) * 100).toFixed(1) : '0.0'
        },
        referralsMade: referralsMade.map(ref => ({
          referredUser: ref.referred,
          status: ref.status,
          creditsAwarded: ref.creditsAwarded,
          createdAt: ref.createdAt,
          convertedAt: ref.convertedAt,
          conversionType: ref.conversionType
        })),
        referredBy: referredBy ? {
          referrer: referredBy.referrer,
          status: referredBy.status,
          createdAt: referredBy.createdAt
        } : null,
        shareLink: `${process.env.CLIENT_URL || 'http://localhost:3000'}/register?ref=${user.referralCode}`,
        shareText: `Join using my referral code ${user.referralCode} and we both earn credits!`
      };
      
    } catch (error: any) {
      console.error('❌ Error getting user referrals:', error.message);
      throw error;
    }
  }

  /**
   * Manually award credits for a referral (admin function)
   */
  static async manuallyAwardCredits(referralId: string, credits: number = 2): Promise<boolean> {
    try {
      console.log(`👑 Manually awarding ${credits} credits for referral: ${referralId}`);
      
      const referral = await Referral.findById(referralId);
      if (!referral) {
        throw new Error('Referral not found');
      }

      if (referral.creditsAwarded) {
        console.log('⚠️ Credits already awarded for this referral');
        return false;
      }

      // Award credits to referrer
      const referrer = await User.findById(referral.referrer);
      if (referrer) {
        referrer.credits += credits;
        referrer.successfulReferrals += 1;
        await referrer.save();
      }

      // Award credits to referred user
      const referredUser = await User.findById(referral.referred);
      if (referredUser) {
        referredUser.credits += Math.floor(credits / 2);
        await referredUser.save();
      }

      // Update referral
      referral.status = 'converted';
      referral.convertedAt = new Date();
      referral.conversionType = 'manual';
      referral.creditsAwarded = true;
      referral.creditsAmount = credits;
      await referral.save();

      console.log(`✅ Manually awarded ${credits} credits for referral ${referralId}`);
      return true;
      
    } catch (error: any) {
      console.error('❌ Error manually awarding credits:', error.message);
      return false;
    }
  }

  /**
   * Check if a user is eligible for referral conversion
   */
  static async checkReferralEligibility(userId: string): Promise<{
    eligible: boolean;
    referral?: any;
    message: string;
  }> {
    try {
      const referral = await Referral.findOne({
        referred: userId,
        status: 'pending'
      });

      if (!referral) {
        return {
          eligible: false,
          message: 'No pending referral found'
        };
      }

      // Check if referral is expired (30 days)
      const referralAge = Date.now() - new Date(referral.createdAt).getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      
      if (referralAge > thirtyDays) {
        referral.status = 'expired';
        await referral.save();
        
        return {
          eligible: false,
          referral,
          message: 'Referral has expired (30 days)'
        };
      }

      return {
        eligible: true,
        referral,
        message: 'Referral is eligible for conversion'
      };
      
    } catch (error: any) {
      console.error('❌ Error checking referral eligibility:', error.message);
      return {
        eligible: false,
        message: 'Error checking eligibility'
      };
    }
  }

  /**
   * Generate referral report for admin
   */
  static async generateReport(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      console.log('📈 Generating referral report');
      
      const filter: any = {};
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = startDate;
        if (endDate) filter.createdAt.$lte = endDate;
      }

      const referrals = await Referral.find(filter)
        .populate('referrer', 'name email')
        .populate('referred', 'name email')
        .sort({ createdAt: -1 })
        .lean();

      // Calculate totals
      const totalReferrals = referrals.length;
      const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
      const convertedReferrals = referrals.filter(r => r.status === 'converted').length;
      const expiredReferrals = referrals.filter(r => r.status === 'expired').length;
      
      const totalCreditsAwarded = referrals
        .filter(r => r.creditsAwarded)
        .reduce((sum, r) => sum + (r.creditsAmount || 2), 0);

      return {
        period: {
          startDate: startDate || 'All time',
          endDate: endDate || 'Now'
        },
        summary: {
          totalReferrals,
          pendingReferrals,
          convertedReferrals,
          expiredReferrals,
          conversionRate: totalReferrals > 0 ? ((convertedReferrals / totalReferrals) * 100).toFixed(1) : '0.0',
          totalCreditsAwarded
        },
        referrals: referrals.slice(0, 50), // Limit to 50 for performance
        generatedAt: new Date().toISOString()
      };
      
    } catch (error: any) {
      console.error('❌ Error generating report:', error.message);
      throw error;
    }
  }
}