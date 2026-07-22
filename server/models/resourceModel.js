import pool from '../config/db.js';

// ──────────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────────

const createResource = async ({
  uploaderId,
  courseId,
  departmentId,
  academicLevelId,
  title,
  description,
  resourceType,
  semester,
  tags,
  fileName,
  filePath,
  fileSize,
  mimeType,
}) => {
  const [result] = await pool.query(
    `INSERT INTO resources (
      uploader_id,
      course_id,
      department_id,
      academic_level_id,
      title,
      description,
      file_name,
      file_path,
      resource_type,
      semester,
      tags,
      file_size,
      mime_type,
      approval_status,
      download_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0)`,
    [
      uploaderId,
      courseId,
      departmentId,
      academicLevelId,
      title,
      description || null,
      fileName,
      filePath,
      resourceType,
      semester || null,
      tags || null,
      fileSize,
      mimeType,
    ]
  );

  return result.insertId;
};

// ──────────────────────────────────────────────
// READ — Single resource by ID
// ──────────────────────────────────────────────

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT
      r.id,
      r.uploader_id,
      r.course_id,
      r.department_id,
      r.academic_level_id,
      r.title,
      r.description,
      r.file_name,
      r.file_path,
      r.resource_type,
      r.semester,
      r.tags,
      r.file_size,
      r.mime_type,
      r.approval_status,
      r.rejection_reason,
      r.download_count,
      r.created_at,
      r.updated_at,
      u.full_name AS uploader_name,
      u.email AS uploader_email
    FROM resources r
    JOIN users u ON u.id = r.uploader_id
    WHERE r.id = ?`,
    [id]
  );

  return rows[0] || null;
};

// ──────────────────────────────────────────────
// READ — All resources for a specific uploader
// ──────────────────────────────────────────────

const findByUploader = async (uploaderId) => {
  const [rows] = await pool.query(
    `SELECT
      r.id,
      r.uploader_id,
      r.course_id,
      r.department_id,
      r.academic_level_id,
      r.title,
      r.description,
      r.file_name,
      r.file_path,
      r.resource_type,
      r.semester,
      r.tags,
      r.file_size,
      r.mime_type,
      r.approval_status,
      r.rejection_reason,
      r.download_count,
      r.created_at,
      r.updated_at
    FROM resources r
    WHERE r.uploader_id = ?
    ORDER BY r.created_at DESC`,
    [uploaderId]
  );

  return rows;
};

// ──────────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────────

const updateResource = async ({
  id,
  title,
  description,
  courseId,
  departmentId,
  academicLevelId,
  resourceType,
  semester,
  tags,
}) => {
  const [result] = await pool.query(
    `UPDATE resources
     SET title = ?,
         description = ?,
         course_id = ?,
         department_id = ?,
         academic_level_id = ?,
         resource_type = ?,
         semester = ?,
         tags = ?
     WHERE id = ?`,
    [
      title,
      description || null,
      courseId,
      departmentId,
      academicLevelId,
      resourceType,
      semester || null,
      tags || null,
      id,
    ]
  );

  return result.affectedRows;
};

// ──────────────────────────────────────────────
// DELETE
// ──────────────────────────────────────────────

const deleteResource = async (id, uploaderId) => {
  const [result] = await pool.query(
    'DELETE FROM resources WHERE id = ? AND uploader_id = ?',
    [id, uploaderId]
  );

  return result.affectedRows;
};

// ──────────────────────────────────────────────
// SEARCH — Case-insensitive, normalized search
//           across title, description, tags, and course name/code.
//           Only returns APPROVED resources.
//           Supports sorting by multiple criteria.
//           Supports filtering by department, course, type, level, semester.
// ──────────────────────────────────────────────

const SORT_MAP = {
  newest:          { column: 'r.created_at',     direction: 'DESC' },
  oldest:          { column: 'r.created_at',     direction: 'ASC'  },
  most_downloaded: { column: 'r.download_count', direction: 'DESC' },
  alphabetical:    { column: 'r.title',          direction: 'ASC'  },
};

const RATING_SUBQUERY = `
  LEFT JOIN (
    SELECT resource_id, AVG(rating) AS avg_rating
    FROM ratings
    GROUP BY resource_id
  ) avg_r ON avg_r.resource_id = r.id
