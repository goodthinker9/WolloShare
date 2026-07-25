import pool from '../config/db.js';

// ═══════════════════════════════════════════════════════════════
// ADMIN ANALYTICS MODEL
//
// All queries use parameterized inputs and aggregate over
// existing indexes for minimum round trips.
// ═══════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────
// 1. Dashboard Summary — Single-query aggregation
// ──────────────────────────────────────────────

const getDashboardSummary = async () => {
  const [rows] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_students,
      (SELECT COUNT(*) FROM users WHERE role = 'admin') AS total_admins,
      (SELECT COUNT(*) FROM resources) AS total_resources,
      (SELECT COUNT(*) FROM resources WHERE approval_status = 'approved') AS approved_resources,
      (SELECT COUNT(*) FROM resources WHERE approval_status = 'pending') AS pending_resources,
      (SELECT COUNT(*) FROM resources WHERE approval_status = 'rejected') AS rejected_resources,
      (SELECT COUNT(*) FROM downloads) AS total_downloads,
      (SELECT COUNT(*) FROM bookmarks) AS total_bookmarks,
      (SELECT COUNT(*) FROM ratings) AS total_ratings,
      (SELECT COALESCE(ROUND(AVG(rating), 1), 0) FROM ratings) AS average_rating,
      (SELECT COUNT(*) FROM reports) AS total_reports,
      (SELECT COUNT(*) FROM reports WHERE status = 'pending') AS pending_reports
  `);
  return rows[0];
};

// ──────────────────────────────────────────────
// 2. Resource Statistics — Grouped by resource_type
// ──────────────────────────────────────────────

const getResourceStats = async () => {
  const [rows] = await pool.query(`
    SELECT
      resource_type,
      COUNT(*) AS count
    FROM resources
    GROUP BY resource_type
    ORDER BY count DESC
  `);
  return rows;
};

// ──────────────────────────────────────────────
// 3. Department Statistics — Resources & students per dept
// ──────────────────────────────────────────────

const getDepartmentStats = async () => {
  const [rows] = await pool.query(`
    SELECT
      d.name AS department_name,
      COUNT(DISTINCT r.id) AS resource_count,
      COUNT(DISTINCT sp.user_id) AS student_count
    FROM departments d
    LEFT JOIN resources r ON r.department_id = d.id
    LEFT JOIN student_profiles sp ON sp.department_id = d.id
    GROUP BY d.id, d.name
    ORDER BY resource_count DESC
  `);
  return rows;
};

// ──────────────────────────────────────────────
// 4. Top Downloaded Resources — Top 10
// ──────────────────────────────────────────────

const getTopDownloaded = async () => {
  const [rows] = await pool.query(`
    SELECT
      r.id AS resource_id,
      r.title,
      r.download_count,
      COALESCE(ROUND(AVG(rt.rating), 1), 0) AS average_rating
    FROM resources r
    LEFT JOIN ratings rt ON rt.resource_id = r.id
    GROUP BY r.id, r.title, r.download_count
    ORDER BY r.download_count DESC
    LIMIT 10
  `);
  return rows;
};

// ──────────────────────────────────────────────
// 5. Top Rated Resources — Minimum 3 ratings
// ──────────────────────────────────────────────

const getTopRated = async () => {
  const [rows] = await pool.query(`
    SELECT
      r.id AS resource_id,
      r.title,
      ROUND(AVG(rt.rating), 1) AS average_rating,
      COUNT(rt.id) AS rating_count
    FROM resources r
    JOIN ratings rt ON rt.resource_id = r.id
    GROUP BY r.id, r.title
    HAVING rating_count >= 3
    ORDER BY average_rating DESC, rating_count DESC
  `);
  return rows;
};

// ──────────────────────────────────────────────
// 6. Recent Activity — Union of latest events
// ──────────────────────────────────────────────

const getRecentActivity = async () => {
  const [rows] = await pool.query(`
    (SELECT 'upload' AS type, r.id, r.title AS description, r.created_at AS timestamp
     FROM resources r)
    UNION ALL
    (SELECT 'download' AS type, d.id, CONCAT('Downloaded: ', res.title) AS description, d.downloaded_at AS timestamp
     FROM downloads d
     JOIN resources res ON res.id = d.resource_id)
    UNION ALL
    (SELECT 'report' AS type, rp.id, CONCAT('Report: ', res2.title) AS description, rp.created_at AS timestamp
     FROM reports rp
     JOIN resources res2 ON res2.id = rp.resource_id)
    UNION ALL
    (SELECT 'verification' AS type, sv.id, CONCAT('Verification: ', u.full_name) AS description, sv.verified_at AS timestamp
     FROM student_verifications sv
     JOIN users u ON u.id = sv.user_id
     WHERE sv.verified_at IS NOT NULL)
    UNION ALL
    (SELECT 'notification' AS type, n.id, n.title AS description, n.created_at AS timestamp
     FROM notifications n)
    ORDER BY timestamp DESC
    LIMIT 30
  `);
  return rows;
};

// ──────────────────────────────────────────────
// 7. Monthly Upload Statistics
// ──────────────────────────────────────────────

const getMonthlyUploads = async () => {
  const [rows] = await pool.query(`
    SELECT
      DATE_FORMAT(created_at, '%Y-%m') AS month,
      COUNT(*) AS count
    FROM resources
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month ASC
  `);
  return rows;
};

// ──────────────────────────────────────────────
// 8. Monthly Download Statistics
// ──────────────────────────────────────────────

const getMonthlyDownloads = async () => {
  const [rows] = await pool.query(`
    SELECT
      DATE_FORMAT(downloaded_at, '%Y-%m') AS month,
      COUNT(*) AS count
    FROM downloads
    GROUP BY DATE_FORMAT(downloaded_at, '%Y-%m')
    ORDER BY month ASC
  `);
  return rows;
};

// ──────────────────────────────────────────────
// 9. Verification Statistics
// ──────────────────────────────────────────────

const getVerificationStats = async () => {
  const [rows] = await pool.query(`
    SELECT
      verification_status,
      COUNT(*) AS count
    FROM student_verifications
    GROUP BY verification_status
  `);
  return rows;
};

export default {
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

