import pool from '../config/db.js';

// ──────────────────────────────────────────────
// USER & VERIFICATION INFO
// ──────────────────────────────────────────────

const findUserWithVerification = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
      u.id,
      u.full_name,
      u.email,
      u.role,
      u.account_status,
      u.created_at AS user_created_at,
      sv.verification_status,
      sv.rejection_reason,
      sv.created_at AS verification_created_at,
      sv.verified_at
    FROM users u
    LEFT JOIN student_verifications sv ON sv.user_id = u.id
    WHERE u.id = ?`,
    [userId]
  );

  return rows[0] || null;
};

// ──────────────────────────────────────────────
// STATISTICS — Aggregated counts in one query
// ──────────────────────────────────────────────

const getStatistics = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
      (SELECT COUNT(*) FROM resources WHERE uploader_id = ?) AS total_uploads,
      (SELECT COUNT(*) FROM downloads WHERE user_id = ?) AS total_downloads,
      (SELECT COUNT(*) FROM bookmarks WHERE user_id = ?) AS total_bookmarks,
      COALESCE((
        SELECT AVG(rt.rating)
        FROM ratings rt
        JOIN resources r ON r.id = rt.resource_id
        WHERE r.uploader_id = ?
      ), 0) AS average_rating`,
    [userId, userId, userId, userId]
  );

  return rows[0];
};

// ──────────────────────────────────────────────
// RECENT UPLOADS — Last 5 resources by this user
// ──────────────────────────────────────────────

const getRecentUploads = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
      r.id,
      r.title,
      r.resource_type,
      r.approval_status,
      r.download_count,
      r.created_at,
      c.course_name
    FROM resources r
    LEFT JOIN courses c ON c.id = r.course_id
    WHERE r.uploader_id = ?
    ORDER BY r.created_at DESC
    LIMIT 5`,
    [userId]
  );

  return rows;
};

// ──────────────────────────────────────────────
// RECENT DOWNLOADS — Last 5 downloads by this user
// ──────────────────────────────────────────────

const getRecentDownloads = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
      d.id,
      d.resource_id,
      d.downloaded_at,
      r.title AS resource_title,
      r.resource_type,
      r.uploader_id,
      u.full_name AS uploader_name
    FROM downloads d
    JOIN resources r ON r.id = d.resource_id
    LEFT JOIN users u ON u.id = r.uploader_id
    WHERE d.user_id = ?
    ORDER BY d.downloaded_at DESC
    LIMIT 5`,
    [userId]
  );

  return rows;
};

export default {
  findUserWithVerification,
  getStatistics,
  getRecentUploads,
  getRecentDownloads,
};

