import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import resourceModel from '../models/resourceModel.js';
import userModel from '../models/userModel.js';
import { deleteFile } from '../utils/fileUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads/resources');

// ──────────────────────────────────────────────
// CREATE RESOURCE
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
  file,
  filePath,
}) => {
  // Verify user exists
  const user = await userModel.findUserById(uploaderId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Only students can upload
  if (user.role !== 'student') {
    const error = new Error('Only students can upload resources');
    error.statusCode = 403;
    throw error;
  }

  // Only verified (active) students can upload
  if (user.account_status !== 'active') {
    const error = new Error(
      'Account must be verified before uploading resources. Please wait for admin verification.'
    );
    error.statusCode = 403;
    throw error;
  }

  // Verify uploaded file exists on disk
  const fileName = file.filename;
  const savedFilePath = path.join(uploadDir, fileName);

  if (!fs.existsSync(savedFilePath)) {
    const error = new Error('Uploaded file is missing on disk');
    error.statusCode = 500;
    throw error;
  }

  const id = await resourceModel.createResource({
    uploaderId,
    courseId,
    departmentId,
    academicLevelId,
    title,
    description: description || null,
    resourceType,
    semester: semester || null,
    tags: tags || null,
    fileName,
    filePath: filePath || fileName,
    fileSize: file.size,
    mimeType: file.mimetype,
  });

  return resourceModel.findById(id);
};

// ──────────────────────────────────────────────
// GET MY RESOURCES
// ──────────────────────────────────────────────

const getMyResources = async (uploaderId) => {
  return resourceModel.findByUploader(uploaderId);
};

// ──────────────────────────────────────────────
// UPDATE RESOURCE
// ──────────────────────────────────────────────

const updateResource = async ({ id, uploaderId, updates }) => {
  const existing = await resourceModel.findById(id);

  if (!existing) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  // Only the uploader can edit
  if (existing.uploader_id !== uploaderId) {
    const error = new Error('You can only edit your own resources');
    error.statusCode = 403;
    throw error;
  }

  // Only pending resources can be edited
  if (existing.approval_status !== 'pending') {
    const error = new Error('Only pending resources can be edited');
    error.statusCode = 400;
    throw error;
  }

  await resourceModel.updateResource({
    id,
    title: updates.title ?? existing.title,
    description: updates.description ?? existing.description,
    courseId: updates.course_id ?? existing.course_id,
    departmentId: updates.department_id ?? existing.department_id,
    academicLevelId: updates.academic_level_id ?? existing.academic_level_id,
    resourceType: updates.resource_type ?? existing.resource_type,
    semester: updates.semester ?? existing.semester,
    tags: updates.tags ?? existing.tags,
  });

  return resourceModel.findById(id);
};

// ──────────────────────────────────────────────
// DELETE RESOURCE
// ──────────────────────────────────────────────

const deleteResource = async ({ id, uploaderId }) => {
  const existing = await resourceModel.findById(id);

  if (!existing) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  // Only the uploader can delete
  if (existing.uploader_id !== uploaderId) {
    const error = new Error('You can only delete your own resources');
    error.statusCode = 403;
    throw error;
  }

  const affectedRows = await resourceModel.deleteResource(id, uploaderId);

  if (!affectedRows) {
    const error = new Error('Failed to delete resource');
    error.statusCode = 500;
    throw error;
  }

  // Attempt to remove file from disk (non-blocking)
  const filePath = path.resolve(uploadDir, existing.file_name);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // File cleanup failure should not break the response
    console.warn(`Failed to delete file from disk: ${filePath}`);
  }

  return { success: true, message: 'Resource deleted successfully' };
};

// ──────────────────────────────────────────────
// SEARCH & LIST APPROVED RESOURCES (PUBLIC)
// ──────────────────────────────────────────────
// Maps user-friendly sort_by keys and returns
// flat pagination structure.