`;

const listApprovedResources = async ({
  limit,
  offset,
  search,
  departmentId,
  courseId,
  resourceType,
  academicLevelId,
  semester,
  sortBy,
}) => {
  const values = [];
  let joinClause = '';
  let orderClause = '';

  let query = `
    SELECT
      r.id,
      r.uploader_id,
      r.course_id,
      r.department_id,
      r.academic_level_id,
      r.title,
      r.description,
      r.file_name,
      r.file_path,
      r.resource_type,
      r.semester,
      r.tags,
      r.file_size,
      r.mime_type,
      r.approval_status,
      r.download_count,
      r.created_at,
      r.updated_at,
      u.full_name AS uploader_name,
      u.email AS uploader_email,
      c.course_code,
      c.course_name
  `;

  if (sortBy === 'highest_rated') {
    query += `, COALESCE(avg_r.avg_rating, 0) AS avg_rating`;
    joinClause += RATING_SUBQUERY;
  }

  query += `
    FROM resources r
    JOIN users u ON u.id = r.uploader_id
    JOIN courses c ON c.id = r.course_id
    ${joinClause}
    WHERE r.approval_status = 'approved'
  `;

  if (search) {
    query += `
      AND (
        r.title LIKE ? OR
        r.description LIKE ? OR
        r.tags LIKE ? OR
        c.course_name LIKE ? OR
        c.course_code LIKE ?
      )
    `;
    const pattern = `%${search}%`;
    values.push(pattern, pattern, pattern, pattern, pattern);
  }

  if (departmentId) {
    query += ' AND r.department_id = ?';
    values.push(departmentId);
  }

  if (courseId) {
    query += ' AND r.course_id = ?';
    values.push(courseId);
  }

  if (resourceType) {
    query += ' AND r.resource_type = ?';
    values.push(resourceType);
  }

  if (academicLevelId) {
    query += ' AND r.academic_level_id = ?';
    values.push(academicLevelId);
  }

  if (semester) {
    query += ' AND r.semester = ?';
    values.push(semester);
  }

  if (sortBy === 'highest_rated') {
    orderClause = ' ORDER BY avg_rating DESC, r.download_count DESC';
  } else {
    const sortConfig = SORT_MAP[sortBy];
    if (sortConfig) {
      orderClause = ` ORDER BY ${sortConfig.column} ${sortConfig.direction}`;
    } else {
      orderClause = ' ORDER BY r.created_at DESC';
    }
  }

  query += `${orderClause} LIMIT ? OFFSET ?`;
  values.push(limit, offset);

  const [rows] = await pool.query(query, values);
  return rows;
};

const countApprovedResources = async ({
  search,
  departmentId,
  courseId,
  resourceType,
  academicLevelId,
  semester,
}) => {
  const values = [];

  let query = `
    SELECT COUNT(*) AS total
    FROM resources r
    JOIN courses c ON c.id = r.course_id
    WHERE r.approval_status = 'approved'
  `;

  if (search) {
    query += `
      AND (
        r.title LIKE ? OR
        r.description LIKE ? OR
        r.tags LIKE ? OR
        c.course_name LIKE ? OR
        c.course_code LIKE ?
      )
    `;
    const pattern = `%${search}%`;
    values.push(pattern, pattern, pattern, pattern, pattern);
  }

  if (departmentId) {
    query += ' AND r.department_id = ?';
    values.push(departmentId);
  }

  if (courseId) {
    query += ' AND r.course_id = ?';
    values.push(courseId);
  }

  if (resourceType) {
    query += ' AND r.resource_type = ?';
    values.push(resourceType);
  }

  if (academicLevelId) {
    query += ' AND r.academic_level_id = ?';
    values.push(academicLevelId);
  }

  if (semester) {
    query += ' AND r.semester = ?';
    values.push(semester);
  }

  const [rows] = await pool.query(query, values);
  return rows[0].total;
};

// ──────────────────────────────────────────────
// ADMIN: PENDING & APPROVAL
// ──────────────────────────────────────────────

const getPendingResources = async () => {
  const [rows] = await pool.query(
    `SELECT
      r.*,
      u.full_name AS uploader_name,
      u.email AS uploader_email
    FROM resources r
    JOIN users u ON u.id = r.uploader_id
    WHERE r.approval_status = 'pending'
    ORDER BY r.created_at DESC`
  );

  return rows;
};

const updateApprovalStatus = async ({ id, approvalStatus, rejectionReason }) => {
  const [result] = await pool.query(
    `UPDATE resources
     SET approval_status = ?,
         rejection_reason = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [approvalStatus, rejectionReason || null, id]
  );

  return result.affectedRows;
};

// ──────────────────────────────────────────────
// DOWNLOADS
// ──────────────────────────────────────────────

const incrementDownloadCount = async (id) => {
  await pool.query(
    'UPDATE resources SET download_count = download_count + 1 WHERE id = ?',
    [id]
  );
};

const createDownloadRecord = async ({ resourceId, userId }) => {
  await pool.query(
    'INSERT INTO downloads (resource_id, user_id) VALUES (?, ?)',
    [resourceId, userId]
  );
};

export default {
  createResource,
  findById,
  findByUploader,
  updateResource,
  deleteResource,
  listApprovedResources,
  countApprovedResources,
  getPendingResources,
  updateApprovalStatus,
  incrementDownloadCount,
  createDownloadRecord,
};

