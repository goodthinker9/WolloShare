import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import resourceUpload from '../middleware/resourceUpload.js';
import {
  createResource,
  getMyResources,
  updateResource,
  deleteResource,
  listApprovedResources,
  getResourceDetails,
  downloadResource,
} from '../controllers/resourceController.js';
import {
  validateCreateResource,
  validateUpdateResource,
  validateResourceId,
  validateListResources,
  handleValidationErrors,
} from '../validators/resourceValidator.js';

const router = Router();

// ── Student routes (authenticated, verified student only) ──────────
router.post(
  '/',
  authMiddleware,
  roleMiddleware('student'),
  resourceUpload,
  validateCreateResource,
  handleValidationErrors,
  createResource
);

router.get(
  '/my',
  authMiddleware,
  roleMiddleware('student'),
  getMyResources
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('student'),
  validateUpdateResource,
  handleValidationErrors,
  updateResource
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('student'),
  validateResourceId,
  handleValidationErrors,
  deleteResource
);

// ── Public routes (no auth required, only approved resources) ──────
router.get(
  '/',
  validateListResources,
  handleValidationErrors,
  listApprovedResources
);

router.get(
  '/:id',
  validateResourceId,
  handleValidationErrors,
  getResourceDetails
);

// ── Download (auth required, any authenticated user) ───────────────
router.get(
  '/:id/download',
  authMiddleware,
  validateResourceId,
  handleValidationErrors,
  downloadResource
);

export default router;

