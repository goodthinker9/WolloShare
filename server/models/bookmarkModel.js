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
// Check if a bookmark already exists
// ──────────────────────────────────────────────

const findByResourceAndUser = async (resourceId, userId) => {
  const [rows] = await pool.query(
    'SELECT id FROM bookmarks WHERE resource_id = ? AND user_id = ?',
    [resourceId, userId]
  );
  return rows[0] || null;
};

// ──────────────────────────────────────────────
// Create a new bookmark
// ──────────────────────────────────────────────

const create = async (resourceId, userId) => {
  const [result] = await pool.query(
    'INSERT INTO bookmarks (resource_id, user_id) VALUES (?, ?)',
    [resourceId, userId]
  );
  return result.insertId;
};

// ──────────────────────────────────────────────
// Delete a bookmark for the current user
// ──────────────────────────────────────────────

const remove = async (resourceId, userId) => {
  const [result] = await pool.query(
    'DELETE FROM bookmarks WHERE resource_id = ? AND user_id = ?',
    [resourceId, userId]
  );
  return result.affectedRows;
};

// ──────────────────────────────────────────────
// Get all bookmarks for a user, joined with resources
// ──────────────────────────────────────────────

const findUserBookmarks = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
      r.id AS resource_id,
      r.title,
      r.resource_type,
      r.file_name,
      r.approval_status,
      b.created_at
    FROM bookmarks b
    JOIN resources r ON r.id = b.resource_id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC`,
    [userId]
  );
  return rows;
};

export default {
  findResourceById,
  findByResourceAndUser,
  create,
  remove,
  findUserBookmarks,
};

