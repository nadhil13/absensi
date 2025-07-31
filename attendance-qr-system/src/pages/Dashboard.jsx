import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  QrCodeIcon, 
  ClockIcon, 
  CalendarDaysIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  CameraIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// 3D ID Card Component
const IDCard3D = ({ user }) => {
  return (
    <motion.div 
      className="relative w-full max-w-sm mx-auto perspective-1000"
      whileHover={{ rotateY: 15, rotateX: 5 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Card Container */}
      <div className="relative preserve-3d">
        {/* Main Card */}
        <div className="card-glass p-6 rounded-2xl border border-dark-700/50 shadow-dark-lg backdrop-blur-xl relative overflow-hidden transform-gpu">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-accent-500/20 to-primary-600/20 rounded-2xl"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <motion.div
              className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary-400/30 to-accent-400/30 rounded-full blur-2xl"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-br from-accent-400/30 to-primary-400/30 rounded-full blur-2xl"
              animate={{
                rotate: [360, 0],
                scale: [1, 0.8, 1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          {/* Card Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <QrCodeIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-primary-400">AttendanceQR</span>
              </div>
              <div className="text-xs text-dark-400">ID CARD</div>
            </div>

            {/* Profile Section */}
            <div className="text-center mb-6">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full mx-auto mb-3 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <UserIcon className="w-10 h-10 text-white" />
              </motion.div>
              
              <h3 className="text-lg font-bold text-white mb-1">{user?.fullName}</h3>
              <p className="text-sm text-primary-400 mb-1">{user?.position}</p>
              <p className="text-xs text-dark-400">{user?.department}</p>
            </div>

            {/* QR Code Section */}
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-white rounded-lg mx-auto p-2 mb-2">
                {user?.qrCode ? (
                  <img 
                    src={user.qrCode} 
                    alt="QR Code" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-dark-200 rounded flex items-center justify-center">
                    <QrCodeIcon className="w-8 h-8 text-dark-600" />
                  </div>
                )}
              </div>
              <p className="text-xs text-dark-400">Personal QR Code</p>
            </div>

            {/* Footer */}
            <div className="text-center">
              <div className="text-xs text-dark-400 mb-1">Employee ID</div>
              <div className="text-sm font-mono text-primary-400">{user?.userId}</div>
            </div>

            {/* Holographic Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="card-glass p-6 rounded-xl border border-dark-700/50"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`text-xs px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-accent-500/20 text-accent-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-dark-400">{title}</div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({
    thisMonth: 0,
    onTime: 0,
    late: 0,
    absent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch today's attendance
      const todayResponse = await axios.get('/attendance/today');
      if (todayResponse.data.success) {
        setTodayAttendance(todayResponse.data.data);
      }

      // Fetch attendance stats (mock data for now)
      // You can implement this endpoint in the backend
      setAttendanceStats({
        thisMonth: 22,
        onTime: 18,
        late: 4,
        absent: 2
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickActions = [
    {
      title: 'Scan QR Code',
      description: 'Mark your attendance',
      icon: CameraIcon,
      color: 'bg-gradient-to-r from-primary-500 to-primary-600',
      link: '/scanner'
    },
    {
      title: 'View History',
      description: 'Check attendance records',
      icon: DocumentTextIcon,
      color: 'bg-gradient-to-r from-accent-500 to-accent-600',
      link: '/history'
    },
    {
      title: 'Profile Settings',
      description: 'Update your information',
      icon: UserIcon,
      color: 'bg-gradient-to-r from-primary-600 to-accent-500',
      link: '/profile'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen p-4 lg:p-8 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">
                {getGreeting()}, {user?.fullName?.split(' ')[0]}! 👋
              </h1>
              <p className="text-dark-400 text-lg">
                {formatDate(new Date())}
              </p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 lg:mt-0"
            >
              <div className="flex items-center space-x-4 text-sm text-dark-300">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-accent-400 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
                <div className="text-dark-500">|</div>
                <div>{new Date().toLocaleTimeString('id-ID')}</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats and Today's Status */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Attendance Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-semibold text-white mb-4">Today's Attendance</h2>
              <div className="card-glass p-6 rounded-xl border border-dark-700/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Check In */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary-500/20 flex items-center justify-center">
                      <ClockIcon className="w-8 h-8 text-primary-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {formatTime(todayAttendance?.attendance?.check_in_time)}
                    </div>
                    <div className="text-dark-400 text-sm">Check In</div>
                    {todayAttendance?.hasCheckedIn && (
                      <div className="flex items-center justify-center mt-2 text-accent-400 text-sm">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Completed
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-accent-500/20 flex items-center justify-center">
                      {todayAttendance?.attendance?.status === 'present' ? (
                        <CheckCircleIcon className="w-8 h-8 text-accent-400" />
                      ) : (
                        <XCircleIcon className="w-8 h-8 text-red-400" />
                      )}
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {todayAttendance?.attendance?.status?.toUpperCase() || 'PENDING'}
                    </div>
                    <div className="text-dark-400 text-sm">Status</div>
                  </div>

                  {/* Check Out */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-dark-600/50 flex items-center justify-center">
                      <ClockIcon className="w-8 h-8 text-dark-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {formatTime(todayAttendance?.attendance?.check_out_time)}
                    </div>
                    <div className="text-dark-400 text-sm">Check Out</div>
                    {todayAttendance?.hasCheckedOut && (
                      <div className="flex items-center justify-center mt-2 text-accent-400 text-sm">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Completed
                      </div>
                    )}
                  </div>
                </div>

                {/* Attendance Action */}
                {!todayAttendance?.hasCheckedIn && (
                  <div className="mt-6 text-center">
                    <Link to="/scanner">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary px-8 py-3 text-lg font-semibold"
                      >
                        <CameraIcon className="w-6 h-6 mr-2" />
                        Check In Now
                      </motion.button>
                    </Link>
                  </div>
                )}

                {todayAttendance?.hasCheckedIn && !todayAttendance?.hasCheckedOut && (
                  <div className="mt-6 text-center">
                    <Link to="/scanner">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-secondary px-8 py-3 text-lg font-semibold"
                      >
                        <CameraIcon className="w-6 h-6 mr-2" />
                        Check Out
                      </motion.button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-semibold text-white mb-4">Monthly Statistics</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="This Month"
                  value={attendanceStats.thisMonth}
                  icon={CalendarDaysIcon}
                  color="bg-gradient-to-r from-primary-500 to-primary-600"
                  trend={5}
                />
                <StatsCard
                  title="On Time"
                  value={attendanceStats.onTime}
                  icon={CheckCircleIcon}
                  color="bg-gradient-to-r from-accent-500 to-accent-600"
                  trend={2}
                />
                <StatsCard
                  title="Late"
                  value={attendanceStats.late}
                  icon={ClockIcon}
                  color="bg-gradient-to-r from-yellow-500 to-yellow-600"
                  trend={-10}
                />
                <StatsCard
                  title="Absent"
                  value={attendanceStats.absent}
                  icon={XCircleIcon}
                  color="bg-gradient-to-r from-red-500 to-red-600"
                  trend={-25}
                />
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.link}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="card-glass p-6 rounded-xl border border-dark-700/50 cursor-pointer group"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${action.color}`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-dark-400 text-sm">{action.description}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - 3D ID Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="sticky top-24"
            >
              <h2 className="text-2xl font-semibold text-white mb-4 text-center">Your ID Card</h2>
              <IDCard3D user={user} />
              
              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 card-glass p-4 rounded-xl border border-dark-700/50"
              >
                <h3 className="text-lg font-semibold text-white mb-3">Profile Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-400">Email:</span>
                    <span className="text-white">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">Department:</span>
                    <span className="text-white">{user?.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">Position:</span>
                    <span className="text-white">{user?.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">Employee ID:</span>
                    <span className="text-primary-400 font-mono">{user?.userId}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;