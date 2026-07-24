import pool from '../config/db.js';

// ──────────────────────────────────────────────
// Check if a resource exists by ID
// ──────────────────────────────────────────────

const findResourceById = async (resourceId) => {
  const [rows] = await pool.query(
    'SELECT id FROM resources WHERE id = ?',
    [resourceId]
  );
  return rows[0] || null;
};

// ──────────────────────────────────────────────
// Insert a download record
// ──────────────────────────────────────────────

const create = async (resourceId, userId) => {
  const [result] = await pool.query(
    'INSERT INTO downloads (resource_id, user_id) VALUES (?, ?)',
    [resourceId, userId]
  );
  return result.insertId;
};

// ──────────────────────────────────────────────
// Get download history for a user, latest first
// ──────────────────────────────────────────────

const findByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
      r.id AS resource_id,
      r.title,
      c.course_name,
      r.resource_type,
      d.downloaded_at
    FROM downloads d
    JOIN resources r ON r.id = d.resource_id
    JOIN courses c ON c.id = r.course_id
    WHERE d.user_id = ?
    ORDER BY d.downloaded_at DESC`,
    [userId]
  );
  return rows;
};

// ──────────────────────────────────────────────
// Get total download count for a resource
// ──────────────────────────────────────────────

const getDownloadCount = async (resourceId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS download_count FROM downloads WHERE resource_id = ?',
    [resourceId]
  );
  return rows[0];
};

// ──────────────────────────────────────────────
// Get top 10 most downloaded resources
// ──────────────────────────────────────────────

const getTopDownloaded = async () => {
  const [rows] = await pool.query(
    `SELECT
      r.id AS resource_id,
      r.title,
      r.resource_type,
      COUNT(d.id) AS download_count,
      c.course_name
    FROM resources r
    JOIN courses c ON c.id = r.course_id
    LEFT JOIN downloads d ON d.resource_id = r.id
    GROUP BY r.id, r.title, r.resource_type, c.course_name
    ORDER BY download_count DESC
    LIMIT 10`
  );
  return rows;
};

export default {
  findResourceById,
  create,
  findByUser,
  getDownloadCount,
  getTopDownloaded,
};

