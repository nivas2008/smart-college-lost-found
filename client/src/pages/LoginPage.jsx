import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { LogIn } from 'lucide-react';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaData, setCaptchaData] = useState(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const res = await axios.get('/api/auth/captcha');
      setCaptchaData(res.data);
    } catch (error) {
      console.error("Failed to load captcha", error);
    }
  };

  const handleSubmit = async (e) => {
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
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
              create a new account
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
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
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
                <a href="#" className="font-medium text-primary hover:text-primary-dark">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Signing in...' : (
                  <>
                    <LogIn className="mr-2" size={18} /> Sign in
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

export default LoginPage;
