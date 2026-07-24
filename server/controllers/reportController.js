import reportService from '../services/reportService.js';

// ═══════════════════════════════════════════════════════════════
// REPORT CONTROLLER
// ═══════════════════════════════════════════════════════════════
//
// Thin HTTP handlers that extract request parameters and delegate
// to the service layer.  No business logic or SQL here.
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// POST /api/reports  — Student: file a new report
// ───────────────────────────────────────────────────────────────
// Body: { resource_id, reason, description? }

const createReport = async (req, res, next) => {
  try {
    const report = await reportService.createReport({
      resourceId: Number(req.body.resource_id),
      reporterId: req.user.id,
      reason: req.body.reason,
      description: req.body.description || null,
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. A moderator will review it shortly.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────────────────
// GET /api/reports/my  — Student: get my own reports
// ───────────────────────────────────────────────────────────────

const getMyReports = async (req, res, next) => {
  try {
    const reports = await reportService.getMyReports(req.user.id);

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────────────────
// GET /api/admin/reports  — Admin: list reports with filter
// ───────────────────────────────────────────────────────────────
// Query: ?status=pending  (optional, omit for all)

const getAllReports = async (req, res, next) => {
  try {
    const status = req.query.status || null;
    const reports = await reportService.getAllReports({ status });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────────────────
// GET /api/admin/reports/:id  — Admin: get report detail
// ───────────────────────────────────────────────────────────────

const getReportById = async (req, res, next) => {
  try {
    const report = await reportService.getReportById(Number(req.params.id));

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────────────────
// PUT /api/admin/reports/:id/status  — Admin: update status
// ───────────────────────────────────────────────────────────────
// Body: { status, reviewed_by? }

const updateReportStatus = async (req, res, next) => {
  try {
    const report = await reportService.updateReportStatus({
      id: Number(req.params.id),
      status: req.body.status,
      reviewedBy: req.body.reviewed_by || req.user.id,
    });

    res.status(200).json({
      success: true,
      message: `Report status updated to '${req.body.status}'`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────────────────
// PUT /api/admin/reports/:id/assign  — Admin: assign reviewer
// ───────────────────────────────────────────────────────────────
// Body: { reviewed_by }

const assignReviewer = async (req, res, next) => {
  try {
    const report = await reportService.assignReviewer({
      id: Number(req.params.id),
      reviewedBy: Number(req.body.reviewed_by),
    });

    res.status(200).json({
      success: true,
      message: 'Reviewer assigned successfully',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────────────────
// DELETE /api/admin/reports/:id  — Admin: delete a report
// ───────────────────────────────────────────────────────────────

const deleteReport = async (req, res, next) => {
  try {
    const result = await reportService.deleteReport(Number(req.params.id));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export default {
  createReport,
  getMyReports,
  getAllReports,
  getReportById,
  updateReportStatus,
  assignReviewer,
  deleteReport,
};