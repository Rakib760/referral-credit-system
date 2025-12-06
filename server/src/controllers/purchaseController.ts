import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Purchase } from '../models/Purchase';
import { User } from '../models/User';
import { Referral } from '../models/Referral';

export class PurchaseController {
  // Create purchase and award credits
  static async createPurchase(req: Request, res: Response) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const userId = (req as any).userId;
      const { productId, productName, amount } = req.body;

      console.log('🛒 Purchase attempt:', { userId, productName, amount });

      // Validate user
      const user = await User.findById(userId).session(session);
      if (!user) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if this is user's first purchase
      const existingPurchases = await Purchase.find({ user: userId }).session(session);
      const isFirstPurchase = existingPurchases.length === 0;

      console.log('📊 Purchase info:', {
        userId,
        isFirstPurchase,
        existingPurchases: existingPurchases.length
      });

      // Create purchase record
      const purchase = new Purchase({
        user: userId,
        productId,
        productName,
        amount,
        referralCreditsAwarded: false
      });

      // Award referral credits if this is first purchase
      let referralCreditsAwarded = false;
      let referralDetails = null;

      if (isFirstPurchase) {
        console.log('🎯 First purchase detected, checking for referrals...');

        // Find pending referral for this user
        const referral = await Referral.findOne({
          referred: userId,
          status: 'pending',
          creditsAwarded: false
        })
          .populate('referrer')
          .session(session);

        console.log('🔍 Found referral:', referral ? 'Yes' : 'No');

        if (referral && referral.referrer) {
          const referrer = referral.referrer as any;

          console.log('💰 Awarding credits to referrer:', referrer.email);

          // Award credits to referrer (2 credits)
          referrer.credits = (referrer.credits || 0) + 2;
          await referrer.save({ session });

          // Award credits to referred user (2 credits)
          user.credits = (user.credits || 0) + 2;
          await user.save({ session });

          // Update referral status
          referral.status = 'converted';
          referral.creditsAwarded = true;
          referral.convertedAt = new Date();
          await referral.save({ session });

          // Update purchase record
          purchase.referralCreditsAwarded = true;

          referralCreditsAwarded = true;
          referralDetails = {
            referrerId: referrer._id,
            referrerEmail: referrer.email,
            creditsAwarded: 2
          };

          console.log('🎉 Credits awarded!', {
            referrer: referrer.email,
            referred: user.email,
            referrerCredits: referrer.credits,
            userCredits: user.credits
          });
        } else {
          console.log('ℹ️ No pending referral found or credits already awarded');
        }
      }

      await purchase.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Get updated user data
      const updatedUser = await User.findById(userId);

      console.log('✅ Purchase completed successfully');
      console.log('📊 Final user credits:', updatedUser?.credits);

      res.json({
        success: true,
        message: referralCreditsAwarded
          ? 'Purchase completed! 🎉 You earned 2 credits!'
          : 'Purchase completed successfully!',
        purchase: {
          id: purchase._id,
          productName: purchase.productName,
          amount: purchase.amount,
          referralCreditsAwarded: purchase.referralCreditsAwarded,
          createdAt: purchase.createdAt
        },
        user: {
          id: updatedUser?._id,
          email: updatedUser?.email,
          name: updatedUser?.name,
          credits: updatedUser?.credits || 0,
          referralCode: updatedUser?.referralCode
        },
        referral: referralDetails
      });

    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();

      console.error('❌ Purchase error:', error);
      res.status(500).json({
        success: false,
        error: 'Purchase failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get purchase history
  static async getPurchaseHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const purchases = await Purchase.find({ user: userId })
        .sort({ createdAt: -1 })
        .lean();

      res.json({
        success: true,
        purchases
      });
    } catch (error: any) {
      console.error('❌ Get purchase history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get purchase history',
        message: error.message
      });
    }
  }
}