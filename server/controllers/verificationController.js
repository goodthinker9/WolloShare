import verificationService from '../services/verificationService.js';

const listPendingVerifications = async (req, res, next) => {
  try {
    const verifications = await verificationService.getPendingVerifications();

    res.status(200).json({
      success: true,
      message: 'Pending verification requests retrieved successfully',
      data: verifications,
    });
  } catch (error) {
    next(error);
  }
};

const getVerificationDetails = async (req, res, next) => {
  try {
    const verification = await verificationService.getVerificationById(req.params.id);

    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification request not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Verification details retrieved successfully',
      data: verification,
    });
  } catch (error) {
    next(error);
  }
};

const approveVerification = async (req, res, next) => {
  try {
    const result = await verificationService.approveVerification({
      verificationId: req.params.id,
      adminId: req.user.id,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const rejectVerification = async (req, res, next) => {
  try {
    const result = await verificationService.rejectVerification({
      verificationId: req.params.id,
      adminId: req.user.id,
      rejectionReason: req.body.rejection_reason || 'No reason provided',
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getStudentVerificationStatus = async (req, res, next) => {
  try {
    const status = await verificationService.getStudentVerificationStatus(req.user.id);

    if (!status) {
      return res.status(404).json({ success: false, message: 'Verification record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Verification status retrieved successfully',
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

export {
  listPendingVerifications,
  getVerificationDetails,
  approveVerification,
  rejectVerification,
  getStudentVerificationStatus,
};

export default {
  listPendingVerifications,
  getVerificationDetails,
  approveVerification,
  rejectVerification,
  getStudentVerificationStatus,
};
