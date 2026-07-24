import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/profileController.js';

const router = Router();

// All profile routes require authentication
router.use(authMiddleware);

// GET /api/profile  — Get my profile
router.get('/', getProfile);

// PUT /api/profile  — Update profile (full_name only)
router.put('/', updateProfile);

// PUT /api/profile/change-password  — Change password
router.put('/change-password', changePassword);

export default router;

