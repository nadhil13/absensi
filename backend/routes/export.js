import express from 'express';
import { exportToExcel, exportToPDF, getExportStats } from '../controllers/exportController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Export routes - admin only
router.get('/excel', authenticateToken, requireAdmin, exportToExcel);
router.get('/pdf', authenticateToken, requireAdmin, exportToPDF);
router.get('/stats', authenticateToken, requireAdmin, getExportStats);

// User export routes (own data only)
router.get('/user/excel', authenticateToken, async (req, res) => {
    // Set userId to current user
    req.query.userId = req.user.user_id;
    await exportToExcel(req, res);
});

router.get('/user/pdf', authenticateToken, async (req, res) => {
    // Set userId to current user
    req.query.userId = req.user.user_id;
    await exportToPDF(req, res);
});

export default router;