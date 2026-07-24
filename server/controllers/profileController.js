import bcrypt from 'bcryptjs';
import profileModel from '../models/profileModel.js';

// ──────────────────────────────────────────────
// GET /api/profile  — Get my profile
// ──────────────────────────────────────────────

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user info
    const user = await profileModel.findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Build response
    const profile = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      account_status: user.account_status,
    };

    // If the user is a student, attach their academic profile
    if (user.role === 'student') {
      const studentProfile = await profileModel.findStudentProfile(userId);

      if (studentProfile) {
        profile.student_id = studentProfile.student_id;
        profile.department = studentProfile.department;
        profile.program = studentProfile.program;
        profile.academic_level = studentProfile.academic_level;
      }
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/profile  — Update profile (full_name only)
// ──────────────────────────────────────────────

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { full_name } = req.body;

    // Verify user exists
    const user = await profileModel.findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Only allow updating full_name
    if (!full_name || typeof full_name !== 'string' || full_name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required and cannot be empty',
      });
    }

    await profileModel.updateFullName(userId, full_name.trim());

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/profile/change-password  — Change password
// ──────────────────────────────────────────────

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Verify both fields provided
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    // Fetch user with current password hash
    const user = await profileModel.findUserWithPassword(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid current password',
      });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password in database
    await profileModel.updatePassword(userId, passwordHash);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export {
  getProfile,
  updateProfile,
  changePassword,
};

