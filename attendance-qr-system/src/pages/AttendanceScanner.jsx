import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { 
  QrCodeIcon, 
  CameraIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  RefreshIcon
} from '@heroicons/react/24/outline';

const AttendanceScanner = () => {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const html5QrcodeScanner = useRef(null);

  useEffect(() => {
    fetchTodayAttendance();
    return () => {
      if (html5QrcodeScanner.current) {
        html5QrcodeScanner.current.clear();
      }
    };
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get('/attendance/today');
      if (response.data.success) {
        setTodayAttendance(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const startScanning = () => {
    setScanning(true);
    setScanResult(null);

    if (html5QrcodeScanner.current) {
      html5QrcodeScanner.current.clear();
    }

    html5QrcodeScanner.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
      },
      false
    );

    html5QrcodeScanner.current.render(onScanSuccess, onScanFailure);
  };

  const stopScanning = () => {
    setScanning(false);
    if (html5QrcodeScanner.current) {
      html5QrcodeScanner.current.clear();
    }
  };

  const onScanSuccess = async (decodedText, decodedResult) => {
    console.log('QR Code scanned:', decodedText);
    
    try {
      setLoading(true);
      stopScanning();

      const response = await axios.post('/attendance/scan-qr', {
        qrData: decodedText
      });

      if (response.data.success) {
        setScanResult({
          success: true,
          message: response.data.message,
          data: response.data.data
        });
        
        toast.success(response.data.message);
        
        // Refresh today's attendance
        await fetchTodayAttendance();
        
      } else {
        setScanResult({
          success: false,
          message: response.data.message
        });
        toast.error(response.data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'QR scan failed';
      setScanResult({
        success: false,
        message
      });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const onScanFailure = (error) => {
    // console.warn(`QR scan error: ${error}`);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-accent-400';
      case 'late': return 'text-yellow-400';
      case 'absent': return 'text-red-400';
      default: return 'text-dark-400';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'present': return 'bg-accent-500/10 border-accent-500/20';
      case 'late': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'absent': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-dark-500/10 border-dark-500/20';
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div 
            className="w-20 h-20 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            whileHover={{ 
              scale: 1.1, 
              rotate: 5,
              boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)"
            }}
          >
            <QrCodeIcon className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gradient mb-2">
            QR Scanner
          </h1>
          <p className="text-dark-400 text-lg">
            Scan QR code to mark your attendance
          </p>
        </motion.div>

        {/* Today's Attendance Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glass p-6 rounded-xl mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <ClockIcon className="w-6 h-6 mr-2 text-primary-400" />
            Today's Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Check In Status */}
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {formatTime(todayAttendance?.attendance?.check_in_time)}
              </div>
              <div className="text-sm text-dark-400">Check In</div>
              {todayAttendance?.hasCheckedIn && (
                <div className="flex items-center justify-center mt-2">
                  <CheckCircleIcon className="w-5 h-5 text-accent-400 mr-1" />
                  <span className="text-accent-400 text-sm">Completed</span>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${getStatusColor(todayAttendance?.attendance?.status)}`}>
                {todayAttendance?.attendance?.status?.toUpperCase() || '--'}
              </div>
              <div className="text-sm text-dark-400">Status</div>
              {todayAttendance?.attendance?.status && (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusBgColor(todayAttendance?.attendance?.status)}`}>
                  {todayAttendance.attendance.status}
                </div>
              )}
            </div>

            {/* Check Out Status */}
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {formatTime(todayAttendance?.attendance?.check_out_time)}
              </div>
              <div className="text-sm text-dark-400">Check Out</div>
              {todayAttendance?.hasCheckedOut && (
                <div className="flex items-center justify-center mt-2">
                  <CheckCircleIcon className="w-5 h-5 text-accent-400 mr-1" />
                  <span className="text-accent-400 text-sm">Completed</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Scanner Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-glass p-8 rounded-xl"
        >
          <div className="text-center">
            {!scanning && !scanResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div 
                  className="w-32 h-32 border-4 border-dashed border-primary-500/50 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                  whileHover={{ 
                    borderColor: "rgba(59, 130, 246, 0.8)",
                    scale: 1.05 
                  }}
                >
                  <CameraIcon className="w-16 h-16 text-primary-400" />
                </motion.div>

                <h3 className="text-2xl font-semibold text-white mb-4">
                  Ready to Scan
                </h3>
                <p className="text-dark-400 mb-6">
                  Click the button below to start scanning QR code
                </p>

                <motion.button
                  onClick={startScanning}
                  className="btn-primary px-8 py-4 text-lg font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CameraIcon className="w-6 h-6 mr-2" />
                  Start Scanning
                </motion.button>
              </motion.div>
            )}

            {scanning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Scanning QR Code...
                  </h3>
                  <p className="text-dark-400">
                    Point your camera at the QR code
                  </p>
                </div>

                {/* Scanner Container */}
                <div className="relative mx-auto max-w-md">
                  <div 
                    id="qr-reader" 
                    ref={scannerRef}
                    className="rounded-xl overflow-hidden border-4 border-primary-500/30"
                  ></div>
                  
                  {/* Scanning Animation Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                      className="absolute inset-0 border-4 border-primary-500 rounded-xl"
                      animate={{ 
                        boxShadow: [
                          "0 0 0 0 rgba(59, 130, 246, 0.7)",
                          "0 0 0 20px rgba(59, 130, 246, 0)",
                        ]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                  </div>
                </div>

                <motion.button
                  onClick={stopScanning}
                  className="btn-secondary mt-6 px-6 py-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <XCircleIcon className="w-5 h-5 mr-2" />
                  Stop Scanning
                </motion.button>
              </motion.div>
            )}

            {/* Scan Result */}
            <AnimatePresence>
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-6"
                >
                  <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center ${
                    scanResult.success ? 'bg-accent-500/20' : 'bg-red-500/20'
                  }`}>
                    {scanResult.success ? (
                      <CheckCircleIcon className="w-20 h-20 text-accent-400" />
                    ) : (
                      <XCircleIcon className="w-20 h-20 text-red-400" />
                    )}
                  </div>

                  <div>
                    <h3 className={`text-2xl font-semibold mb-2 ${
                      scanResult.success ? 'text-accent-400' : 'text-red-400'
                    }`}>
                      {scanResult.success ? 'Success!' : 'Failed!'}
                    </h3>
                    <p className="text-dark-300 text-lg">
                      {scanResult.message}
                    </p>
                  </div>

                  {scanResult.success && scanResult.data && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-dark-800/30 border border-dark-700/50 rounded-lg p-4"
                    >
                      <div className="text-sm text-dark-400 mb-2">Attendance Details:</div>
                      <div className="text-white">
                        <p><span className="text-primary-400">Type:</span> {scanResult.data.type}</p>
                        <p><span className="text-primary-400">Time:</span> {new Date(scanResult.data.timestamp).toLocaleString('id-ID')}</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex space-x-4 justify-center">
                    <motion.button
                      onClick={() => {
                        setScanResult(null);
                        startScanning();
                      }}
                      className="btn-primary px-6 py-3"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshIcon className="w-5 h-5 mr-2" />
                      Scan Again
                    </motion.button>

                    <motion.button
                      onClick={() => setScanResult(null)}
                      className="btn-secondary px-6 py-3"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Close
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-dark-900/50 backdrop-blur-sm flex items-center justify-center rounded-xl"
              >
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white font-medium">Processing QR Code...</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="card-glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">
              How to use QR Scanner
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-dark-300">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary-400 font-bold">1</span>
                </div>
                <p>Get QR code from admin or attendance system</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary-400 font-bold">2</span>
                </div>
                <p>Click "Start Scanning" and point camera at QR code</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary-400 font-bold">3</span>
                </div>
                <p>Your attendance will be recorded automatically</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AttendanceScanner;