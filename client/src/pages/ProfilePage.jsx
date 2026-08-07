import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Building, Phone, Lock, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateSession } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    mobile: '',
    oldPassword: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        department: user.department || '',
        mobile: user.mobile || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!formData.password || !formData.oldPassword) {
      return setError('Please provide current password and new password before requesting OTP.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('New passwords do not match.');
    }
    
    setOtpSending(true);
    setError(null);
    setSuccess(false);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.post('/api/auth/profile/send-otp', {}, config);
      setOtpSent(true);
      setSuccess('OTP sent to your email successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && !formData.oldPassword) {
      return setError('Please provide your current password to set a new one');
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password && !formData.otp) {
      return setError('OTP is required to change password');
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put('/api/auth/profile', {
        name: formData.name,
        department: formData.department,
        mobile: formData.mobile,
        oldPassword: formData.oldPassword || undefined,
        password: formData.password || undefined,
        otp: formData.otp || undefined
      }, config);
      
      updateSession(data);
      setSuccess('Profile updated successfully!');
      setOtpSent(false);
      setFormData(prev => ({ ...prev, oldPassword: '', password: '', confirmPassword: '', otp: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-dark-lighter rounded-2xl shadow-xl overflow-hidden transition-colors duration-200">
        <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <User className="mr-2" size={24} />
            Edit Profile
          </h2>
          <p className="text-white/80 mt-1 text-sm">Update your personal details and account security</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-lg mb-6 border border-green-100 dark:border-green-800">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-lighter text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-dark text-gray-500 dark:text-gray-400 shadow-sm cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-lighter text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-lighter text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
              
              <div className="mb-6 sm:max-w-xs">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    placeholder="Required to set a new password"
                    className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-lighter text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password (optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Leave blank to keep same"
                      className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-lighter text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-lighter text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {formData.password && (
                <div className="mt-6 mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Verification OTP
                  </label>
                  <div className="flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Enter 6-digit code"
                      className="flex-1 rounded-none rounded-l-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-lighter text-gray-900 dark:text-white focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpSending || otpSent}
                      className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                    >
                      {otpSending ? 'Sending...' : otpSent ? 'Sent' : 'Send OTP'}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Required to confirm your new password.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-lg shadow-md transition-all hover:shadow-lg disabled:opacity-70"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
