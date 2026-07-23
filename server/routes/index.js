import { Router } from 'express';
import authRoutes from './authRoutes.js';
import verificationRoutes from './verificationRoutes.js';
import resourceRoutes from './resourceRoutes.js';
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

export default router;

