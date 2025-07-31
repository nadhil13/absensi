import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/database.js';

// Verify JWT Token
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user still exists and is active
        const users = await executeQuery(
            'SELECT user_id, email, full_name, role, is_active FROM users WHERE user_id = ? AND is_active = true',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        return res.status(403).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Check if user is admin
export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

// Optional authentication (for public endpoints that can have user context)
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const users = await executeQuery(
                'SELECT user_id, email, full_name, role, is_active FROM users WHERE user_id = ? AND is_active = true',
                [decoded.userId]
            );

            if (users.length > 0) {
                req.user = users[0];
            }
        }
        
        next();
    } catch (error) {
        // Ignore token errors for optional auth
        next();
    }
};