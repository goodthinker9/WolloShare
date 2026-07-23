import adminDashboardService from '../services/adminDashboardService.js';

// ───────────────────────────────────────────────────────────────
// GET /api/admin/dashboard
// ───────────────────────────────────────────────────────────────
// Fetches the full admin dashboard: overview stats, recent
// activity, pending reports, and analytics. Only accessible
// to users with the 'admin' role (enforced by middleware).

const getAdminDashboard = async (req, res, next) => {
  try {
    const data = await adminDashboardService.getAdminDashboard();

    res.status(200).json({
      success: true,
      message: 'Admin dashboard retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAdminDashboard,
};

