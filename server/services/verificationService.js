import pool from '../config/db.js';

const getPendingVerifications = async () => {
  const [rows] = await pool.query(`
    SELECT
      sv.id,
      sv.user_id,
      sv.student_id,
      sv.id_card_front_image,
      sv.verification_status,
      sv.created_at,
      u.full_name,
      u.email,
      u.account_status
    FROM student_verifications sv
    JOIN users u ON u.id = sv.user_id
    WHERE sv.verification_status = 'pending'
    ORDER BY sv.created_at DESC
  `);

  return rows;
};

const getVerificationById = async (id) => {
  const [rows] = await pool.query(`
    SELECT
      sv.id,
      sv.user_id,
      sv.student_id,
      sv.id_card_front_image,
      sv.verification_status,
      sv.verified_by,
      sv.created_at,
      u.full_name,
      u.email,
      u.account_status,
      sp.department_id,
      sp.program_id,
      sp.academic_level_id
    FROM student_verifications sv
    JOIN users u ON u.id = sv.user_id
    LEFT JOIN student_profiles sp ON sp.user_id = sv.user_id
    WHERE sv.id = ?
  `, [id]);

  return rows[0] || null;
};

const approveVerification = async ({ verificationId, adminId }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [verificationRows] = await connection.query(
      'SELECT id, user_id, verification_status FROM student_verifications WHERE id = ? FOR UPDATE',
      [verificationId]
    );

    if (!verificationRows.length) {
      const error = new Error('Verification request not found');
      error.statusCode = 404;
      throw error;
    }

    await connection.query(
      'UPDATE student_verifications SET verification_status = ?, verified_by = ?, verified_at = NOW(), rejection_reason = NULL WHERE id = ?',
      ['verified', adminId, verificationId]
    );

    await connection.query(
      'UPDATE users SET account_status = ? WHERE id = ?',
      ['active', verificationRows[0].user_id]
    );

    await connection.commit();

    return { success: true, message: 'Verification approved successfully' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const rejectVerification = async ({ verificationId, adminId, rejectionReason }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [verificationRows] = await connection.query(
      'SELECT id, user_id, verification_status FROM student_verifications WHERE id = ? FOR UPDATE',
      [verificationId]
    );

    if (!verificationRows.length) {
      const error = new Error('Verification request not found');
      error.statusCode = 404;
      throw error;
    }

    await connection.query(
      'UPDATE student_verifications SET verification_status = ?, verified_by = ?, verified_at = NOW(), rejection_reason = ? WHERE id = ?',
      ['rejected', adminId, rejectionReason, verificationId]
    );

    await connection.query(
      'UPDATE users SET account_status = ? WHERE id = ?',
      ['rejected', verificationRows[0].user_id]
    );

    await connection.commit();

    return { success: true, message: 'Verification rejected successfully' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getStudentVerificationStatus = async (userId) => {
  const [rows] = await pool.query(`
    SELECT
      verification_status,
      rejection_reason,
      created_at,
      verified_at
    FROM student_verifications
    WHERE user_id = ?
  `, [userId]);

  return rows[0] || null;
};

export default {
  getPendingVerifications,
  getVerificationById,
  approveVerification,
  rejectVerification,
  getStudentVerificationStatus,
};
