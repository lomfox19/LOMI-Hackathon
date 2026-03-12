// ============================================
// SVH AUTH MODULE - Frontend Service
// ============================================
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Get reCAPTCHA token
const getRecaptchaToken = async (action) => {
  return new Promise((resolve) => {
    // Check if reCAPTCHA is loaded
    if (!window.grecaptcha) {
      console.warn('⚠️ reCAPTCHA not loaded - skipping (dev mode)');
      return resolve('');
    }

    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, { action })
        .then(resolve)
        .catch(() => resolve(''));
    });
  });
};

const authService = {
  // Sign Up
  signup: async (email) => {
    try {
      const recaptchaToken = await getRecaptchaToken('signup');
      console.log('📤 Sending signup request for:', email);
      console.log('🔐 reCAPTCHA token:', recaptchaToken ? 'Generated' : 'Empty');

      const response = await axios.post(`${API_URL}/auth/signup`, {
        email,
        recaptchaToken
      });

      console.log('✅ Signup response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Signup error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    const recaptchaToken = await getRecaptchaToken('verify_otp');
    const response = await axios.post(`${API_URL}/auth/verify-otp`, {
      email,
      otp,
      recaptchaToken
    });
    return response.data;
  },

  // Complete Signup
  completeSignup: async (email, username, password) => {
    const recaptchaToken = await getRecaptchaToken('complete_signup');
    const response = await axios.post(`${API_URL}/auth/complete-signup`, {
      email,
      username,
      password,
      recaptchaToken
    });

    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('authUser', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  // Sign In
  signin: async (loginId, password) => {
    const recaptchaToken = await getRecaptchaToken('signin');
    const response = await axios.post(`${API_URL}/auth/signin`, {
      loginId,
      password,
      recaptchaToken
    });

    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('authUser', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  // Google Sign-In
  googleSignIn: async (googleToken) => {
    try {
      console.log('📤 Sending Google Sign-In request');
      const recaptchaToken = await getRecaptchaToken('google_signin');

      const response = await axios.post(`${API_URL}/auth/google-signin`, {
        token: googleToken,
        recaptchaToken
      });

      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('authUser', JSON.stringify(response.data.user));
      }

      console.log('✅ Google Sign-In successful');
      return response.data;
    } catch (error) {
      console.error('❌ Google Sign-In error:', error);
      throw error;
    }
  },

  // Sign Out
  signout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  },

  // Get Current User
  getCurrentUser: () => {
    const user = localStorage.getItem('authUser');
    return user ? JSON.parse(user) : null;
  },

  // Get Token
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Check if Authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};

export default authService;