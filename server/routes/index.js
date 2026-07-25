import { Router } from 'express';
import authRoutes from './authRoutes.js';
import verificationRoutes from './verificationRoutes.js';
import resourceRoutes from './resourceRoutes.js';
import reportRoutes from './reportRoutes.js';
import bookmarkRoutes from './bookmarkRoutes.js';
import ratingRoutes from './ratingRoutes.js';
import downloadRoutes from './downloadRoutes.js';
import profileRoutes from './profileRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import adminUserRoutes from './adminUserRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import verificationController from '../controllers/verificationController.js';
import dashboardController from '../controllers/dashboardController.js';
import adminDashboardController from '../controllers/adminDashboardController.js';
import {
  getPendingResources,
  approveResource,
  rejectResource,
} from '../controllers/resourceController.js';
import {
  validateResourceId,
  validateAdminDecision,
  handleValidationErrors,
} from '../validators/resourceValidator.js';

const router = Router();

// ── Health check ─────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WolloShare API is running',
  });
});

// ── Auth routes ───────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ── Student verification status ──────────────────────────────────
router.get(
  '/student/verification-status',
  authMiddleware,
  roleMiddleware('student'),
  verificationController.getStudentVerificationStatus
);

// ── Student dashboard ─────────────────────────────────────────────
router.get(
  '/dashboard/student',
  authMiddleware,
  roleMiddleware('student'),
  dashboardController.getStudentDashboard
);

// ── Admin dashboard ───────────────────────────────────────────────
router.get(
  '/admin/dashboard',
  authMiddleware,
  roleMiddleware('admin'),
  adminDashboardController.getAdminDashboard
);

// ── Admin verification management ────────────────────────────────
router.use('/admin/verifications', verificationRoutes);

// ── Resource routes (student + public) ────────────────────────────
router.use('/resources', resourceRoutes);

// ── Admin resource management ─────────────────────────────────────
router.get(
  '/admin/resources/pending',
  authMiddleware,
  roleMiddleware('admin'),
  getPendingResources
);

router.put(
  '/admin/resources/:id/approve',
  authMiddleware,
  roleMiddleware('admin'),
  validateResourceId,
  handleValidationErrors,
  approveResource
);

router.put(
  '/admin/resources/:id/reject',
  authMiddleware,
  roleMiddleware('admin'),
  validateResourceId,
  validateAdminDecision,
  handleValidationErrors,
  rejectResource
);

// ── Report routes (student + admin) ────────────────────────────────
router.use('/reports', reportRoutes);

// ── Bookmark routes (authenticated users) ──────────────────────────
router.use('/bookmarks', bookmarkRoutes);

// ── Rating routes (authenticated + public) ─────────────────────────
router.use('/ratings', ratingRoutes);

// ── Download routes (authenticated + public) ───────────────────────
router.use('/downloads', downloadRoutes);

// ── Profile routes (authenticated) ─────────────────────────────────
router.use('/profile', profileRoutes);

// ── Notification routes (authenticated) ────────────────────────────
router.use('/notifications', notificationRoutes);

// ── Admin user management (admin only) ─────────────────────────────
router.use('/admin/users', adminUserRoutes);

// ── Admin analytics (admin only) ───────────────────────────────────
router.use('/admin/analytics', analyticsRoutes);

export default router;
