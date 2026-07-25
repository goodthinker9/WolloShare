import api from './api';

/**
 * Service layer for the Student Dashboard.
 *
 * Methods:
 *   getStudentDashboard()  – aggregated stats + recent uploads
 *   getRecentNotifications() – recent notifications for the user
 *
 * Pages must NOT import axios directly; they should go through this service.
 */

/**
 * Fetch the student dashboard data.
 *
 * GET /api/dashboard/student
 *
 * Backend response shape:
 * {
 *   success: true,
 *   data: {
 *     stats: { total_uploads, total_downloads, total_bookmarks, average_rating },
 *     recent_uploads: [ { id, title, resource_type, approval_status, created_at }, ... ],
 *     recent_downloads: [...]
 *   }
 * }
 */
export const getStudentDashboard = async () => {
  const { data } = await api.get('/dashboard/student');
  return data.data;
};

/**
 * Fetch recent notifications for the current user.
 *
 * GET /api/notifications
 *
 * Backend response shape:
 * {
 *   success: true,
 *   data: [ { id, title, message, type, is_read, created_at }, ... ]
 * }
 */
export const getRecentNotifications = async () => {
  const { data } = await api.get('/notifications');
  return data.data;
};
