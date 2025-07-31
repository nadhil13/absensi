import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  QrCodeIcon, 
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  DocumentArrowDownIcon,
  RefreshIcon
} from '@heroicons/react/24/outline';

const AdminPanel = () => {
  const [activeQR, setActiveQR] = useState(null);
  const [qrType, setQRType] = useState('check_in');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayPresent: 0,
    todayLate: 0,
    todayAbsent: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Mock stats - you can implement the actual API endpoint
      setStats({
        totalUsers: 45,
        todayPresent: 38,
        todayLate: 5,
        todayAbsent: 2
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateQRCode = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post('/attendance/generate-qr', {
        type: qrType
      });

      if (response.data.success) {
        setActiveQR(response.data.data);
        toast.success(`QR Code generated for ${qrType.replace('_', ' ')}`);
        
        // Auto refresh QR after expiry
        setTimeout(() => {
          setActiveQR(null);
        }, response.data.data.expiresIn);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate QR code';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (expiresAt) => {
    const now = Date.now();
    const remaining = expiresAt - now;
    
    if (remaining <= 0) return 'Expired';
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: UsersIcon,
      color: 'bg-gradient-to-r from-primary-500 to-primary-600'
    },
    {
      title: 'Present Today',
      value: stats.todayPresent,
      icon: ChartBarIcon,
      color: 'bg-gradient-to-r from-accent-500 to-accent-600'
    },
    {
      title: 'Late Today',
      value: stats.todayLate,
      icon: ChartBarIcon,
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600'
    },
    {
      title: 'Absent Today',
      value: stats.todayAbsent,
      icon: ChartBarIcon,
      color: 'bg-gradient-to-r from-red-500 to-red-600'
    }
  ];

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Admin Panel
          </h1>
          <p className="text-dark-400 text-lg">
            Manage attendance system and generate QR codes
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -2 }}
              className="card-glass p-6 rounded-xl border border-dark-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-dark-400">{stat.title}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Generator */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card-glass p-6 rounded-xl border border-dark-700/50"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <QrCodeIcon className="w-8 h-8 mr-3 text-primary-400" />
              QR Code Generator
            </h2>

            <div className="space-y-6">
              {/* QR Type Selection */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-3">
                  Select QR Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    onClick={() => setQRType('check_in')}
                    className={`p-4 rounded-lg border transition-all ${
                      qrType === 'check_in'
                        ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                        : 'border-dark-600 bg-dark-800/30 text-dark-300 hover:border-primary-500/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold">Check In</div>
                      <div className="text-xs opacity-70">Morning attendance</div>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => setQRType('check_out')}
                    className={`p-4 rounded-lg border transition-all ${
                      qrType === 'check_out'
                        ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                        : 'border-dark-600 bg-dark-800/30 text-dark-300 hover:border-primary-500/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold">Check Out</div>
                      <div className="text-xs opacity-70">Evening attendance</div>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                onClick={generateQRCode}
                disabled={loading}
                className="btn-primary w-full py-3 text-lg font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <>
                    <QrCodeIcon className="w-6 h-6 mr-2" />
                    Generate QR Code
                  </>
                )}
              </motion.button>

              {/* Active QR Display */}
              {activeQR && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-6 rounded-xl text-center"
                >
                  <img 
                    src={activeQR.qrCode} 
                    alt="QR Code" 
                    className="w-48 h-48 mx-auto mb-4"
                  />
                  
                  <div className="text-dark-800 space-y-2">
                    <div className="font-semibold text-lg">
                      {activeQR.type.replace('_', ' ').toUpperCase()} QR Code
                    </div>
                    <div className="text-sm">
                      Expires in: {formatTimeRemaining(activeQR.expiresAt)}
                    </div>
                    <div className="text-xs text-dark-600">
                      Session ID: {activeQR.sessionId}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* System Status */}
            <div className="card-glass p-6 rounded-xl border border-dark-700/50">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <CogIcon className="w-6 h-6 mr-2 text-primary-400" />
                System Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-accent-400 rounded-full animate-pulse"></div>
                    <span className="text-accent-400 text-sm">Connected</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">API Server</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-accent-400 rounded-full animate-pulse"></div>
                    <span className="text-accent-400 text-sm">Running</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">QR Generator</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-accent-400 rounded-full animate-pulse"></div>
                    <span className="text-accent-400 text-sm">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-glass p-6 rounded-xl border border-dark-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <motion.button
                  className="btn-secondary w-full justify-start"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <DocumentArrowDownIcon className="w-5 h-5 mr-3" />
                  Export Today's Report
                </motion.button>
                
                <motion.button
                  onClick={fetchStats}
                  className="btn-secondary w-full justify-start"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshIcon className="w-5 h-5 mr-3" />
                  Refresh Statistics
                </motion.button>
                
                <motion.button
                  className="btn-secondary w-full justify-start"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UsersIcon className="w-5 h-5 mr-3" />
                  Manage Users
                </motion.button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card-glass p-6 rounded-xl border border-dark-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">
                Recent Activity
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">John Doe checked in</span>
                  <span className="text-dark-400">2 min ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Jane Smith checked out</span>
                  <span className="text-dark-400">5 min ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">QR Code generated</span>
                  <span className="text-dark-400">10 min ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Mike Johnson checked in</span>
                  <span className="text-dark-400">15 min ago</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;