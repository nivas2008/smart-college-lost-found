import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { LogIn, KeyRound, Mail, Lock } from 'lucide-react';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaData, setCaptchaData] = useState(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot password states
  const [view, setView] = useState('login'); // 'login', 'forgot', 'otp', 'reset'
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const res = await axios.get('/api/auth/security-check');
      setCaptchaData(res.data);
    } catch {
      console.error("Failed to load captcha");
      toast.error("Failed to load security check. Our servers might be updating. Please refresh the page in a moment.");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!captchaAnswer) {
      return toast.error("Please solve the Captcha");
    }

    setIsLoading(true);
    try {
      await login({ email, password, captchaAnswer, captchaHash: captchaData?.hash });
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      fetchCaptcha(); // Refresh captcha on failure
      setCaptchaAnswer('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    
    setIsLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      toast.success('OTP sent to your email');
      setView('otp');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!resetOtp || resetOtp.length !== 6) return toast.error("Please enter a valid 6-digit OTP");
    setView('reset');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) return toast.error("Passwords do not match");
    if (!newPassword) return toast.error("Please enter a new password");

    setIsLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { 
        email, 
        otp: resetOtp, 
        newPassword 
      });
      toast.success('Password reset successfully! Please log in.');
      setView('login');
      setPassword('');
      setResetOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      fetchCaptcha(); // Refresh captcha for fresh login attempt
      setCaptchaAnswer('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 dark:bg-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto h-12 w-12 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {view === 'login' ? 'Welcome back' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {view === 'login' ? (
              <>
                Or{' '}
                <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
                  create a new account
                </Link>
              </>
            ) : (
              <>
                Remembered it?{' '}
                <button onClick={() => setView('login')} className="font-medium text-primary hover:text-primary-dark">
                  Back to login
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-lighter py-8 px-4 shadow-xl shadow-gray-200/50 dark:shadow-none sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-800"
        >
          {view === 'login' && (
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-dark text-gray-900 dark:text-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-dark text-gray-900 dark:text-white transition-colors"
                  />
                </div>
              </div>

              {captchaData && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Security Check: {captchaData.question}
                  </label>
                  <input 
                    type="number" 
                    required 
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder="Enter answer" 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm transition-colors" 
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <button type="button" onClick={() => setView('forgot')} className="font-medium text-primary hover:text-primary-dark">
                    Forgot your password?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Signing in...' : <><LogIn className="mr-2" size={18} /> Sign in</>}
                </button>
              </div>
            </form>
          )}

          {view === 'forgot' && (
            <form className="space-y-6" onSubmit={handleForgotPassword}>
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                Enter your email address and we'll send you a 6-digit verification code to reset your password.
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-dark text-gray-900 dark:text-white transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </form>
          )}

          {view === 'otp' && (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                We've sent a 6-digit code to <strong>{email}</strong>. Enter it below to verify your identity.
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verification Code (OTP)</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    className="pl-10 tracking-widest text-center appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-dark text-gray-900 dark:text-white transition-colors"
                    placeholder="------"
                    maxLength={6}
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  Verify OTP
                </button>
              </div>
            </form>
          )}

          {view === 'reset' && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                Identity verified! You can now set a new password for your account.
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-dark text-gray-900 dark:text-white transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-dark text-gray-900 dark:text-white transition-colors"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
