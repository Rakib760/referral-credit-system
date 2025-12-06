import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test the transporter
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Email server connection error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const mailOptions = {
      from: `"ReferralHub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request - ReferralHub';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        .token { background: #f0f0f0; padding: 15px; border-radius: 5px; font-family: monospace; word-break: break-all; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="color: white; margin: 0;">🔐 Password Reset</h1>
      </div>
      <div class="content">
        <h2>Hello!</h2>
        <p>You requested a password reset for your ReferralHub account.</p>
        <p>Click the button below to reset your password:</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <div class="token">${resetUrl}</div>
        
        <p><strong>This link will expire in 1 hour.</strong></p>
        
        <p>If you didn't request this password reset, please ignore this email.</p>
        
        <div class="footer">
          <p>This is an automated message from ReferralHub.</p>
          <p>If you need help, contact us at support@referralhub.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
};

export const sendWelcomeEmail = async (email: string, name: string, referralCode: string) => {
  const subject = 'Welcome to ReferralHub! 🎉';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ReferralHub</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: white; border: 2px dashed #667eea; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px; font-size: 24px; font-weight: bold; color: #667eea; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="color: white; margin: 0;">🎉 Welcome to ReferralHub!</h1>
      </div>
      <div class="content">
        <h2>Hi ${name}!</h2>
        <p>Thank you for joining ReferralHub! We're excited to have you on board.</p>
        
        <p>Your unique referral code is:</p>
        <div class="code-box">${referralCode}</div>
        
        <p>Share this code with friends and earn <strong>2 credits</strong> when they sign up and make their first purchase!</p>
        
        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
        </div>
        
        <p><strong>How it works:</strong></p>
        <ol>
          <li>Share your referral link with friends</li>
          <li>They sign up using your link</li>
          <li>When they make their first purchase, <strong>both of you earn 2 credits!</strong></li>
          <li>Use credits to purchase digital products</li>
        </ol>
        
        <div class="footer">
          <p>Happy referring! 🚀</p>
          <p>The ReferralHub Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
};