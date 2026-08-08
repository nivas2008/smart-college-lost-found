import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Building, Phone, Lock, Save, X, KeyRound, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
  const { user, updateSession } = useContext(AuthContext);
  
  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    mobile: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passData, setPassData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  });
  const [modalOtpSending, setModalOtpSending] = useState(false);
  const [modalOtpSent, setModalOtpSent] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || '',
        mobile: user.mobile || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePassChange = (e) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put('/api/auth/profile', {
        name: formData.name,
        department: formData.department,
        mobile: formData.mobile
      }, config);
      
      updateSession(data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendModalOtp = async () => {
    if (!passData.oldPassword || !passData.newPassword) {
      return setModalError('Please provide current password and new password before requesting OTP.');
    }
    if (passData.newPassword !== passData.confirmPassword) {
      return setModalError('New passwords do not match.');
    }
    
    setModalOtpSending(true);
    setModalError(null);
    setModalSuccess(null);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/auth/profile/send-otp', {}, config);
      setModalOtpSent(true);
      setModalSuccess('OTP sent to your email successfully!');
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setModalOtpSending(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!passData.oldPassword) return setModalError('Please provide your current password');
    if (passData.newPassword !== passData.confirmPassword) return setModalError('New passwords do not match');
    if (!passData.otp) return setModalError('Verification OTP is required');

    setIsUpdatingPassword(true);
    setModalError(null);
    setModalSuccess(null);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put('/api/auth/profile', {
        oldPassword: passData.oldPassword,
        password: passData.newPassword,
        otp: passData.otp
      }, config);
      
      updateSession(data);
      setModalSuccess('Password updated successfully!');
      
      // Reset form and close modal after a short delay
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPassData({ oldPassword: '', newPassword: '', confirmPassword: '', otp: '' });
        setModalOtpSent(false);
        setModalSuccess(null);
        setModalError(null);
      }, 2000);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPassData({ oldPassword: '', newPassword: '', confirmPassword: '', otp: '' });
    setModalOtpSent(false);
    setModalError(null);
    setModalSuccess(null);
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

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your password and security settings</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Lock size={16} className="mr-2" />
                Change Password
              </button>
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

      {/* Password Change Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closePasswordModal}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-dark-lighter rounded-2xl shadow-2xl overflow-hidden w-full max-w-md border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <ShieldCheck className="mr-2 text-primary" size={24} />
                  Change Password
                </h3>
                <button
                  onClick={closePasswordModal}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {modalError && (
                  <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-100 dark:border-red-800">
                    {modalError}
                  </div>
                )}
                
                {modalSuccess && (
                  <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg mb-4 text-sm border border-green-100 dark:border-green-800">
                    {modalSuccess}
                  </div>
                )}

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
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
                        required
                        value={passData.oldPassword}
                        onChange={handlePassChange}
                        className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-dark text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="newPassword"
                        required
                        value={passData.newPassword}
                        onChange={handlePassChange}
                        className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-dark text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition-all"
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
                        required
                        value={passData.confirmPassword}
                        onChange={handlePassChange}
                        className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-dark text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Verification OTP
                    </label>
                    <div className="flex rounded-lg shadow-sm overflow-hidden">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <KeyRound className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="otp"
                          required
                          value={passData.otp}
                          onChange={handlePassChange}
                          placeholder="6-digit code"
                          className="pl-10 w-full rounded-none border-gray-300 dark:border-gray-600 bg-white dark:bg-dark text-gray-900 dark:text-white focus:border-primary focus:ring focus:ring-primary/20 transition-all border-r-0"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendModalOtp}
                        disabled={modalOtpSending || modalOtpSent}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                      >
                        {modalOtpSending ? 'Sending...' : modalOtpSent ? 'Sent' : 'Send OTP'}
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 text-center">
                      We'll send a code to your email to confirm this change.
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                    >
                      {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
