// ============================================
// SVH AUTH MODULE - Complete UI Component
// ============================================
import React, { useState } from 'react';
import { Mail, Lock, User, Shield, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import authService from './authService';

const AuthUI = ({ onSuccess, customStyles = {} }) => {
  const [step, setStep] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loginId, setLoginId] = useState('');

  // Google Login Hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        setError('');
        setLoading(true);
        // Exchange code for token and authenticate
        const response = await authService.googleSignIn(codeResponse.access_token);
        if (onSuccess) onSuccess(response.user);
      } catch (err) {
        setError(err.response?.data?.error || 'Google sign-in failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed');
    }
  });

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      if (!loginId || !password) {
        setError('Please fill in all fields');
        return;
      }
      const response = await authService.signin(loginId, password);
      if (onSuccess) onSuccess(response.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setError('');
      setLoading(true);
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email');
        return;
      }
      await authService.signup(email);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    try {
      setError('');
      setLoading(true);
      const otpCode = otp.join('');
      if (otpCode.length !== 6) {
        setError('Please enter complete OTP');
        return;
      }
      await authService.verifyOTP(email, otpCode);
      setStep('username');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSubmit = async () => {
    try {
      setError('');
      setLoading(true);
      if (!username || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (username.length < 3) {
        setError('Username must be at least 3 characters');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      const response = await authService.completeSignup(email, username, password);
      setStep('complete');
      if (onSuccess) {
        setTimeout(() => onSuccess(response.user), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setError('');
      setLoading(true);
      await authService.signup(email);
      alert('OTP resent to your email');
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const containerClass =
    customStyles.container ||
    'min-h-screen bg-ai-bg text-ai-primary flex items-center justify-center p-4 font-body';

  return (
    <div className={containerClass}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-10 w-64 h-64 bg-gradient-to-br from-ai-secondary/15 via-ai-secondary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-10 w-64 h-64 bg-gradient-to-tr from-ai-primary/15 via-ai-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-ai-primary/40 via-ai-secondary/30 to-ai-primary/40 rounded-xl-card blur opacity-80" />

        <div className="relative bg-white/80 backdrop-blur-xl rounded-xl-card shadow-ai-card border border-ai-primary/10 overflow-hidden">
          {error && (
            <div className="mx-7 mt-7 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'signin' && (
            <div className="p-7 sm:p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-ai-primary text-white rounded-2xl mb-4 shadow-md">
                  <Shield className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-heading text-ai-primary mb-1">Welcome back</h2>
                <p className="text-sm text-ai-primary/70">Sign in to access your medical AI dashboard.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ai-primary mb-2">Email or Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ai-primary/40" />
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-ai-primary/10 rounded-xl text-ai-primary placeholder-ai-primary/35 focus:outline-none focus:ring-2 focus:ring-ai-secondary focus:border-transparent transition"
                      placeholder="Enter email or username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ai-primary mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                      className="w-full pl-10 pr-12 py-3 bg-white border border-ai-primary/10 rounded-xl text-ai-primary placeholder-ai-primary/35 focus:outline-none focus:ring-2 focus:ring-ai-secondary focus:border-transparent transition"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ai-primary/40 hover:text-ai-primary transition"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full bg-ai-primary text-white py-3 rounded-xl font-semibold hover:bg-ai-hover transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-ai-bg text-ai-primary/60 text-xs uppercase tracking-wide">Or continue with</span>
                </div>
              </div>

              <button
                onClick={() => googleLogin()}
                disabled={loading}
                className="w-full relative overflow-hidden bg-white/80 backdrop-blur-xl border border-ai-primary/10 text-ai-primary py-3.5 px-4 rounded-xl font-semibold hover:bg-white hover:border-ai-secondary/60 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-250" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-[1.02rem] font-semibold tracking-wide">Continue with Google</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </button>

              <p className="text-center text-ai-primary/80 mt-6 text-sm">
                Don't have an account?{' '}
                <button onClick={() => { setStep('signup'); setError(''); }} className="text-ai-secondary hover:text-ai-hover font-semibold transition">
                  Sign up
                </button>
              </p>

              <div className="mt-8 pt-6 border-t border-ai-primary/10 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-ai-primary/70 text-xs">
                  <Shield className="w-4 h-4" />
                  <span>Secured by SVH Authentication</span>
                </div>
                <p className="text-ai-primary/50 text-[11px]">Protected by reCAPTCHA and bot detection</p>
              </div>
            </div>
          )}

          {step === 'signup' && (
            <div className="p-7 sm:p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-ai-primary text-white rounded-2xl mb-4 shadow-md">
                  <Mail className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-heading text-ai-primary mb-1">Create account</h2>
                <p className="text-sm text-ai-primary/70">Enter your email to begin secure registration.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ai-primary mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ai-primary/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-ai-primary/10 rounded-xl text-ai-primary placeholder-ai-primary/35 focus:outline-none focus:ring-2 focus:ring-ai-secondary focus:border-transparent transition"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSignUp}
                  disabled={loading}
                  className="w-full bg-ai-primary text-white py-3 rounded-xl font-semibold hover:bg-ai-hover transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-ai-bg text-ai-primary/60 text-xs uppercase tracking-wide">Or sign up with</span>
                </div>
              </div>

              <button
                onClick={() => googleLogin()}
                disabled={loading}
                className="w-full relative overflow-hidden bg-white/80 backdrop-blur-xl border border-ai-primary/10 text-ai-primary py-3.5 px-4 rounded-xl font-semibold hover:bg-white hover:border-ai-secondary/60 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-250" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-[1.02rem] font-semibold tracking-wide">Sign up with Google</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </button>

              <p className="text-center text-ai-primary/80 mt-6 text-sm">
                Already have an account?{' '}
                <button onClick={() => { setStep('signin'); setError(''); }} className="text-ai-secondary hover:text-ai-hover font-semibold transition">
                  Sign in
                </button>
              </p>

              <div className="mt-8 pt-6 border-t border-ai-primary/10 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-ai-primary/70 text-xs">
                  <Shield className="w-4 h-4" />
                  <span>Secured by SVH Authentication</span>
                </div>
                <p className="text-ai-primary/50 text-[11px]">Protected by reCAPTCHA and bot detection</p>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="p-7 sm:p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-ai-primary text-white rounded-2xl mb-4 shadow-md">
                  <Mail className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-heading text-ai-primary mb-1">Verify email</h2>
                <p className="text-sm text-ai-primary/70">Enter the 6-digit code sent to</p>
                <p className="text-ai-primary font-semibold mt-1">{email}</p>
              </div>

              <div className="flex gap-2 justify-center mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-11 h-14 text-center text-xl font-semibold bg-white border border-ai-primary/15 rounded-xl text-ai-primary focus:outline-none focus:ring-2 focus:ring-ai-secondary focus:border-transparent transition"
                  />
                ))}
              </div>

              <button
                onClick={handleOtpVerify}
                disabled={loading}
                className="w-full bg-ai-primary text-white py-3 rounded-xl font-semibold hover:bg-ai-hover transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <p className="text-center text-ai-primary/80 mt-4 text-sm">
                Didn't receive code?{' '}
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-ai-secondary hover:text-ai-hover font-semibold transition disabled:opacity-60"
                >
                  Resend
                </button>
              </p>
            </div>
          )}

          {step === 'username' && (
            <div className="p-7 sm:p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-ai-primary text-white rounded-2xl mb-4 shadow-md">
                  <User className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-heading text-ai-primary mb-1">Complete profile</h2>
                <p className="text-sm text-ai-primary/70">Create your username and password.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ai-primary mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ai-primary/40" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-ai-primary/10 rounded-xl text-ai-primary placeholder-ai-primary/35 focus:outline-none focus:ring-2 focus:ring-ai-secondary focus:border-transparent transition"
                      placeholder="Choose a unique username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ai-primary mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ai-primary/40" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-white border border-ai-primary/10 rounded-xl text-ai-primary placeholder-ai-primary/35 focus:outline-none focus:ring-2 focus:ring-ai-secondary focus:border-transparent transition"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ai-primary/40 hover:text-ai-primary transition"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ai-primary mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ai-primary/40" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-ai-primary/10 rounded-xl text-ai-primary placeholder-ai-primary/35 focus:outline-none focus:ring-2 focus:ring-ai-secondary focus:border-transparent transition"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>

                <button
                  onClick={handleUsernameSubmit}
                  disabled={loading}
                  className="w-full bg-ai-primary text-white py-3 rounded-xl font-semibold hover:bg-ai-hover transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-ai-secondary text-white rounded-full mb-6 shadow-md">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-heading text-ai-primary mb-2">All set!</h2>
              <p className="text-sm text-ai-primary/75 mb-8">Your account has been created successfully.</p>
              <div className="mt-8 pt-6 border-t border-ai-primary/10">
                <div className="flex items-center justify-center gap-2 text-ai-primary/70 text-xs">
                  <Shield className="w-4 h-4" />
                  <span>Secured by SVH Authentication</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthUI;