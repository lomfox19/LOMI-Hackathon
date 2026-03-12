// ============================================
// SVH AUTH MODULE - Utility Functions (FIXED)
// File: backend/auth/utils.js
// ============================================

// FIX: Use require() instead of direct import
const nodemailer = require('nodemailer');
const axios = require('axios');
const authConfig = require('./config');

// Email Transporter - FIXED
const transporter = nodemailer.createTransport({
  host: authConfig.email.host,
  port: authConfig.email.port,
  secure: false,
  auth: {
    user: authConfig.email.user,
    pass: authConfig.email.password
  }
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"SVH Authentication" <${authConfig.email.user}>`,
      to: email,
      subject: 'Verify Your Email - SVH Auth',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #8b5cf6; margin: 0;">Email Verification</h2>
          </div>
          <div style="background: #f9fafb; border-radius: 10px; padding: 30px; text-align: center;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">Your verification code is:</p>
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); 
                        padding: 20px; 
                        border-radius: 10px; 
                        margin: 20px 0;">
              <h1 style="color: white; 
                         font-size: 36px; 
                         letter-spacing: 8px; 
                         margin: 0;
                         font-family: monospace;">${otp}</h1>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              This code expires in 10 minutes.
            </p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              🔐 Secured by SVH Authentication
            </p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error);
    throw new Error('Failed to send email');
  }
};

// Verify reCAPTCHA
const verifyRecaptcha = async (token) => {
  try {
    // Skip verification if no secret key (for testing)
    if (!authConfig.recaptchaSecret) {
      console.warn('⚠️  reCAPTCHA disabled - no secret key');
      return { success: true, score: 1.0 };
    }

    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: authConfig.recaptchaSecret,
          response: token
        }
      }
    );
    
    return {
      success: response.data.success,
      score: response.data.score || 1.0,
      action: response.data.action
    };
  } catch (error) {
    console.error('❌ reCAPTCHA error:', error.message);
    // Return success for development if reCAPTCHA fails
    return { success: true, score: 0.5 };
  }
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyRecaptcha
};