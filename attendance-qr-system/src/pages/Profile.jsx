import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  UserIcon, 
  CameraIcon,
  PencilIcon,
  KeyIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    fullName: '',
    department: '',
    position: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        department: user.department || '',
        position: user.position || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setEditMode(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Password changed successfully!');
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section === 'profile') {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    } else if (section === 'password') {
      setPasswordData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: UserIcon },
    { id: 'security', name: 'Security', icon: KeyIcon }
  ];

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Profile Settings
          </h1>
          <p className="text-dark-400 text-lg">
            Manage your account information and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="card-glass p-6 rounded-xl border border-dark-700/50 sticky top-24">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <motion.div 
                    className="w-24 h-24 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    <UserIcon className="w-12 h-12 text-white" />
                  </motion.div>
                  
                  <motion.button
                    className="absolute bottom-4 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <CameraIcon className="w-4 h-4" />
                  </motion.button>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-1">
                  {user?.fullName}
                </h3>
                <p className="text-primary-400 text-sm mb-1">{user?.position}</p>
                <p className="text-dark-400 text-xs">{user?.department}</p>
              </div>

              {/* User Info */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-400">Employee ID:</span>
                  <span className="text-primary-400 font-mono">{user?.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Email:</span>
                  <span className="text-white truncate">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Role:</span>
                  <span className="text-white capitalize">{user?.role}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-glass rounded-xl overflow-hidden mb-6"
            >
              <div className="flex border-b border-dark-700/50">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'text-primary-400 border-b-2 border-primary-500 bg-primary-500/10'
                          : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Tab Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-glass p-6 rounded-xl border border-dark-700/50"
            >
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-white">
                      Profile Information
                    </h2>
                    
                    {!editMode ? (
                      <motion.button
                        onClick={() => setEditMode(true)}
                        className="btn-secondary px-4 py-2 text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit Profile
                      </motion.button>
                    ) : (
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => setEditMode(false)}
                          className="btn-secondary px-4 py-2 text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <XMarkIcon className="w-4 h-4 mr-2" />
                          Cancel
                        </motion.button>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => handleInputChange('profile', 'fullName', e.target.value)}
                        className="input-glass w-full"
                        disabled={!editMode}
                        required
                      />
                    </div>

                    {/* Department and Position */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          value={profileData.department}
                          onChange={(e) => handleInputChange('profile', 'department', e.target.value)}
                          className="input-glass w-full"
                          disabled={!editMode}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                          Position
                        </label>
                        <input
                          type="text"
                          value={profileData.position}
                          onChange={(e) => handleInputChange('profile', 'position', e.target.value)}
                          className="input-glass w-full"
                          disabled={!editMode}
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                        className="input-glass w-full"
                        disabled={!editMode}
                        placeholder="+62 812 3456 7890"
                      />
                    </div>

                    {/* Email (Read Only) */}
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="input-glass w-full opacity-60 cursor-not-allowed"
                        disabled
                      />
                      <p className="text-xs text-dark-400 mt-1">
                        Email cannot be changed. Contact administrator if needed.
                      </p>
                    </div>

                    {editMode && (
                      <div className="flex justify-end">
                        <motion.button
                          type="submit"
                          disabled={loading}
                          className="btn-primary px-6 py-3"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {loading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Saving...</span>
                            </div>
                          ) : (
                            <>
                              <CheckIcon className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </motion.button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Security Settings
                  </h2>

                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => handleInputChange('password', 'currentPassword', e.target.value)}
                          className="input-glass w-full pr-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-400 hover:text-white transition-colors"
                        >
                          {showPasswords.current ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => handleInputChange('password', 'newPassword', e.target.value)}
                          className="input-glass w-full pr-12"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-400 hover:text-white transition-colors"
                        >
                          {showPasswords.new ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => handleInputChange('password', 'confirmPassword', e.target.value)}
                          className="input-glass w-full pr-12"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-400 hover:text-white transition-colors"
                        >
                          {showPasswords.confirm ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-dark-800/30 border border-dark-700/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-white mb-2">Password Requirements:</h4>
                      <ul className="text-xs text-dark-300 space-y-1">
                        <li className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${passwordData.newPassword.length >= 6 ? 'bg-accent-400' : 'bg-dark-500'}`}></div>
                          <span>At least 6 characters long</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword ? 'bg-accent-400' : 'bg-dark-500'}`}></div>
                          <span>Passwords match</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex justify-end">
                      <motion.button
                        type="submit"
                        disabled={loading}
                        className="btn-primary px-6 py-3"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Changing...</span>
                          </div>
                        ) : (
                          <>
                            <KeyIcon className="w-4 h-4 mr-2" />
                            Change Password
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;