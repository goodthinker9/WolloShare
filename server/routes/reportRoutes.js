import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import reportController from '../controllers/reportController.js';

const router = Router();

// ── Student routes (authenticated) ────────────────────────────────

// POST   /api/reports           — File a new report
router.post(
  '/',
  authMiddleware,
  roleMiddleware('student'),
  reportController.createReport
);

// GET    /api/reports/my        — Reports filed by the current student
router.get(
  '/my',
  authMiddleware,
  roleMiddleware('student'),
  reportController.getMyReports
);

// ── Admin routes (authenticated + admin role) ─────────────────────

// GET    /api/admin/reports              — List all reports (optional ?status= filter)
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  reportController.getAllReports
);

// GET    /api/admin/reports/:id          — Full report detail
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  reportController.getReportById
);

// PUT    /api/admin/reports/:id/status   — Update report status
router.put(
  '/:id/status',
  authMiddleware,
  roleMiddleware('admin'),
  reportController.updateReportStatus
);

// PUT    /api/admin/reports/:id/assign   — Assign a reviewer
router.put(
  '/:id/assign',
  authMiddleware,
  roleMiddleware('admin'),
  reportController.assignReviewer
);

// DELETE /api/admin/reports/:id          — Delete a report
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  reportController.deleteReport
);

export default router;


