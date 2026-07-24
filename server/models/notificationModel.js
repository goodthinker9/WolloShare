import pool from '../config/db.js';

// ──────────────────────────────────────────────
// Reusable: Create a notification
// ──────────────────────────────────────────────

const create = async (userId, title, message, type) => {
  const [result] = await pool.query(
    `INSERT INTO notifications (user_id, title, message, type)
     VALUES (?, ?, ?, ?)`,
    [userId, title, message || null, type]
  );
  return result.insertId;
};

// ──────────────────────────────────────────────
// Get all notifications for a user, newest first
// ──────────────────────────────────────────────

const findByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
      id,
      title,
      message,
      type,
      is_read,
      created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

// ──────────────────────────────────────────────
// Find a single notification by ID
// ──────────────────────────────────────────────

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, user_id, title, message, type, is_read, created_at FROM notifications WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

// ──────────────────────────────────────────────
// Mark a notification as read (owner check in controller)
// ──────────────────────────────────────────────

const markAsRead = async (id) => {
  const [result] = await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = ?',
    [id]
  );
  return result.affectedRows;
};

// ──────────────────────────────────────────────
// Get unread notification count for a user
// ──────────────────────────────────────────────

const getUnreadCount = async (userId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE',
    [userId]
  );
  return rows[0];
};

// ──────────────────────────────────────────────
// Mark all unread notifications as read for a user
// ──────────────────────────────────────────────

const markAllAsRead = async (userId) => {
  const [result] = await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
    [userId]
  );
  return result.affectedRows;
};

export default {
  create,
  findByUser,
  findById,
  markAsRead,
  getUnreadCount,
  markAllAsRead,
};

