import pool from '../config/db.js';

// ═══════════════════════════════════════════════════════════════
// REPORT MODEL
// ═══════════════════════════════════════════════════════════════
//
// All queries target the enhanced `reports` table defined in
// migration 08.  Every query uses parameterized inputs.
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// STUDENT OPERATIONS
// ───────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────
// CREATE — File a new report
// ───────────────────────────────────────────────────────────────
// Inserts a report with the submitted reason and optional
// description.  Defaults to status = 'pending'.
// The UNIQUE(resource_id, reporter_id) constraint at the
// database level prevents duplicates; callers should check
// hasReportedResource() first to provide a user-friendly error.
//
// Returns: the new report's insert ID.
// ───────────────────────────────────────────────────────────────

const createReport = async ({ resourceId, reporterId, reason, description }) => {
  const [result] = await pool.query(
    `INSERT INTO reports
       (resource_id, reporter_id, reason, description, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [resourceId, reporterId, reason, description || null]
  );

  return result.insertId;
};

// ───────────────────────────────────────────────────────────────
// CHECK — Whether a student has already reported a resource
// ───────────────────────────────────────────────────────────────
// Returns the report ID and status if a report exists, or null
// if none.  Used by the service layer to return a meaningful
// error like "You have already reported this resource."
//
// Optimization: The UNIQUE index on (resource_id, reporter_id)
// enforces this at the DB level, but this query allows a
// user-friendly check BEFORE attempting the insert, avoiding
// a thrown duplicate-key exception.
// ───────────────────────────────────────────────────────────────

const hasReportedResource = async ({ resourceId, reporterId }) => {
  const [rows] = await pool.query(
    `SELECT id, status, created_at
     FROM reports
     WHERE resource_id = ? AND reporter_id = ?
     LIMIT 1`,
    [resourceId, reporterId]
  );

  return rows[0] || null;
};

// ───────────────────────────────────────────────────────────────
// READ — Reports filed by a specific student
// ───────────────────────────────────────────────────────────────
// Returns the student's own reports with related resource info.
// Ordered by most recent first.
//
// Optimization: idx_reports_status_created covers the ORDER BY.
// The JOINs use PRIMARY keys on resources and users.
// ───────────────────────────────────────────────────────────────

const findByReporter = async (reporterId) => {
  const [rows] = await pool.query(
    `SELECT
       rp.id,
       rp.resource_id,
       rp.reason,
       rp.description,
       rp.status,
       rp.reviewed_by,
       rp.reviewed_at,
       rp.created_at,
       rp.updated_at,
       res.title AS resource_title,
       res.resource_type,
       res.approval_status AS resource_approval_status
     FROM reports rp
     JOIN resources res ON res.id = rp.resource_id
     WHERE rp.reporter_id = ?
     ORDER BY rp.created_at DESC`,
    [reporterId]
  );

  return rows;
};

// ───────────────────────────────────────────────────────────────
// ADMIN OPERATIONS
// ───────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────
// READ ALL — List reports with optional filtering
// ───────────────────────────────────────────────────────────────
// Supports filtering by status and ordering by date.
// Includes related resource title and reporter name.
//
// Parameters:
//   status  — 'pending', 'reviewed', 'resolved', or null for all
//
// Optimization: When status is provided, idx_reports_status_created
// is a covering index for both the WHERE and ORDER BY clauses.
// ───────────────────────────────────────────────────────────────

const findAll = async ({ status } = {}) => {
  const values = [];

  let query = `
    SELECT
       rp.id,
       rp.resource_id,
       rp.reporter_id,
       rp.reason,
       rp.description,
       rp.status,
       rp.reviewed_by,
       rp.reviewed_at,
       rp.created_at,
       rp.updated_at,
       res.title AS resource_title,
       u_reporter.full_name AS reporter_name,
       u_reporter.email AS reporter_email
     FROM reports rp
     JOIN resources res ON res.id = rp.resource_id
     JOIN users u_reporter ON u_reporter.id = rp.reporter_id
  `;

  if (status) {
    query += ' WHERE rp.status = ?';
    values.push(status);
  }

  query += ' ORDER BY rp.created_at DESC';

  const [rows] = await pool.query(query, values);
  return rows;
};

// ───────────────────────────────────────────────────────────────
// READ BY ID — Single report with full related context
// ───────────────────────────────────────────────────────────────
// Returns the report joined with:
//   - Resource details (title, type, approval status, download count)
//   - Reporter details (name, email)
//   - Resource uploader details (name, email)
//   - Reviewer details (name, if reviewed)
//
// Optimization: All JOINs use PRIMARY keys.  At most one row
// is returned, so index selection is trivial.
// ───────────────────────────────────────────────────────────────

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT
       rp.id,
       rp.resource_id,
       rp.reporter_id,
       rp.reason,
       rp.description,
       rp.status,
       rp.reviewed_by,
       rp.reviewed_at,
       rp.created_at,
       rp.updated_at,

       -- Resource details
       res.title          AS resource_title,
       res.resource_type  AS resource_type,
       res.approval_status AS resource_approval_status,
       res.download_count AS resource_download_count,
       res.uploader_id    AS resource_uploader_id,

       -- Reporter details
       u_reporter.full_name  AS reporter_name,
       u_reporter.email      AS reporter_email,

       -- Uploader details (owner of the reported resource)
       u_uploader.full_name  AS uploader_name,
       u_uploader.email      AS uploader_email,

       -- Reviewer details (if assigned)
       u_reviewer.full_name  AS reviewer_name,
       u_reviewer.email      AS reviewer_email

     FROM reports rp
     JOIN resources res        ON res.id        = rp.resource_id
     JOIN users u_reporter     ON u_reporter.id  = rp.reporter_id
     JOIN users u_uploader     ON u_uploader.id  = res.uploader_id
     LEFT JOIN users u_reviewer ON u_reviewer.id = rp.reviewed_by
     WHERE rp.id = ?`,
    [id]
  );

  return rows[0] || null;
};

