import express from 'express';
import { 
    generateAttendanceQR, 
    scanAttendanceQR, 
    getAttendanceHistory, 
    getTodayAttendance, 
    getAllAttendance 
} from '../controllers/attendanceController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// QR Code routes
router.post('/generate-qr', authenticateToken, requireAdmin, generateAttendanceQR);
router.post('/scan-qr', authenticateToken, scanAttendanceQR);

// Attendance routes
router.get('/today', authenticateToken, getTodayAttendance);
router.get('/history', authenticateToken, getAttendanceHistory);

// Admin routes
router.get('/all', authenticateToken, requireAdmin, getAllAttendance);

export default router;