const listApprovedResources = async ({
  page = 1,
  limit = 10,
  search,
  departmentId,
  courseId,
  resourceType,
  academicLevelId,
  semester,
  sortBy = 'newest',
}) => {
  const offset = (page - 1) * limit;

  const items = await resourceModel.listApprovedResources({
    limit,
    offset,
    search,
    departmentId,
    courseId,
    resourceType,
    academicLevelId,
    semester,
    sortBy,
  });

  const total = await resourceModel.countApprovedResources({
    search,
    departmentId,
    courseId,
    resourceType,
    academicLevelId,
    semester,
  });

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items,
    currentPage: page,
    totalPages,
    totalItems: total,
  };
};

// ──────────────────────────────────────────────
// GET RESOURCE DETAILS
// ──────────────────────────────────────────────

const getResourceDetails = async (id) => {
  const resource = await resourceModel.findById(id);

  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  if (resource.approval_status !== 'approved') {
    const error = new Error('Resource is not available yet');
    error.statusCode = 403;
    throw error;
  }

  return resource;
};

// ──────────────────────────────────────────────
// DOWNLOAD RESOURCE
// ──────────────────────────────────────────────

const downloadResource = async ({ resourceId, userId }) => {
  const resource = await resourceModel.findById(resourceId);

  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  if (resource.approval_status !== 'approved') {
    const error = new Error('Resource is not available yet');
    error.statusCode = 403;
    throw error;
  }

  const filePath = path.resolve(uploadDir, resource.file_name);

  if (!fs.existsSync(filePath)) {
    const error = new Error('Resource file not found on disk');
    error.statusCode = 404;
    throw error;
  }

  // Track the download
  await resourceModel.incrementDownloadCount(resourceId);
  await resourceModel.createDownloadRecord({ resourceId, userId });

  return { filePath, resource };
};

// ──────────────────────────────────────────────
// ADMIN: PENDING RESOURCES
// ──────────────────────────────────────────────

const getPendingResources = async () => {
  return resourceModel.getPendingResources();
};

// ──────────────────────────────────────────────
// ADMIN: APPROVE RESOURCE
// ──────────────────────────────────────────────

const approveResource = async ({ id }) => {
  const resource = await resourceModel.findById(id);

  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  if (resource.approval_status !== 'pending') {
    const error = new Error('Resource has already been processed');
    error.statusCode = 400;
    throw error;
  }

  const affectedRows = await resourceModel.updateApprovalStatus({
    id,
    approvalStatus: 'approved',
    rejectionReason: null,
  });

  if (!affectedRows) {
    const error = new Error('Failed to approve resource');
    error.statusCode = 500;
    throw error;
  }

  return { success: true, message: 'Resource approved successfully' };
};

// ──────────────────────────────────────────────
// ADMIN: REJECT RESOURCE
// ──────────────────────────────────────────────

const rejectResource = async ({ id, rejectionReason }) => {
  const resource = await resourceModel.findById(id);

  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  if (resource.approval_status !== 'pending') {
    const error = new Error('Resource has already been processed');
    error.statusCode = 400;
    throw error;
  }

  const affectedRows = await resourceModel.updateApprovalStatus({
    id,
    approvalStatus: 'rejected',
    rejectionReason: rejectionReason || 'No reason provided',
  });

  if (!affectedRows) {
    const error = new Error('Failed to reject resource');
    error.statusCode = 500;
    throw error;
  }

  return { success: true, message: 'Resource rejected successfully' };
};

// ──────────────────────────────────────────────
// ADMIN: DELETE RESOURCE (with file cleanup)
// ──────────────────────────────────────────────

const adminDeleteResource = async ({ id }) => {
  const resource = await resourceModel.findById(id);

  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  const affectedRows = await resourceModel.deleteResourceById(id);

  if (!affectedRows) {
    const error = new Error('Failed to delete resource');
    error.statusCode = 500;
    throw error;
  }

  // Delete the physical uploaded file using fileUtils
  const filePath = path.resolve(uploadDir, resource.file_name);
  deleteFile(filePath);

  return { success: true, message: 'Resource deleted successfully' };
};

export default {
  createResource,
  getMyResources,
  updateResource,
  deleteResource,
  listApprovedResources,
  getResourceDetails,
  downloadResource,
  getPendingResources,
  approveResource,
  rejectResource,
  adminDeleteResource,
};

