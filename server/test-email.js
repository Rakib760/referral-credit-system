const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('Email User:', process.env.EMAIL_USER);
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ Email server connection successful!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: `"ReferralHub Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: '📧 Test Email from ReferralHub',
      text: 'This is a test email to confirm your configuration is working!',
      html: '<h1>✅ Email Test Successful!</h1><p>Your email configuration is working correctly.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure 2-Step Verification is enabled in Google Account');
    console.log('2. Generate an App Password (not your regular password)');
    console.log('3. Check that EMAIL_USER and EMAIL_PASS are correct in .env file');
    console.log('4. Make sure "Less secure app access" is ON (if not using App Password)');
  }
}

testEmail();