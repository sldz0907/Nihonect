import { Router } from 'express';
import { createReport, getReports, updateReportStatus } from '../controllers/report.controller.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// User routes
router.post('/', authMiddleware, createReport);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getReports);
router.put('/:id/status', authMiddleware, adminMiddleware, updateReportStatus);

export default router;
