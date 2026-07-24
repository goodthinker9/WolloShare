import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getMyNotifications,
  markAsRead,
  getUnreadCount,
  markAllAsRead,
} from '../controllers/notificationController.js';

const router = Router();

// All notification routes require authentication
router.use(authMiddleware);

// GET /api/notifications  — Get my notifications
router.get('/', getMyNotifications);

// GET /api/notifications/unread-count  — Unread notification count
router.get('/unread-count', getUnreadCount);

// PUT /api/notifications/read-all  — Mark all as read
router.put('/read-all', markAllAsRead);

// PUT /api/notifications/:id/read  — Mark single notification as read
router.put('/:id/read', markAsRead);

export default router;

