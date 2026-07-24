import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import {
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getUserStatistics,
} from '../controllers/adminUserController.js';

const router = Router();

// All admin user routes require authentication + admin role
router.use(authMiddleware, roleMiddleware('admin'));

// GET /api/admin/users  — Get all users (with pagination, search, filters)
router.get('/', getAllUsers);

// GET /api/admin/users/stats  — Dashboard statistics (must be before /:id)
router.get('/stats', getUserStatistics);

// GET /api/admin/users/:id  — Get single user with full profile
router.get('/:id', getSingleUser);

// PATCH /api/admin/users/:id/status  — Update account status
router.patch('/:id/status', updateUserStatus);

// PATCH /api/admin/users/:id/role  — Promote or demote user
router.patch('/:id/role', updateUserRole);

// DELETE /api/admin/users/:id  — Delete user
router.delete('/:id', deleteUser);

export default router;

