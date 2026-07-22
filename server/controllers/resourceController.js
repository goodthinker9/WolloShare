import resourceService from '../services/resourceService.js';

// ──────────────────────────────────────────────
// POST /api/resources  — Upload a new resource
// ──────────────────────────────────────────────

const createResource = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'A resource file is required',
      });
    }

    const resource = await resourceService.createResource({
      uploaderId: req.user.id,
      courseId: Number(req.body.course_id),
      departmentId: Number(req.body.department_id),
      academicLevelId: Number(req.body.academic_level_id),
      title: req.body.title,
      description: req.body.description || null,
      resourceType: req.body.resource_type,
      semester: req.body.semester || null,
      tags: req.body.tags || null,
      file: req.file,
      filePath: req.file.filename,
    });

    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully and is pending admin approval',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/resources/my  — My uploaded resources
// ──────────────────────────────────────────────

const getMyResources = async (req, res, next) => {
  try {
    const resources = await resourceService.getMyResources(req.user.id);

    res.status(200).json({
      success: true,
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/resources/:id  — Update my resource
// ──────────────────────────────────────────────

const updateResource = async (req, res, next) => {
  try {
    const resource = await resourceService.updateResource({
      id: Number(req.params.id),
      uploaderId: req.user.id,
      updates: req.body,
    });

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// DELETE /api/resources/:id  — Delete my resource
// ──────────────────────────────────────────────

const deleteResource = async (req, res, next) => {
  try {
    const result = await resourceService.deleteResource({
      id: Number(req.params.id),
      uploaderId: req.user.id,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/resources  — Search & list approved resources (public)
// ──────────────────────────────────────────────
// Supports: search, filters, sorting, pagination
// Query params:
//   page, limit, search,
//   department_id, course_id, resource_type,
//   academic_level_id, semester,
//   sort_by (newest|oldest|most_downloaded|highest_rated|alphabetical)

const listApprovedResources = async (req, res, next) => {
  try {
    const result = await resourceService.listApprovedResources({
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search: req.query.search || null,
      departmentId: req.query.department_id ? Number(req.query.department_id) : null,
      courseId: req.query.course_id ? Number(req.query.course_id) : null,
      resourceType: req.query.resource_type || null,
      academicLevelId: req.query.academic_level_id ? Number(req.query.academic_level_id) : null,
      semester: req.query.semester || null,
      sortBy: req.query.sort_by || 'newest',
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/resources/:id  — Resource details
// ──────────────────────────────────────────────

const getResourceDetails = async (req, res, next) => {
  try {
    const resource = await resourceService.getResourceDetails(Number(req.params.id));

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/resources/:id/download  — Download resource file
// ──────────────────────────────────────────────

const downloadResource = async (req, res, next) => {
  try {
    const { filePath, resource } = await resourceService.downloadResource({
      resourceId: Number(req.params.id),
      userId: req.user.id,
    });

    res.download(filePath, resource.file_name);
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/admin/resources/pending  — Admin: pending resources
// ──────────────────────────────────────────────

const getPendingResources = async (req, res, next) => {
  try {
    const resources = await resourceService.getPendingResources();

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/admin/resources/:id/approve  — Admin: approve
// ──────────────────────────────────────────────

const approveResource = async (req, res, next) => {
  try {
    const result = await resourceService.approveResource({
      id: Number(req.params.id),
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/admin/resources/:id/reject  — Admin: reject
// ──────────────────────────────────────────────

const rejectResource = async (req, res, next) => {
  try {
    const result = await resourceService.rejectResource({
      id: Number(req.params.id),
      rejectionReason: req.body.rejection_reason || 'No reason provided',
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export {
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
};

