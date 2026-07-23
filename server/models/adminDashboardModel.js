import pool from '../config/db.js';

// ═══════════════════════════════════════════════════════════════
// ADMIN DASHBOARD MODEL
// ═══════════════════════════════════════════════════════════════
//
// All queries use parameterized inputs and leverage existing
// covering indexes for minimum round trips and maximum throughput.
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// OVERVIEW — Aggregated system-wide counts in a single query
// ───────────────────────────────────────────────────────────────
//
// Optimization: 7 correlated subqueries, each resolved by a
// covering B-tree index. No joins between large tables means
// each subquery is an independent index scan.
//
// Used Indexes:
//   - total_students
//       → idx_users_role_status (role, account_status)
//   - verified_students
//       → idx_users_role_status + idx_student_verifications_status
//   - pending_verifications
//       → idx_student_verifications_status
//   - total_resources / pending / approved / rejected
//       → idx_resources_approval_type (approval_status, resource_type)
// ───────────────────────────────────────────────────────────────

const getOverviewStats = async () => {
  const [rows] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'student')
        AS total_students,

      (SELECT COUNT(*)
       FROM users u
       JOIN student_verifications sv ON sv.user_id = u.id
       WHERE u.role = 'student'
         AND sv.verification_status = 'verified')
        AS verified_students,

      (SELECT COUNT(*)
       FROM student_verifications
       WHERE verification_status = 'pending')
        AS pending_verifications,

      (SELECT COUNT(*) FROM resources)
        AS total_resources,

      (SELECT COUNT(*) FROM resources WHERE approval_status = 'pending')
        AS pending_resources,

      (SELECT COUNT(*) FROM resources WHERE approval_status = 'approved')
        AS approved_resources,

      (SELECT COUNT(*) FROM resources WHERE approval_status = 'rejected')
        AS rejected_resources
  `);

  return rows[0];
};

// ───────────────────────────────────────────────────────────────
// RECENT STUDENTS — Last 5 registered students
// ───────────────────────────────────────────────────────────────
//
// Optimization: idx_users_role_status filters role='student'
// efficiently. ORDER BY created_at DESC LIMIT 5 requires a
// filesort of the matching rows, but with LIMIT 5 the cost is
// negligible. For large-scale optimization, a composite index
// on (role, created_at) would eliminate the filesort.
// ───────────────────────────────────────────────────────────────

const getRecentStudents = async () => {
  const [rows] = await pool.query(
    `SELECT
       id,
       full_name,
       email,
       account_status,
       created_at
     FROM users
     WHERE role = 'student'
     ORDER BY created_at DESC
     LIMIT 5`
  );

  return rows;
};

// ───────────────────────────────────────────────────────────────
// RECENT RESOURCES — Last 5 uploaded resources (any status)
// ───────────────────────────────────────────────────────────────
//
// Optimization: Resources use auto-increment IDs that correlate
// with created_at. ORDER BY id DESC LIMIT 5 is effectively an
// index-only scan on the PRIMARY KEY.
// ───────────────────────────────────────────────────────────────

const getRecentResources = async () => {
  const [rows] = await pool.query(
    `SELECT
       r.id,
       r.title,
       r.resource_type,
       r.approval_status,
       r.created_at,
       u.full_name AS uploader_name
     FROM resources r
     JOIN users u ON u.id = r.uploader_id
     ORDER BY r.id DESC
     LIMIT 5`
  );

  return rows;
};

// ───────────────────────────────────────────────────────────────
// PENDING REPORTS — Last 5 pending moderation reports
// ───────────────────────────────────────────────────────────────
//
// Optimization: idx_reports_status_created is a covering index
// for the WHERE + ORDER BY clauses. JOINs use PRIMARY keys.
// ───────────────────────────────────────────────────────────────

const getPendingReports = async () => {
  const [rows] = await pool.query(
    `SELECT
       r.id,
       r.reason,
       r.status,
       r.created_at,
       res.title AS resource_title,
       u.full_name AS reported_by_name
     FROM reports r
     JOIN resources res ON res.id = r.resource_id
     JOIN users u ON u.id = r.reported_by
     WHERE r.status = 'pending'
     ORDER BY r.created_at DESC
     LIMIT 5`
  );

  return rows;
};

// ───────────────────────────────────────────────────────────────
// TOP DEPARTMENTS — 5 departments with most approved resources
// ───────────────────────────────────────────────────────────────
//
// Optimization:
//   - idx_resources_department_id drives the JOIN
//   - idx_resources_approval_type filters approval_status
//   - GROUP BY on small department set → no temp table needed
// ───────────────────────────────────────────────────────────────

const getTopDepartments = async () => {
  const [rows] = await pool.query(
    `SELECT
       d.id,
       d.name,
       COUNT(r.id) AS resource_count
     FROM departments d
     LEFT JOIN resources r
       ON r.department_id = d.id
       AND r.approval_status = 'approved'
     GROUP BY d.id, d.name
     ORDER BY resource_count DESC
     LIMIT 5`
  );

  return rows;
};

// ───────────────────────────────────────────────────────────────
// TOP DOWNLOADED RESOURCES — 5 most downloaded approved resources
// ───────────────────────────────────────────────────────────────
//
// Optimization: idx_approved_downloads (approval_status,
// download_count) is a covering B-tree. The ORDER BY is
// already the index order — MySQL walks the tree in reverse
// and stops after 5 rows. No filesort.
// ───────────────────────────────────────────────────────────────

const getTopDownloadedResources = async () => {
  const [rows] = await pool.query(
    `SELECT
       r.id,
       r.title,
       r.download_count,
       r.resource_type,
       u.full_name AS uploader_name,
       d.name AS department_name
     FROM resources r
     JOIN users u ON u.id = r.uploader_id
     JOIN departments d ON d.id = r.department_id
     WHERE r.approval_status = 'approved'
     ORDER BY r.download_count DESC
     LIMIT 5`
  );

  return rows;
};

// ───────────────────────────────────────────────────────────────
// MOST ACTIVE UPLOADERS — 5 students with most approved resources
// ───────────────────────────────────────────────────────────────
//
// Optimization:
//   - idx_resources_uploader_id drives the JOIN
//   - idx_resources_approval_type filters approved status
//   - idx_users_role_status filters role = 'student'
// ───────────────────────────────────────────────────────────────

const getMostActiveUploaders = async () => {
  const [rows] = await pool.query(
    `SELECT
       u.id,
       u.full_name,
       COUNT(r.id) AS resource_count
     FROM users u
     JOIN resources r
       ON r.uploader_id = u.id
       AND r.approval_status = 'approved'
     WHERE u.role = 'student'
     GROUP BY u.id, u.full_name
     ORDER BY resource_count DESC
     LIMIT 5`
  );

  return rows;
};

// ───────────────────────────────────────────────────────────────
// WEEKLY DOWNLOADS — Download count per day for last 7 days
// ───────────────────────────────────────────────────────────────
//
// Optimization: idx_downloads_downloaded_at enables an efficient
// range scan. MySQL reads only index entries from the last 7
// days, then groups by date in memory. No table scan.
// ───────────────────────────────────────────────────────────────

const getWeeklyDownloads = async () => {
  const [rows] = await pool.query(
    `SELECT
       DATE(downloaded_at) AS date,
       COUNT(*) AS count
     FROM downloads
     WHERE downloaded_at >= NOW() - INTERVAL 7 DAY
     GROUP BY DATE(downloaded_at)
     ORDER BY date`
  );

  return rows;
};

export default {
  getOverviewStats,
  getRecentStudents,
  getRecentResources,
  getPendingReports,
  getTopDepartments,
  getTopDownloadedResources,
  getMostActiveUploaders,
  getWeeklyDownloads,
};

