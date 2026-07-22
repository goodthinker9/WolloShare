import { body, validationResult } from 'express-validator';

const validateRegister = [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('student_id').trim().notEmpty().withMessage('Student ID is required'),
  body('department_id').isInt({ min: 1 }).withMessage('Department is required'),
  body('program_id').isInt({ min: 1 }).withMessage('Program is required'),
  body('academic_level_id').isInt({ min: 1 }).withMessage('Academic level is required'),
];

const validateLogin = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
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

export { validateRegister, validateLogin, handleValidationErrors };
