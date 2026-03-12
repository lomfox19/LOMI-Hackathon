// ============================================
// SVH AUTH MODULE - Middleware (SIMPLIFIED)
// File: backend/auth/middleware.js
// ============================================

const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const authConfig = require('./config');
const { verifyRecaptcha } = require('./utils');
const { SecurityLog } = require('./models');

// JWT Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Admin Role Check
const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Rate Limiters
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Increased from 3 to 5 for testing
  message: { error: 'Too many OTP requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Increased from 5 to 10 for testing
  message: { error: 'Too many login attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// IP Tracking (Simplified)
const ipTracker = {};

const trackIP = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  if (!ipTracker[ip]) {
    ipTracker[ip] = { 
      attempts: 0, 
      lastAttempt: now, 
      blocked: false, 
      blockUntil: 0 
    };
  }
  
  const tracker = ipTracker[ip];
  
  // Check if IP is blocked
  if (tracker.blocked && now < tracker.blockUntil) {
    const remainingTime = Math.ceil((tracker.blockUntil - now) / 1000);
    return res.status(429).json({ 
      error: `Too many attempts. Try again in ${remainingTime} seconds`
    });
  }
  
  // Reset block if time has passed
  if (tracker.blocked && now >= tracker.blockUntil) {
    tracker.blocked = false;
    tracker.attempts = 0;
  }
  
  tracker.attempts++;
  tracker.lastAttempt = now;
  
  // Block if too many attempts (20 for testing, 5 for production)
  const maxAttempts = authConfig.maxLoginAttempts || 20;
  
  if (tracker.attempts > maxAttempts) {
    tracker.blocked = true;
    tracker.blockUntil = now + authConfig.lockoutTime;
    return res.status(429).json({ 
      error: 'Too many attempts. Your IP has been temporarily blocked.'
    });
  }
  
  req.ipInfo = tracker;
  next();
};

// Clean up old IP data every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(ipTracker).forEach(ip => {
    if (now - ipTracker[ip].lastAttempt > 3600000) { // 1 hour
      delete ipTracker[ip];
    }
  });
}, 3600000);

// Request Fingerprinting (Simplified)
const fingerprintCheck = (req, res, next) => {
  const userAgent = req.headers['user-agent'];
  
  // Allow requests without user-agent in development
  if (!userAgent && process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  No user-agent (dev mode - allowing)');
    return next();
  }
  
  if (!userAgent || userAgent.length < 10) {
    return res.status(403).json({ error: 'Invalid request' });
  }
  
  // Check for common bot patterns
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i, 
    /curl/i, /wget/i, /python-requests/i
  ];
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    console.warn('🤖 Bot detected:', userAgent);
    return res.status(403).json({ error: 'Automated requests not allowed' });
  }
  
  next();
};

// reCAPTCHA Verification (OPTIONAL - can be disabled)
const recaptchaCheck = async (req, res, next) => {
  // Skip reCAPTCHA in development if not configured
  if (!authConfig.recaptchaSecret) {
    console.warn('⚠️  reCAPTCHA disabled - no secret key configured');
    req.recaptchaScore = 1.0;
    return next();
  }

  const token = req.body.recaptchaToken || req.headers['x-recaptcha-token'];
  
  if (!token) {
    console.warn('⚠️  No reCAPTCHA token provided');
    req.recaptchaScore = 0.5;
    return next(); // Allow in development
  }
  
  try {
    const result = await verifyRecaptcha(token);
    
    if (!result.success || result.score < authConfig.captchaThreshold) {
      console.warn('⚠️  Low reCAPTCHA score:', result.score);
      // In production, reject; in dev, allow with warning
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ 
          error: 'Suspicious activity detected',
          score: result.score 
        });
      }
    }
    
    req.recaptchaScore = result.score;
    next();
  } catch (error) {
    console.error('❌ reCAPTCHA check error:', error.message);
    // Allow request in case of reCAPTCHA service error
    req.recaptchaScore = 0.5;
    next();
  }
};

// Security Logger
const logSecurityEvent = async (req, action, success, metadata = {}) => {
  try {
    await SecurityLog.create({
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      email: req.body.email || req.body.loginId,
      action,
      success,
      recaptchaScore: req.recaptchaScore,
      userAgent: req.headers['user-agent'],
      metadata
    });
  } catch (err) {
    console.error('❌ Security log error:', err.message);
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  otpLimiter,
  loginLimiter,
  trackIP,
  fingerprintCheck,
  recaptchaCheck,
  logSecurityEvent
};