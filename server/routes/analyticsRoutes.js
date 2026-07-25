import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import {
  getDashboardSummary,
  getResourceStats,
  getDepartmentStats,
  getTopDownloaded,
  getTopRated,
  getRecentActivity,
  getMonthlyUploads,
  getMonthlyDownloads,
  getVerificationStats,
} from '../controllers/analyticsController.js';

const router = Router();

// All analytics routes require authentication + admin role
router.use(authMiddleware, roleMiddleware('admin'));

// GET /api/admin/analytics/dashboard  — Dashboard summary
router.get('/dashboard', getDashboardSummary);

// GET /api/admin/analytics/resources  — Resource type breakdown
router.get('/resources', getResourceStats);

// GET /api/admin/analytics/departments  — Department statistics
router.get('/departments', getDepartmentStats);

// GET /api/admin/analytics/top-downloads  — Top 10 downloaded resources
router.get('/top-downloads', getTopDownloaded);

// GET /api/admin/analytics/top-rated  — Top rated resources (min 3 ratings)
router.get('/top-rated', getTopRated);

// GET /api/admin/analytics/activity  — Recent activity timeline
router.get('/activity', getRecentActivity);

// GET /api/admin/analytics/uploads/monthly  — Monthly uploads
router.get('/uploads/monthly', getMonthlyUploads);

// GET /api/admin/analytics/downloads/monthly  — Monthly downloads
router.get('/downloads/monthly', getMonthlyDownloads);

// GET /api/admin/analytics/verifications  — Verification statistics
router.get('/verifications', getVerificationStats);

export default router;

