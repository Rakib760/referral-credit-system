import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { Referral } from '../models/Referral';
import { sendPasswordResetEmail } from '../utils/email';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export class AuthController {
  // Test endpoint
  static async test(req: Request, res: Response) {
    res.json({
      success: true,
      message: 'Auth API is working!',
      timestamp: new Date().toISOString(),
      endpoints: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        getMe: 'GET /api/auth/me',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password'
      }
    });
  }

  // Register user
  static async register(req: Request, res: Response) {
    try {
      console.log('📝 Registration attempt:', req.body);
      
      const { email, password, name, referralCode } = req.body;

      // Basic validation
      if (!email || !password || !name) {
        return res.status(400).json({ 
          success: false,
          error: 'Please provide all required fields: email, password, and name' 
        });
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          error: 'User already exists with this email' 
        });
      }

      // Create new user
      const userData: any = { 
        email, 
        password, 
        name
      };

      // Handle referral if referral code provided
      let referrer = null;
      if (referralCode) {
        referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
        if (referrer) {
          // We'll store the referrer ID for later processing
          userData.referredBy = referrer._id;
        }
      }

      const user = new User(userData);
      await user.save();

      console.log('✅ User created successfully:', { email, referralCode: user.referralCode });

      // If there was a referrer, create referral record
      if (referrer && userData.referredBy) {
        try {
          const referral = new Referral({
            referrer: referrer._id,
            referred: user._id,
            status: 'pending'
          });
          await referral.save();
          console.log('✅ Referral created for:', referralCode);
        } catch (referralError) {
          console.error('❌ Failed to create referral:', referralError);
          // Continue even if referral creation fails
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email,
          name: user.name 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          referralCode: user.referralCode,
          credits: user.credits || 0,
          isVerified: user.isVerified || false,
          createdAt: user.createdAt
        },
        referrer: referrer ? referrer.referralCode : null
      });
      
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      // Handle specific Mongoose validation errors
      if (error.name === 'ValidationError') {
        const errors: string[] = [];
        for (const field in error.errors) {
          errors.push(error.errors[field].message);
        }
        return res.status(400).json({ 
          success: false,
          error: 'Validation failed',
          details: errors 
        });
      }

      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({ 
          success: false,
          error: 'Email or referral code already exists' 
        });
      }

      res.status(500).json({ 
        success: false,
        error: 'Registration failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Login user
  static async login(req: Request, res: Response) {
    try {
      console.log('🔐 Login attempt:', req.body.email);
      
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          error: 'Please provide email and password' 
        });
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        console.log('❌ User not found:', email);
        return res.status(401).json({ 
          success: false,
          error: 'Invalid email or password' 
        });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        console.log('❌ Invalid password for:', email);
        return res.status(401).json({ 
          success: false,
          error: 'Invalid email or password' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email,
          name: user.name 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('✅ Login successful for:', email);
      
      res.json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          referralCode: user.referralCode,
          credits: user.credits || 0,
          isVerified: user.isVerified || false,
          createdAt: user.createdAt
        }
      });
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Login failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get current user
  static async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: 'Not authenticated' 
        });
      }

      const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }
      
      res.json({ 
        success: true, 
        user 
      });
      
    } catch (error: any) {
      console.error('❌ Get me error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get user information',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Forgot password - UPDATED to send email
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ 
          success: false,
          error: 'Please provide email address' 
        });
      }

      // For security, always return same message whether user exists or not
      const responseMessage = 'If an account exists with this email, you will receive a password reset link';
      
      const user = await User.findOne({ email });
      
      if (!user) {
        console.log('⚠️ Password reset requested for non-existent email:', email);
        return res.json({
          success: true,
          message: responseMessage
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Hash token and save to database
      user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
      
      await user.save();
      console.log('✅ Reset token generated for:', email);

      // Send email with reset link
      try {
        await sendPasswordResetEmail(email, resetToken);
        console.log('📧 Password reset email sent to:', email);
      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError);
        // Still return success to user
      }

      res.json({
        success: true,
        message: responseMessage
      });
      
    } catch (error: any) {
      console.error('❌ Forgot password error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to process request',
        message: error.message 
      });
    }
  }

  // Reset password - UPDATED to verify token
  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ 
          success: false,
          error: 'Token and new password are required' 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          success: false,
          error: 'Password must be at least 6 characters' 
        });
      }

      // Hash the token to compare with database
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid or expired reset token' 
        });
      }

      // Update password and clear reset token
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      
      await user.save();
      console.log('✅ Password reset for:', user.email);

      res.json({
        success: true,
        message: 'Password has been reset successfully'
      });
      
    } catch (error: any) {
      console.error('❌ Reset password error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to reset password',
        message: error.message 
      });
    }
  }

  // Verify reset token
  static async verifyResetToken(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ 
          success: false,
          error: 'Token is required' 
        });
      }

      // Hash the token to compare with database
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid or expired reset token' 
        });
      }

      res.json({
        success: true,
        message: 'Token is valid',
        email: user.email
      });
      
    } catch (error: any) {
      console.error('❌ Verify token error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to verify token',
        message: error.message 
      });
    }
  }

  // Update profile
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { name } = req.body;

      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: 'Not authenticated' 
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      if (name) {
        user.name = name;
        await user.save();
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          referralCode: user.referralCode,
          credits: user.credits
        }
      });
      
    } catch (error: any) {
      console.error('❌ Update profile error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update profile',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}