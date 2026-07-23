import dashboardService from '../services/dashboardService.js';

// ──────────────────────────────────────────────
// GET /api/dashboard/student
// ──────────────────────────────────────────────

const getStudentDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getStudentDashboard(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Student dashboard retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getStudentDashboard,
};

