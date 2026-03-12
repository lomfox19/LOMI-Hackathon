// ============================================
// SVH AUTH MODULE - Configuration
// ============================================
const mongoose = require('mongoose');

const authConfig = {
  // JWT Settings
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // reCAPTCHA
  recaptchaSecret: process.env.RECAPTCHA_SECRET_KEY,
  recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
  captchaThreshold: 0.5,
  
  // Email Settings
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
  
  // Security Settings
  maxLoginAttempts: 5,
  lockoutTime: 15 * 60 * 1000, // 15 minutes
  otpExpiry: 10 * 60 * 1000,   // 10 minutes
  
  // Database (optional - use if separate auth DB)
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp',
};

module.exports = authConfig;