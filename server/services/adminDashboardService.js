import adminDashboardModel from '../models/adminDashboardModel.js';

// ═══════════════════════════════════════════════════════════════
// ADMIN DASHBOARD SERVICE
// ═══════════════════════════════════════════════════════════════
//
// Orchestrates all admin dashboard data retrieval by composing
// model methods. Handles type coercion and response structuring.
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// GET ADMIN DASHBOARD — Full dashboard data
// ───────────────────────────────────────────────────────────────
//
// Calls 8 model methods in parallel for maximum throughput.
// Each method is an independent database query, so there is no
// data dependency between them — Promise.all allows MySQL to
// process them concurrently.
// ───────────────────────────────────────────────────────────────

const getAdminDashboard = async () => {
  const [
    overviewStats,
    recentStudents,
    recentResources,
    pendingReports,
    topDepartments,
    topDownloadedResources,
    mostActiveUploaders,
    weeklyDownloads,
  ] = await Promise.all([
    adminDashboardModel.getOverviewStats(),
    adminDashboardModel.getRecentStudents(),
    adminDashboardModel.getRecentResources(),
    adminDashboardModel.getPendingReports(),
    adminDashboardModel.getTopDepartments(),
    adminDashboardModel.getTopDownloadedResources(),
    adminDashboardModel.getMostActiveUploaders(),
    adminDashboardModel.getWeeklyDownloads(),
  ]);

  return {
    overview: {
      total_students: Number(overviewStats.total_students),
      verified_students: Number(overviewStats.verified_students),
      pending_verifications: Number(overviewStats.pending_verifications),
      total_resources: Number(overviewStats.total_resources),
      pending_resources: Number(overviewStats.pending_resources),
      approved_resources: Number(overviewStats.approved_resources),
      rejected_resources: Number(overviewStats.rejected_resources),
    },
    recent_students: recentStudents,
    recent_resources: recentResources,
    pending_reports: pendingReports,
    analytics: {
      top_departments: topDepartments,
      top_downloaded_resources: topDownloadedResources,
      most_active_uploaders: mostActiveUploaders,
      weekly_downloads: weeklyDownloads.map((entry) => ({
        date: entry.date,
        count: Number(entry.count),
      })),
    },
  };
};

export default {
  getAdminDashboard,
};

