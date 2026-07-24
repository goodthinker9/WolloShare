import pool from '../config/db.js';

// ──────────────────────────────────────────────
// Find user by ID
// ──────────────────────────────────────────────

const findUserById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, full_name, email, role, account_status FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

// ──────────────────────────────────────────────
// Find user by ID with password (for password change verification)
// ──────────────────────────────────────────────

const findUserWithPassword = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, full_name, email, password, role, account_status FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

// ──────────────────────────────────────────────
// Get student profile with joined names
// ──────────────────────────────────────────────

const findStudentProfile = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
      sp.student_id,
      d.name AS department,
      p.name AS program,
      al.name AS academic_level
    FROM student_profiles sp
    LEFT JOIN departments d ON d.id = sp.department_id
    LEFT JOIN programs p ON p.id = sp.program_id
    LEFT JOIN academic_levels al ON al.id = sp.academic_level_id
    WHERE sp.user_id = ?`,
    [userId]
  );
  return rows[0] || null;
};

// ──────────────────────────────────────────────
// Update user's full name
// ──────────────────────────────────────────────

const updateFullName = async (id, fullName) => {
  const [result] = await pool.query(
    'UPDATE users SET full_name = ? WHERE id = ?',
    [fullName, id]
  );
  return result.affectedRows;
};

// ──────────────────────────────────────────────
// Update user's password
// ──────────────────────────────────────────────

const updatePassword = async (id, passwordHash) => {
  const [result] = await pool.query(
    'UPDATE users SET password = ? WHERE id = ?',
    [passwordHash, id]
  );
  return result.affectedRows;
};

export default {
  findUserById,
  findUserWithPassword,
  findStudentProfile,
  updateFullName,
  updatePassword,
};

