import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import {
  listPendingVerifications,
  getVerificationDetails,
  approveVerification,
  rejectVerification,
} from '../controllers/verificationController.js';
import {
  validateVerificationDecision,
  validateVerificationId,
  handleValidationErrors,
} from '../validators/verificationValidator.js';

const router = Router();

router.get('/pending', authMiddleware, roleMiddleware('admin'), listPendingVerifications);
router.get('/:id', authMiddleware, roleMiddleware('admin'), validateVerificationId, handleValidationErrors, getVerificationDetails);
router.put('/:id/approve', authMiddleware, roleMiddleware('admin'), validateVerificationId, handleValidationErrors, approveVerification);
router.put('/:id/reject', authMiddleware, roleMiddleware('admin'), validateVerificationId, validateVerificationDecision, handleValidationErrors, rejectVerification);

export default router;
