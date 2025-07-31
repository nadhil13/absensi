import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ClockIcon, 
  CalendarDaysIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as LateClock,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const AttendanceHistory = () => {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAttendanceHistory();
  }, [filters, pagination.currentPage]);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters
      });

      const response = await axios.get(`/attendance/history?${params}`);
      
      if (response.data.success) {
        setAttendanceHistory(response.data.data.attendance);
        setPagination(prev => ({
          ...prev,
          ...response.data.data.pagination
        }));
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      toast.error('Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      search: ''
    });
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const handleExport = async (format) => {
    try {
      toast.success(`Exporting to ${format.toUpperCase()}...`);
      
      // Build query parameters
      const params = new URLSearchParams({
        ...filters
      });

      // Call export endpoint
      const response = await axios.get(`/export/user/${format}?${params}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${format}_${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${format.toUpperCase()} exported successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export to ${format.toUpperCase()}`);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon className="w-5 h-5 text-accent-400" />;
      case 'late':
        return <LateClock className="w-5 h-5 text-yellow-400" />;
      case 'absent':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-dark-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-accent-500/10 text-accent-400 border-accent-500/20';
      case 'late': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'absent': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-dark-500/10 text-dark-400 border-dark-500/20';
    }
  };

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '--';
    
    const startTime = new Date(checkIn);
    const endTime = new Date(checkOut);
    const diffMs = endTime - startTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return `${diffHours.toFixed(1)}h`;
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">
                Attendance History
              </h1>
              <p className="text-dark-400 text-lg">
                View and manage your attendance records
              </p>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <motion.button
                onClick={() => handleExport('pdf')}
                className="btn-secondary px-4 py-2 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export PDF
              </motion.button>
              
              <motion.button
                onClick={() => handleExport('excel')}
                className="btn-primary px-4 py-2 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export Excel
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-glass p-6 rounded-xl mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FunnelIcon className="w-6 h-6 mr-2 text-primary-400" />
              Filters
            </h2>
            
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary px-4 py-2 text-sm lg:hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </motion.button>
          </div>

          <AnimatePresence>
            {(showFilters || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="input-glass w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="input-glass w-full"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="input-glass w-full"
                  >
                    <option value="">All Status</option>
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-dark-400" />
                    </div>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search notes..."
                      className="input-glass pl-10 w-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clear Filters */}
          {(filters.startDate || filters.endDate || filters.status || filters.search) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center"
            >
              <button
                onClick={clearFilters}
                className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Attendance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glass rounded-xl overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-white">Loading attendance history...</p>
            </div>
          ) : attendanceHistory.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarDaysIcon className="w-16 h-16 text-dark-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Records Found</h3>
              <p className="text-dark-400">
                {filters.startDate || filters.endDate || filters.status || filters.search
                  ? 'No attendance records match your filters.'
                  : 'You haven\'t recorded any attendance yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-dark-800/50 px-6 py-4 border-b border-dark-700/50">
                <h2 className="text-lg font-semibold text-white">
                  Attendance Records ({pagination.totalRecords} total)
                </h2>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-800/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Check In</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Check Out</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Work Hours</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700/50">
                    {attendanceHistory.map((record, index) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-dark-800/20 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-white font-medium">
                            {formatDate(record.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-white">
                            {formatTime(record.check_in_time)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-white">
                            {formatTime(record.check_out_time)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-white">
                            {calculateWorkHours(record.check_in_time, record.check_out_time)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(record.status)}
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="text-dark-300 text-sm truncate">
                            {record.notes || '--'}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-dark-800/30 px-6 py-4 border-t border-dark-700/50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-dark-400">
                      Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of{' '}
                      {pagination.totalRecords} results
                    </div>

                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                        disabled={pagination.currentPage === 1}
                        className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: pagination.currentPage === 1 ? 1 : 1.05 }}
                        whileTap={{ scale: pagination.currentPage === 1 ? 1 : 0.95 }}
                      >
                        Previous
                      </motion.button>

                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <motion.button
                              key={page}
                              onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                pagination.currentPage === page
                                  ? 'bg-primary-600 text-white'
                                  : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {page}
                            </motion.button>
                          );
                        })}
                      </div>

                      <motion.button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: pagination.currentPage === pagination.totalPages ? 1 : 1.05 }}
                        whileTap={{ scale: pagination.currentPage === pagination.totalPages ? 1 : 0.95 }}
                      >
                        Next
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AttendanceHistory;