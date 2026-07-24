import reportModel from '../models/reportModel.js';
import resourceModel from '../models/resourceModel.js';
import userModel from '../models/userModel.js';

// ═══════════════════════════════════════════════════════════════
// REPORT SERVICE
// ═══════════════════════════════════════════════════════════════
//
// Business rules enforced here:
//   1. A student cannot report the same resource more than once.
//   2. Only existing users and resources can be referenced.
//   3. Status workflow: pending → reviewed → resolved
//      (status cannot go backwards or skip states).
//   4. reviewed_at is set automatically when status changes
//      to 'reviewed' or 'resolved'.
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// ALLOWED STATUS TRANSITIONS
// ───────────────────────────────────────────────────────────────
//
//   pending  ────→  reviewed  ────→  resolved
//      │
//      └──────────→  resolved  (admin can resolve directly)
//
// No other transitions are permitted.  Specifically:
//   - reviewed  → pending       (not allowed)
//   - resolved  → reviewed      (not allowed)
//   - resolved  → pending       (not allowed)
// ───────────────────────────────────────────────────────────────

const VALID_TRANSITIONS = {
  pending:  ['reviewed', 'resolved'],
  reviewed: ['resolved'],
  resolved: [],
};

const isValidTransition = (currentStatus, newStatus) => {
  const allowed = VALID_TRANSITIONS[currentStatus];
  return allowed && allowed.includes(newStatus);
};

// ───────────────────────────────────────────────────────────────
// STUDENT OPERATIONS
// ───────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────
// CREATE REPORT — File a new moderation report
// ───────────────────────────────────────────────────────────────
//
// Business rules:
//   1. Reporter (user) must exist.
//   2. Resource must exist.
//   3. Reporter must be a student (enforced by middleware, but
//      double-checked here for defense-in-depth).
//   4. Reporter must not have already reported this resource.
//   5. Only approved resources can be reported (pending/rejected
//      resources are already under moderation).
//
// Returns: the created report with full context.
// ───────────────────────────────────────────────────────────────

const createReport = async ({ resourceId, reporterId, reason, description }) => {
  // ── 1. Verify reporter exists ────────────────────────────
  const reporter = await userModel.findUserById(reporterId);

  if (!reporter) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // ── 2. Verify resource exists ────────────────────────────
  const resource = await resourceModel.findById(resourceId);

  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  // ── 3. Only approved resources can be reported ───────────
  // Resources that are pending or rejected are already under
  // admin moderation.
  if (resource.approval_status !== 'approved') {
    const error = new Error(
      'Only approved resources can be reported. This resource is still under review.'
    );
    error.statusCode = 400;
    throw error;
  }

  // ── 4. Check for duplicate report ────────────────────────
  const existing = await reportModel.hasReportedResource({ resourceId, reporterId });

  if (existing) {
    const error = new Error(
      'You have already reported this resource. Our moderation team will review it shortly.'
    );
    error.statusCode = 409;
    throw error;
  }

  // ── 5. Create the report ─────────────────────────────────
  const reportId = await reportModel.createReport({
    resourceId,
    reporterId,
    reason,
    description,
  });

  // ── 6. Return full report context ────────────────────────
  return reportModel.findById(reportId);
};

// ───────────────────────────────────────────────────────────────
// GET MY REPORTS — All reports filed by the current student
// ───────────────────────────────────────────────────────────────

const getMyReports = async (reporterId) => {
  return reportModel.findByReporter(reporterId);
};

// ───────────────────────────────────────────────────────────────
// ADMIN OPERATIONS
// ───────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────
// GET ALL REPORTS — List reports with optional status filter
// ───────────────────────────────────────────────────────────────
//
// Admin-only.  Pass { status: 'pending' } to view only
// unresolved reports, or omit to see all.
// ───────────────────────────────────────────────────────────────

const getAllReports = async ({ status } = {}) => {
  return reportModel.findAll({ status });
};

// ───────────────────────────────────────────────────────────────
// GET REPORT BY ID — Full context for moderation review
// ───────────────────────────────────────────────────────────────
//
// Returns the report with resource, reporter, uploader, and
// reviewer details.  404 if the report does not exist.
// ───────────────────────────────────────────────────────────────

