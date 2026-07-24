import notificationModel from '../models/notificationModel.js';

// ──────────────────────────────────────────────
// GET /api/notifications  — Get my notifications
// ──────────────────────────────────────────────

const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const notifications = await notificationModel.findByUser(userId);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/notifications/:id/read  — Mark as read
// ──────────────────────────────────────────────

const markAsRead = async (req, res, next) => {
  try {
    const notificationId = Number(req.params.id);
    const userId = req.user.id;

    // Find the notification
    const notification = await notificationModel.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Only the owner can mark as read
    if (notification.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await notificationModel.markAsRead(notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/notifications/unread-count  — Unread count
// ──────────────────────────────────────────────

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { count } = await notificationModel.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/notifications/read-all  — Mark all as read
// ──────────────────────────────────────────────

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await notificationModel.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

export {
  getMyNotifications,
  markAsRead,
  getUnreadCount,
  markAllAsRead,
};

