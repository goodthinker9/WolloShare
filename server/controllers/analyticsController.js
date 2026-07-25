import analyticsModel from '../models/analyticsModel.js';

// ──────────────────────────────────────────────
// GET /api/admin/analytics/dashboard
// ──────────────────────────────────────────────

const getDashboardSummary = async (req, res, next) => {
  try {
    const data = await analyticsModel.getDashboardSummary();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/admin/analytics/resources
// ──────────────────────────────────────────────

const getResourceStats = async (req, res, next) => {
  try {
    const data = await analyticsModel.getResourceStats();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/admin/analytics/departments
// ──────────────────────────────────────────────

const getDepartmentStats = async (req, res, next) => {
  try {
    const data = await analyticsModel.getDepartmentStats();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/admin/analytics/top-downloads
// ──────────────────────────────────────────────

const getTopDownloaded = async (req, res, next) => {
  try {
    const data = await analyticsModel.getTopDownloaded();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/admin/analytics/top-rated
// ──────────────────────────────────────────────

const getTopRated = async (req, res, next) => {
  try {
    const data = await analyticsModel.getTopRated();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/admin/analytics/activity
// ──────────────────────────────────────────────

const getRecentActivity = async (req, res, next) => {
  try {
    const data = await analyticsModel.getRecentActivity();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/admin/analytics/uploads/monthly
// ──────────────────────────────────────────────

const getMonthlyUploads = async (req, res, next) => {
  try {
    const data = await analyticsModel.getMonthlyUploads();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/admin/analytics/downloads/monthly
// ──────────────────────────────────────────────

const getMonthlyDownloads = async (req, res, next) => {
  try {
    const data = await analyticsModel.getMonthlyDownloads();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/admin/analytics/verifications
// ──────────────────────────────────────────────

const getVerificationStats = async (req, res, next) => {
  try {
    const data = await analyticsModel.getVerificationStats();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getDashboardSummary,
  getResourceStats,
  getDepartmentStats,
  getTopDownloaded,
  getTopRated,
  getRecentActivity,
  getMonthlyUploads,
  getMonthlyDownloads,
  getVerificationStats,
};

