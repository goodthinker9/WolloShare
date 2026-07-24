import adminUserModel from '../models/adminUserModel.js';

// ──────────────────────────────────────────────
// GET /api/admin/users  — Get all users
// ──────────────────────────────────────────────

const getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const search = req.query.search || null;
    const status = req.query.status || null;
    const role = req.query.role || null;
    const department = req.query.department ? Number(req.query.department) : null;

    const { rows, total } = await adminUserModel.findAll({
      page,
      limit,
      search,
      status,
      role,
      department,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/admin/users/:id  — Get single user
// ──────────────────────────────────────────────

const getSingleUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);

    const user = await adminUserModel.findUserProfile(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PATCH /api/admin/users/:id/status  — Update status
// ──────────────────────────────────────────────

const updateUserStatus = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = ['pending', 'active', 'suspended', 'disabled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    // Verify user exists
    const user = await adminUserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await adminUserModel.updateStatus(userId, status);

    res.status(200).json({
      success: true,
      message: 'Account status updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PATCH /api/admin/users/:id/role  — Update role
// ──────────────────────────────────────────────

const updateUserRole = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;
    const adminUserId = req.user.id;

    const allowedRoles = ['student', 'admin'];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${allowedRoles.join(', ')}`,
      });
    }

    // Prevent admin from removing their own admin role
    if (userId === adminUserId && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You cannot remove your own admin role.',
      });
    }

    // Verify user exists
    const user = await adminUserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await adminUserModel.updateRole(userId, role);

    res.status(200).json({
      success: true,
      message: 'User role updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// DELETE /api/admin/users/:id  — Delete user
// ──────────────────────────────────────────────

const deleteUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const adminUserId = req.user.id;

    // Admin cannot delete their own account
    if (userId === adminUserId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    // Verify user exists
    const user = await adminUserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await adminUserModel.remove(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/admin/users/stats  — Dashboard statistics
// ──────────────────────────────────────────────

const getUserStatistics = async (req, res, next) => {
  try {
    const stats = await adminUserModel.getStatistics();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getUserStatistics,
};

