import express from 'express';
import { ReferralService } from '../services/referralService';
import { authMiddleware } from '../middleware/auth';
import { User } from '../models/User';

const router = express.Router();

// Get referral stats (protected) - Using ReferralService directly
router.get('/stats', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'Not authenticated' 
      });
    }

    // Get referral data from ReferralService
    const referralsData = await ReferralService.getUserReferrals(userId);
    
    res.json({
      success: true,
      ...referralsData
    });
    
  } catch (error: any) {
    console.error('❌ Get referral stats error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get referral stats'
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await ReferralService.getLeaderboard(10);
    res.json({
      success: true,
      leaderboard,
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Leaderboard error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get leaderboard'
    });
  }
});

// Validate referral code
router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const user = await User.findOne({ referralCode: code.trim().toUpperCase() });
    
    if (user) {
      res.json({
        success: true,
        valid: true,
        referrer: {
          name: user.name,
          email: user.email,
          referralCode: user.referralCode
        }
      });
    } else {
      res.json({
        success: true,
        valid: false,
        message: 'Invalid referral code'
      });
    }
  } catch (error: any) {
    console.error('❌ Validate referral code error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to validate referral code'
    });
  }
});

export default router;