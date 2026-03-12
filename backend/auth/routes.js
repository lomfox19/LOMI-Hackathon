// ============================================
// SVH AUTH MODULE - Routes
// ============================================
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoSanitize = require('express-mongo-sanitize');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');

const authConfig = require('./config');
const { User } = require('./models');
const { generateOTP, sendOTP } = require('./utils');
const {
  authenticate,
  requireAdmin,
  otpLimiter,
  loginLimiter,
  trackIP,
  fingerprintCheck,
  recaptchaCheck,
  logSecurityEvent
} = require('./middleware');

const router = express.Router();
router.use(mongoSanitize());

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ========== PUBLIC ROUTES ==========

// Sign Up - Send OTP
router.post('/signup',
  fingerprintCheck,
  trackIP,
  recaptchaCheck,
  otpLimiter,
  [body('email').isEmail().normalizeEmail()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser.isVerified) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + authConfig.otpExpiry);

      await sendOTP(email, otp);

      if (existingUser) {
        existingUser.otp = { code: otp, expiresAt };
        await existingUser.save();
      } else {
        await User.create({ email, otp: { code: otp, expiresAt } });
      }

      await logSecurityEvent(req, 'otp_request', true);
      res.json({ message: 'OTP sent to email', email });
    } catch (err) {
      console.error(err);
      await logSecurityEvent(req, 'signup_attempt', false, { error: err.message });
      res.status(500).json({ error: 'Server error', details: err.message, stack: err.stack });
    }
  }
);

// Verify OTP
router.post('/verify-otp',
  fingerprintCheck,
  recaptchaCheck,
  [body('email').isEmail().normalizeEmail(), body('otp').isLength({ min: 6, max: 6 })],
  async (req, res) => {
    try {
      const { email, otp } = req.body;

      const user = await User.findOne({ email });
      if (!user || !user.otp || user.otp.code !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      if (new Date() > user.otp.expiresAt) {
        return res.status(400).json({ error: 'OTP expired' });
      }

      user.otp = undefined;
      await user.save();

      await logSecurityEvent(req, 'otp_verification', true);
      res.json({ message: 'OTP verified successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Complete Signup
router.post('/complete-signup',
  fingerprintCheck,
  recaptchaCheck,
  [
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3, max: 30 }).trim(),
    body('password').isLength({ min: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, username, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      const existingUsername = await User.findOne({ username });
      if (existingUsername && existingUsername._id.toString() !== user._id.toString()) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      user.username = username;
      user.password = hashedPassword;
      user.isVerified = true;
      await user.save();

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        authConfig.jwtSecret,
        { expiresIn: authConfig.jwtExpire }
      );

      await logSecurityEvent(req, 'signup_complete', true);

      res.json({
        message: 'Registration complete',
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Google Sign-In / Sign-Up
router.post('/google-signin',
  fingerprintCheck,
  recaptchaCheck,
  async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Google token required' });
      }

      let googleId, email, name;

      try {
        // Try to verify as ID Token first
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        googleId = payload.sub;
        email = payload.email;
        name = payload.name;
      } catch (idTokenError) {
        // If ID Token verification fails, try as Access Token
        try {
          const axios = require('axios');
          const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
          });

          googleId = userInfoResponse.data.sub;
          email = userInfoResponse.data.email;
          name = userInfoResponse.data.name;
        } catch (accessTokenError) {
          console.error('Token verification failed:', idTokenError.message, accessTokenError.message);
          throw new Error('Invalid Google token');
        }
      }

      // Check if user exists with Google ID
      let user = await User.findOne({ googleId });

      if (!user) {
        // Check if email already exists
        user = await User.findOne({ email });

        if (user) {
          // Link Google account to existing user
          user.googleId = googleId;
          user.isVerified = true;
          await user.save();
        } else {
          // Create new user
          const username = name?.replace(/\s+/g, '_').toLowerCase() || email.split('@')[0];
          user = await User.create({
            email,
            username,
            googleId,
            isVerified: true,
            role: 'user'
          });
        }
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        { userId: user._id, role: user.role },
        authConfig.jwtSecret,
        { expiresIn: authConfig.jwtExpire }
      );

      await logSecurityEvent(req, 'google_signin', true);

      res.json({
        message: 'Google sign-in successful',
        token: jwtToken,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      });
    } catch (err) {
      console.error('❌ Google sign-in error:', err);
      await logSecurityEvent(req, 'google_signin', false, { error: err.message });
      res.status(500).json({ error: 'Google authentication failed' });
    }
  }
);

// Sign In
router.post('/signin',
  fingerprintCheck,
  trackIP,
  recaptchaCheck,
  loginLimiter,
  async (req, res) => {
    try {
      const { loginId, password } = req.body;

      const user = await User.findOne({
        $or: [{ email: loginId }, { username: loginId }]
      });

      if (!user || !user.isVerified) {
        await logSecurityEvent(req, 'login_attempt', false);
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        await logSecurityEvent(req, 'login_attempt', false);
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        authConfig.jwtSecret,
        { expiresIn: authConfig.jwtExpire }
      );

      await logSecurityEvent(req, 'login_attempt', true);

      res.json({
        message: 'Sign in successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ========== PROTECTED ROUTES ==========

// Get Current User
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -otp');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Security Logs (Admin Only)
router.get('/security-logs', authenticate, requireAdmin, async (req, res) => {
  try {
    const { SecurityLog } = require('./models');
    const logs = await SecurityLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;