const getReportById = async (id) => {
  const report = await reportModel.findById(id);

  if (!report) {
    const error = new Error('Report not found');
    error.statusCode = 404;
    throw error;
  }

  return report;
};

// ───────────────────────────────────────────────────────────────
// UPDATE REPORT STATUS — Change the moderation state
// ───────────────────────────────────────────────────────────────
//
// Business rules:
//   1. Report must exist.
//   2. Status transition must follow the valid workflow:
//        pending  →  reviewed  →  resolved
//        pending  →  resolved  (direct resolution allowed)
//   3. A reviewed_by admin must be provided when transitioning
//      to 'reviewed' or 'resolved'.
//   4. reviewed_at is automatically set by the model when the
//      status moves to 'reviewed' or 'resolved'.
// ───────────────────────────────────────────────────────────────

const updateReportStatus = async ({ id, status, reviewedBy }) => {
  // ── 1. Verify report exists ──────────────────────────────
  const report = await reportModel.findById(id);

  if (!report) {
    const error = new Error('Report not found');
    error.statusCode = 404;
    throw error;
  }

  // ── 2. Validate status transition ────────────────────────
  if (!isValidTransition(report.status, status)) {
    const error = new Error(
      `Invalid status transition from '${report.status}' to '${status}'. ` +
      `Allowed transitions: pending → reviewed, pending → resolved, reviewed → resolved.`
    );
    error.statusCode = 400;
    throw error;
  }

  // ── 3. Admin must be identified for review actions ───────
  if (!reviewedBy) {
    const error = new Error('An admin must be assigned to review this report');
    error.statusCode = 400;
    throw error;
  }

  // ── 4. Persist the status change ─────────────────────────
  const affectedRows = await reportModel.updateStatus({ id, status, reviewedBy });

  if (!affectedRows) {
    const error = new Error('Failed to update report status');
    error.statusCode = 500;
    throw error;
  }

  // ── 5. Return updated report ─────────────────────────────
  return reportModel.findById(id);
};

// ───────────────────────────────────────────────────────────────
// ASSIGN REVIEWER — Pre-assign an admin before review completes
// ───────────────────────────────────────────────────────────────
//
// Allows an admin to claim a report and signal to other admins
// that it is being handled, without changing the status yet.
//
// Business rules:
//   1. Report must exist.
//   2. Assignee must exist and be an admin (defense-in-depth).
// ───────────────────────────────────────────────────────────────

const assignReviewer = async ({ id, reviewedBy }) => {
  // ── 1. Verify report exists ──────────────────────────────
  const report = await reportModel.findById(id);

  if (!report) {
    const error = new Error('Report not found');
    error.statusCode = 404;
    throw error;
  }

  // ── 2. Verify reviewer exists and is an admin ────────────
  const reviewer = await userModel.findUserById(reviewedBy);

  if (!reviewer) {
    const error = new Error('Reviewer not found');
    error.statusCode = 404;
    throw error;
  }

  if (reviewer.role !== 'admin') {
    const error = new Error('Only administrators can be assigned as reviewers');
    error.statusCode = 403;
    throw error;
  }

  // ── 3. Assign the reviewer ───────────────────────────────
  const affectedRows = await reportModel.assignReviewer({ id, reviewedBy });

  if (!affectedRows) {
    const error = new Error('Failed to assign reviewer');
    error.statusCode = 500;
    throw error;
  }

  return reportModel.findById(id);
};

// ───────────────────────────────────────────────────────────────
// DELETE REPORT — Remove a report (admin only)
// ───────────────────────────────────────────────────────────────
//
// Business rules:
//   1. Report must exist.
//   2. Only admins can delete reports (enforced by middleware).
// ───────────────────────────────────────────────────────────────

const deleteReport = async (id) => {
  const report = await reportModel.findById(id);

  if (!report) {
    const error = new Error('Report not found');
    error.statusCode = 404;
    throw error;
  }

  const affectedRows = await reportModel.deleteReport(id);

  if (!affectedRows) {
    const error = new Error('Failed to delete report');
    error.statusCode = 500;
    throw error;
  }

  return { success: true, message: 'Report deleted successfully' };
};

export default {
  // Student
  createReport,
  getMyReports,

  // Admin
  getAllReports,
  getReportById,
  updateReportStatus,
  assignReviewer,
  deleteReport,
};


