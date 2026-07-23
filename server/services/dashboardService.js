import dashboardModel from '../models/dashboardModel.js';

const getStudentDashboard = async (userId) => {
  // ── 1. Fetch user + verification info ────────────────────
  const userWithVerification = await dashboardModel.findUserWithVerification(userId);

  if (!userWithVerification) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const user = {
    id: userWithVerification.id,
    full_name: userWithVerification.full_name,
    email: userWithVerification.email,
    role: userWithVerification.role,
    account_status: userWithVerification.account_status,
    created_at: userWithVerification.user_created_at,
  };

  const verification = userWithVerification.verification_status
    ? {
        status: userWithVerification.verification_status,
        rejection_reason: userWithVerification.rejection_reason,
        created_at: userWithVerification.verification_created_at,
        verified_at: userWithVerification.verified_at,
      }
    : null;

  // ── 2. Fetch aggregated statistics ───────────────────────
  const stats = await dashboardModel.getStatistics(userId);

  // ── 3. Fetch recent uploads (last 5) ─────────────────────
  const recentUploads = await dashboardModel.getRecentUploads(userId);

  // ── 4. Fetch recent downloads (last 5) ───────────────────
  const recentDownloads = await dashboardModel.getRecentDownloads(userId);

  return {
    user,
    verification,
    stats: {
      total_uploads: Number(stats.total_uploads),
      total_downloads: Number(stats.total_downloads),
      total_bookmarks: Number(stats.total_bookmarks),
      average_rating: parseFloat(stats.average_rating),
    },
    recent_uploads: recentUploads,
    recent_downloads: recentDownloads,
  };
};

export default {
  getStudentDashboard,
};

