import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';
import axios from 'axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', collegeId: '', department: '', mobile: '', password: '', confirmPassword: '', otp: '', captchaAnswer: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [captchaData, setCaptchaData] = useState(null);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      // In a real app, you would configure the API base URL properly.
      // Since we proxy in Vite, this relative path works.
      const res = await axios.get('/api/auth/security-check');
      setCaptchaData(res.data);
    } catch (error) {
      console.error("Failed to load captcha", error);
      toast.error("Failed to load security check. Our servers might be updating. Please refresh the page in a moment.");
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      return toast.error("Please enter your email first");
    }
    setIsOtpSending(true);
    try {
      await axios.post('/api/auth/send-otp', { email: formData.email });
      setIsOtpSent(true);
      toast.success("OTP sent! Check your server logs (or email)");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsOtpSending(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords don't match");
    }
    if (!formData.otp) {
      return toast.error("Please enter the OTP");
    }
    if (!formData.captchaAnswer) {
      return toast.error("Please solve the Captcha");
    }
    
    setIsLoading(true);
    try {
      const { confirmPassword, ...data } = formData;
      await register({ ...data, captchaHash: captchaData?.hash });
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      fetchCaptcha(); // Refresh captcha on failure
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
            Create an account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              sign in to your account
            </Link>
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
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input type="text" name="name" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input type="email" name="email" required onChange={handleChange} disabled={isOtpSent} className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-none rounded-l-md bg-white dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-800" />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isOtpSending || isOtpSent || !formData.email}
                  className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 dark:border-gray-700 rounded-r-md bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  {isOtpSending ? 'Sending...' : isOtpSent ? 'Sent' : 'Send OTP'}
                </button>
              </div>
            </div>

            {isOtpSent && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verification OTP</label>
                <input type="text" name="otp" required onChange={handleChange} placeholder="Enter 6-digit code" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm transition-colors" />
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">College ID</label>
                <input type="text" name="collegeId" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                <input type="text" name="department" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm transition-colors" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
              <input type="text" name="mobile" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input type="password" name="password" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                <input type="password" name="confirmPassword" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm transition-colors" />
              </div>
            </div>

            {captchaData && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Security Check: {captchaData.question}
                </label>
                <input type="number" name="captchaAnswer" required onChange={handleChange} placeholder="Enter answer" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm transition-colors" />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || !isOtpSent}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 mt-4 transition-colors"
              >
                {isLoading ? 'Registering...' : (
                  <>
                    <UserPlus className="mr-2" size={18} /> Register
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