// ───────────────────────────────────────────────────────────────
// UPDATE STATUS — Change the moderation status of a report
// ───────────────────────────────────────────────────────────────
// Updates status and optionally sets reviewed_by + reviewed_at
// if transitioning to 'reviewed' or 'resolved'.
//
// Returns: number of affected rows (0 if ID not found).
// ───────────────────────────────────────────────────────────────

const updateStatus = async ({ id, status, reviewedBy }) => {
  const [result] = await pool.query(
    `UPDATE reports
     SET status = ?,
         reviewed_by = ?,
         reviewed_at = CASE
           WHEN ? IN ('reviewed', 'resolved') THEN CURRENT_TIMESTAMP
           ELSE reviewed_at
         END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, reviewedBy || null, status, id]
  );

  return result.affectedRows;
};

// ───────────────────────────────────────────────────────────────
// ASSIGN REVIEWER — Set or change the admin assigned to a report
// ───────────────────────────────────────────────────────────────
// Separated from updateStatus so an admin can be pre-assigned
// before the review is complete.
//
// Returns: number of affected rows (0 if ID not found).
// ───────────────────────────────────────────────────────────────

const assignReviewer = async ({ id, reviewedBy }) => {
  const [result] = await pool.query(
    `UPDATE reports
     SET reviewed_by = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [reviewedBy || null, id]
  );

  return result.affectedRows;
};

// ───────────────────────────────────────────────────────────────
// DELETE — Remove a report by ID (admin only)
// ───────────────────────────────────────────────────────────────
// Returns: number of affected rows (0 if ID not found).
// ───────────────────────────────────────────────────────────────

const deleteReport = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM reports WHERE id = ?',
    [id]
  );

  return result.affectedRows;
};

export default {
  // Student
  createReport,
  hasReportedResource,
  findByReporter,

  // Admin
  findAll,
  findById,
  updateStatus,
  assignReviewer,
  deleteReport,
};
