// ============================================
// SVH AUTH MODULE - Database Models
// ============================================
const mongoose = require('mongoose');

// User Model
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    // Password is optional during initial signup (OTP phase)
    // Only required when user completes registration
    required: false
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Security Log Model
const SecurityLogSchema = new mongoose.Schema({
  ip: String,
  email: String,
  action: String,
  success: Boolean,
  recaptchaScore: Number,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
  metadata: mongoose.Schema.Types.Mixed
});

SecurityLogSchema.index({ ip: 1, timestamp: -1 });
SecurityLogSchema.index({ email: 1, timestamp: -1 });

module.exports = {
  User: mongoose.model('User', UserSchema),
  SecurityLog: mongoose.model('SecurityLog', SecurityLogSchema)
};