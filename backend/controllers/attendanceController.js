import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '../config/database.js';

// Generate QR Code for attendance
export const generateAttendanceQR = async (req, res) => {
    try {
        const { type } = req.body; // 'check_in' or 'check_out'
        
        if (!type || !['check_in', 'check_out'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Valid type is required (check_in or check_out)'
            });
        }

        // Clean up expired QR codes
        await executeQuery(
            'DELETE FROM qr_sessions WHERE expires_at < NOW()',
            []
        );

        // Generate session ID and QR data
        const sessionId = uuidv4();
        const qrData = {
            sessionId,
            type,
            timestamp: Date.now(),
            expiresAt: Date.now() + (parseInt(process.env.QR_CODE_EXPIRE_TIME) || 300000) // 5 minutes default
        };

        const qrCodeDataString = JSON.stringify(qrData);
        const qrCodeUrl = await QRCode.toDataURL(qrCodeDataString);

        // Store QR session in database
        const expiresAt = new Date(qrData.expiresAt);
        await executeQuery(
            'INSERT INTO qr_sessions (session_id, qr_code_data, type, expires_at) VALUES (?, ?, ?, ?)',
            [sessionId, qrCodeDataString, type, expiresAt]
        );

        res.json({
            success: true,
            data: {
                qrCode: qrCodeUrl,
                sessionId,
                type,
                expiresAt: qrData.expiresAt,
                expiresIn: parseInt(process.env.QR_CODE_EXPIRE_TIME) || 300000
            }
        });

    } catch (error) {
        console.error('Generate QR error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Scan QR Code for attendance
export const scanAttendanceQR = async (req, res) => {
    try {
        const { qrData } = req.body;
        const userId = req.user.user_id;

        if (!qrData) {
            return res.status(400).json({
                success: false,
                message: 'QR data is required'
            });
        }

        let parsedQRData;
        try {
            parsedQRData = JSON.parse(qrData);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid QR code format'
            });
        }

        const { sessionId, type } = parsedQRData;

        // Verify QR session
        const sessions = await executeQuery(
            'SELECT * FROM qr_sessions WHERE session_id = ? AND type = ? AND expires_at > NOW() AND is_used = false',
            [sessionId, type]
        );

        if (sessions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'QR code is invalid, expired, or already used'
            });
        }

        const today = new Date().toISOString().split('T')[0];

        // Check if user has attendance record for today
        const existingAttendance = await executeQuery(
            'SELECT * FROM attendance WHERE user_id = ? AND date = ?',
            [userId, today]
        );

        let attendanceId;
        const currentTime = new Date();

        if (type === 'check_in') {
            if (existingAttendance.length > 0 && existingAttendance[0].check_in_time) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already checked in today'
                });
            }

            // Determine if late
            const workStartTime = '08:00:00';
            const currentTimeString = currentTime.toTimeString().split(' ')[0];
            const isLate = currentTimeString > workStartTime;
            const status = isLate ? 'late' : 'present';

            if (existingAttendance.length > 0) {
                // Update existing record
                await executeQuery(
                    'UPDATE attendance SET check_in_time = ?, status = ?, check_in_qr = ? WHERE user_id = ? AND date = ?',
                    [currentTime, status, sessionId, userId, today]
                );
                attendanceId = existingAttendance[0].id;
            } else {
                // Create new record
                const result = await executeQuery(
                    'INSERT INTO attendance (user_id, check_in_time, date, status, check_in_qr) VALUES (?, ?, ?, ?, ?)',
                    [userId, currentTime, today, status, sessionId]
                );
                attendanceId = result.insertId;
            }

        } else if (type === 'check_out') {
            if (existingAttendance.length === 0 || !existingAttendance[0].check_in_time) {
                return res.status(400).json({
                    success: false,
                    message: 'You must check in first before checking out'
                });
            }

            if (existingAttendance[0].check_out_time) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already checked out today'
                });
            }

            // Update with check out time
            await executeQuery(
                'UPDATE attendance SET check_out_time = ?, check_out_qr = ? WHERE user_id = ? AND date = ?',
                [currentTime, sessionId, userId, today]
            );
            attendanceId = existingAttendance[0].id;
        }

        // Mark QR session as used
        await executeQuery(
            'UPDATE qr_sessions SET is_used = true, used_by = ? WHERE session_id = ?',
            [userId, sessionId]
        );

        // Get updated attendance record
        const updatedAttendance = await executeQuery(
            'SELECT * FROM attendance WHERE id = ?',
            [attendanceId]
        );

        res.json({
            success: true,
            message: `${type.replace('_', ' ')} successful`,
            data: {
                attendanceId,
                type,
                timestamp: currentTime,
                attendance: updatedAttendance[0]
            }
        });

    } catch (error) {
        console.error('Scan QR error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get attendance history
export const getAttendanceHistory = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { startDate, endDate, page = 1, limit = 10 } = req.query;

        let query = 'SELECT * FROM attendance WHERE user_id = ?';
        let queryParams = [userId];

        if (startDate && endDate) {
            query += ' AND date BETWEEN ? AND ?';
            queryParams.push(startDate, endDate);
        } else if (startDate) {
            query += ' AND date >= ?';
            queryParams.push(startDate);
        } else if (endDate) {
            query += ' AND date <= ?';
            queryParams.push(endDate);
        }

        query += ' ORDER BY date DESC';

        // Add pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), offset);

        const attendanceRecords = await executeQuery(query, queryParams);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM attendance WHERE user_id = ?';
        let countParams = [userId];

        if (startDate && endDate) {
            countQuery += ' AND date BETWEEN ? AND ?';
            countParams.push(startDate, endDate);
        } else if (startDate) {
            countQuery += ' AND date >= ?';
            countParams.push(startDate);
        } else if (endDate) {
            countQuery += ' AND date <= ?';
            countParams.push(endDate);
        }

        const totalCount = await executeQuery(countQuery, countParams);

        res.json({
            success: true,
            data: {
                attendance: attendanceRecords,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount[0].total / parseInt(limit)),
                    totalRecords: totalCount[0].total,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get attendance history error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get today's attendance
export const getTodayAttendance = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const today = new Date().toISOString().split('T')[0];

        const attendance = await executeQuery(
            'SELECT * FROM attendance WHERE user_id = ? AND date = ?',
            [userId, today]
        );

        res.json({
            success: true,
            data: {
                attendance: attendance.length > 0 ? attendance[0] : null,
                hasCheckedIn: attendance.length > 0 && attendance[0].check_in_time,
                hasCheckedOut: attendance.length > 0 && attendance[0].check_out_time
            }
        });

    } catch (error) {
        console.error('Get today attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Admin: Get all attendance records
export const getAllAttendance = async (req, res) => {
    try {
        const { startDate, endDate, userId, department, status, page = 1, limit = 20 } = req.query;

        let query = `
            SELECT a.*, u.full_name, u.department, u.position, u.email 
            FROM attendance a 
            JOIN users u ON a.user_id = u.user_id 
            WHERE 1=1
        `;
        let queryParams = [];

        if (startDate && endDate) {
            query += ' AND a.date BETWEEN ? AND ?';
            queryParams.push(startDate, endDate);
        }

        if (userId) {
            query += ' AND a.user_id = ?';
            queryParams.push(userId);
        }

        if (department) {
            query += ' AND u.department = ?';
            queryParams.push(department);
        }

        if (status) {
            query += ' AND a.status = ?';
            queryParams.push(status);
        }

        query += ' ORDER BY a.date DESC, a.check_in_time DESC';

        // Add pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), offset);

        const attendanceRecords = await executeQuery(query, queryParams);

        // Get total count
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM attendance a 
            JOIN users u ON a.user_id = u.user_id 
            WHERE 1=1
        `;
        let countParams = [];

        if (startDate && endDate) {
            countQuery += ' AND a.date BETWEEN ? AND ?';
            countParams.push(startDate, endDate);
        }

        if (userId) {
            countQuery += ' AND a.user_id = ?';
            countParams.push(userId);
        }

        if (department) {
            countQuery += ' AND u.department = ?';
            countParams.push(department);
        }

        if (status) {
            countQuery += ' AND a.status = ?';
            countParams.push(status);
        }

        const totalCount = await executeQuery(countQuery, countParams);

        res.json({
            success: true,
            data: {
                attendance: attendanceRecords,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount[0].total / parseInt(limit)),
                    totalRecords: totalCount[0].total,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get all attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};