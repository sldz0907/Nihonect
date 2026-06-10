import { Router } from 'express';
import { createReport, getReports, updateReportStatus, deleteReport } from '../controllers/report.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// User routes
router.post('/', requireAuth, createReport);

// Admin routes
router.get('/', requireAuth, requireAdmin, getReports);
router.put('/:id/status', requireAuth, requireAdmin, updateReportStatus);
router.delete('/:id', requireAuth, requireAdmin, deleteReport);

export default router;
