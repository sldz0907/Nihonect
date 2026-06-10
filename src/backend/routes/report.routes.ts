import { Router } from 'express';
import { createReport, getReports, updateReportStatus } from '../controllers/report.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// User routes
router.post('/', requireAuth, createReport);

// Admin routes
router.get('/', requireAuth, requireAdmin, getReports);
router.put('/:id/status', requireAuth, requireAdmin, updateReportStatus);

export default router;
