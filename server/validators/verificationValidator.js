import { body, param, validationResult } from 'express-validator';

const validateVerificationDecision = [
  body('rejection_reason')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Rejection reason must be a string')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Rejection reason must be at least 5 characters long'),
];

const validateVerificationId = [
  param('id').isInt({ min: 1 }).withMessage('Verification ID must be a positive integer'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((error) => ({ field: error.path, message: error.msg })),
    });
  }

  next();
};

export { validateVerificationDecision, validateVerificationId, handleValidationErrors };
