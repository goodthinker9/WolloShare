import pool from '../config/db.js';

const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

const createUser = async ({ fullName, email, passwordHash }) => {
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, password, role, account_status) VALUES (?, ?, ?, ?, ?)',
    [fullName, email, passwordHash, 'student', 'pending']
  );

  return result.insertId;
};

const createStudentProfile = async ({ userId, studentId, departmentId, programId, academicLevelId }) => {
  await pool.query(
    'INSERT INTO student_profiles (user_id, student_id, department_id, program_id, academic_level_id) VALUES (?, ?, ?, ?, ?)',
    [userId, studentId, departmentId, programId, academicLevelId]
  );
};

const createVerificationRecord = async ({ userId, studentId, imagePath }) => {
  await pool.query(
    'INSERT INTO student_verifications (user_id, student_id, id_card_front_image, verification_status) VALUES (?, ?, ?, ?)',
    [userId, studentId, imagePath, 'pending']
  );
};

const findUserById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};

export default {
  findUserByEmail,
  createUser,
  createStudentProfile,
  createVerificationRecord,
  findUserById,
};
