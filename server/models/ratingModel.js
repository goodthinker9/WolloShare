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
// Check if a rating already exists for this user + resource
// ──────────────────────────────────────────────

const findByResourceAndUser = async (resourceId, userId) => {
  const [rows] = await pool.query(
    'SELECT id, rating, comment FROM ratings WHERE resource_id = ? AND user_id = ?',
    [resourceId, userId]
  );
  return rows[0] || null;
};

// ──────────────────────────────────────────────
// Find a single rating by its ID
// ──────────────────────────────────────────────

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, resource_id, user_id, rating, comment, created_at FROM ratings WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

// ──────────────────────────────────────────────
// Create a new rating
// ──────────────────────────────────────────────

const create = async (resourceId, userId, rating, comment) => {
  const [result] = await pool.query(
    'INSERT INTO ratings (resource_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
    [resourceId, userId, rating, comment || null]
  );
  return result.insertId;
};

// ──────────────────────────────────────────────
// Update an existing rating (rating and/or comment)
// ──────────────────────────────────────────────

const update = async (id, rating, comment) => {
  const [result] = await pool.query(
    'UPDATE ratings SET rating = ?, comment = ? WHERE id = ?',
    [rating, comment || null, id]
  );
  return result.affectedRows;
};

// ──────────────────────────────────────────────
// Delete a rating by ID (owner check in controller)
// ──────────────────────────────────────────────

const remove = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM ratings WHERE id = ?',
    [id]
  );
  return result.affectedRows;
};

// ──────────────────────────────────────────────
// Get all ratings for a resource, newest first
// ──────────────────────────────────────────────

const findByResource = async (resourceId) => {
  const [rows] = await pool.query(
    `SELECT
      r.id AS rating_id,
      u.full_name,
      r.rating,
      r.comment,
      r.created_at
    FROM ratings r
    JOIN users u ON u.id = r.user_id
    WHERE r.resource_id = ?
    ORDER BY r.created_at DESC`,
    [resourceId]
  );
  return rows;
};

// ──────────────────────────────────────────────
// Get average rating and total count for a resource
// ──────────────────────────────────────────────

const getAverageRating = async (resourceId) => {
  const [rows] = await pool.query(
    `SELECT
      COALESCE(ROUND(AVG(rating), 1), 0) AS average_rating,
      COUNT(*) AS total_ratings
    FROM ratings
    WHERE resource_id = ?`,
    [resourceId]
  );
  return rows[0];
};

export default {
  findResourceById,
  findByResourceAndUser,
  findById,
  create,
  update,
  remove,
  findByResource,
  getAverageRating,
};

