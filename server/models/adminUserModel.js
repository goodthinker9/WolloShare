import pool from '../config/db.js';

// ──────────────────────────────────────────────
// GET ALL USERS with pagination, search, filters
// ──────────────────────────────────────────────

const findAll = async ({ page, limit, search, status, role, department }) => {
  const values = [];
  const conditions = [];

  let query = `
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.role,
      u.account_status,
      u.created_at
    FROM users u
  `;

  if (department) {
    query += `
      JOIN student_profiles sp ON sp.user_id = u.id
    `;
  }

  query += ' WHERE 1=1';

  if (search) {
    conditions.push('(u.full_name LIKE ? OR u.email LIKE ?)');
    const pattern = `%${search}%`;
    values.push(pattern, pattern);
  }

  if (status) {
    conditions.push('u.account_status = ?');
    values.push(status);
  }

  if (role) {
    conditions.push('u.role = ?');
    values.push(role);
  }

  if (department) {
    conditions.push('sp.department_id = ?');
    values.push(department);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  query += ' ORDER BY u.created_at DESC';

  // Count total matching rows
  const countQuery = query.replace(
    /SELECT[\s\S]*?FROM/,
    'SELECT COUNT(*) AS total FROM'
  );
  const [countRows] = await pool.query(countQuery, values);
  const total = countRows[0].total;

  // Apply pagination
  query += ' LIMIT ? OFFSET ?';
  values.push(limit, (page - 1) * limit);

  const [rows] = await pool.query(query, values);

  return { rows, total };
};

// ──────────────────────────────────────────────
// FIND USER BY ID (with all related data)
// ──────────────────────────────────────────────

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT
      u.id,
      u.full_name,
      u.email,
      u.role,
      u.account_status,
      u.created_at,
      u.updated_at
    FROM users u
    WHERE u.id = ?`,
    [id]
  );
  return rows[0] || null;
};

// ──────────────────────────────────────────────
// GET FULL USER PROFILE (with student details)
// ──────────────────────────────────────────────

const findUserProfile = async (id) => {
  const [rows] = await pool.query(
    `SELECT
      u.id,
      u.full_name,
      u.email,
      u.role,
      u.account_status,
      u.created_at,
      sp.student_id,
      d.name AS department,
      p.name AS program,
      al.name AS academic_level,
      sv.verification_status AS verification_status
    FROM users u
    LEFT JOIN student_profiles sp ON sp.user_id = u.id
    LEFT JOIN departments d ON d.id = sp.department_id
    LEFT JOIN programs p ON p.id = sp.program_id
    LEFT JOIN academic_levels al ON al.id = sp.academic_level_id
    LEFT JOIN student_verifications sv ON sv.user_id = u.id
    WHERE u.id = ?`,
    [id]
  );
  return rows[0] || null;
};

// ──────────────────────────────────────────────
// UPDATE ACCOUNT STATUS
// ──────────────────────────────────────────────

const updateStatus = async (id, status) => {
  const [result] = await pool.query(
    'UPDATE users SET account_status = ? WHERE id = ?',
    [status, id]
  );
  return result.affectedRows;
};

// ──────────────────────────────────────────────
// UPDATE USER ROLE
// ──────────────────────────────────────────────

const updateRole = async (id, role) => {
  const [result] = await pool.query(
    'UPDATE users SET role = ? WHERE id = ?',
    [role, id]
  );
  return result.affectedRows;
};

// ──────────────────────────────────────────────
// DELETE USER
// ──────────────────────────────────────────────

const remove = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM users WHERE id = ?',
    [id]
  );
  return result.affectedRows;
};

// ──────────────────────────────────────────────
// DASHBOARD STATISTICS
// ──────────────────────────────────────────────

const getStatistics = async () => {
  const [rows] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_students,
      (SELECT COUNT(*) FROM users WHERE role = 'admin') AS total_admins,
      (SELECT COUNT(*) FROM users WHERE account_status = 'pending') AS pending_accounts,
      (SELECT COUNT(*) FROM users WHERE account_status = 'active') AS active_accounts,
      (SELECT COUNT(*) FROM users WHERE account_status = 'suspended') AS suspended_accounts,
      (SELECT COUNT(*) FROM users WHERE account_status = 'disabled') AS disabled_accounts
  `);
  return rows[0];
};

export default {
  findAll,
  findById,
  findUserProfile,
  updateStatus,
  updateRole,
  remove,
  getStatistics,
};

