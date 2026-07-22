import { body, param, query, validationResult } from 'express-validator';

const VALID_RESOURCE_TYPES = [
  'Lecture Note',
  'Assignment',
  'Past Exam',
  'Lab Manual',
  'Book',
  'Presentation',
  'Project',
  'Other',
];

const VALID_SORT_OPTIONS = [
  'newest',
  'oldest',
  'most_downloaded',
  'highest_rated',
  'alphabetical',
];

/**
 * Normalize search input:
 * - Trim leading/trailing whitespace
 * - Collapse multiple consecutive spaces into a single space
 * - This ensures consistent search behavior regardless of input formatting
 */
const normalizeSearchTerm = (value) => {
  if (!value || typeof value !== 'string') return value;
  return value.trim().replace(/\s+/g, ' ');
};

const validateCreateResource = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be 255 characters or less'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('Description must be a string'),

  body('course_id')
    .isInt({ min: 1 })
    .withMessage('A valid course ID is required')
    .toInt(),

  body('department_id')
    .isInt({ min: 1 })
    .withMessage('A valid department ID is required')
    .toInt(),

  body('academic_level_id')
    .isInt({ min: 1 })
    .withMessage('A valid academic level ID is required')
    .toInt(),

  body('resource_type')
    .trim()
    .notEmpty()
    .withMessage('Resource type is required')
    .isIn(VALID_RESOURCE_TYPES)
    .withMessage(`Invalid resource type. Allowed: ${VALID_RESOURCE_TYPES.join(', ')}`),

  body('semester')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('Semester must be a string'),

  body('tags')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('Tags must be a string'),
];

const validateUpdateResource = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Resource ID must be a positive integer')
    .toInt(),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Title must be 255 characters or less'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('Description must be a string'),

  body('course_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('A valid course ID is required')
    .toInt(),

  body('department_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('A valid department ID is required')
    .toInt(),

  body('academic_level_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('A valid academic level ID is required')
    .toInt(),

  body('resource_type')
    .optional()
    .trim()
    .isIn(VALID_RESOURCE_TYPES)
    .withMessage(`Invalid resource type. Allowed: ${VALID_RESOURCE_TYPES.join(', ')}`),

  body('semester')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('Semester must be a string'),

  body('tags')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('Tags must be a string'),
];

const validateResourceId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Resource ID must be a positive integer')
    .toInt(),
];

const validateListResources = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  // Search: normalize input to handle extra spaces
  query('search')
    .optional()
    .trim()
    .customSanitizer(normalizeSearchTerm)
    .isString()
    .withMessage('Search must be a string'),

  query('department_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer')
    .toInt(),

  query('course_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer')
    .toInt(),

  query('resource_type')
    .optional()
    .trim()
    .isIn(VALID_RESOURCE_TYPES)
    .withMessage(`Invalid resource type. Allowed: ${VALID_RESOURCE_TYPES.join(', ')}`),

  query('academic_level_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Academic level ID must be a positive integer')
    .toInt(),

  query('semester')
    .optional()
    .trim()
    .isString()
    .withMessage('Semester must be a string'),

  // Sort: user-friendly keys mapped to SQL in the service layer
  query('sort_by')
    .optional()
    .trim()
    .isIn(VALID_SORT_OPTIONS)
    .withMessage(`Invalid sort option. Allowed: ${VALID_SORT_OPTIONS.join(', ')}`),
];

const validateAdminDecision = [
  body('rejection_reason')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isString()
    .withMessage('Rejection reason must be a string')
    .isLength({ min: 5 })
    .withMessage('Rejection reason must be at least 5 characters long'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

export {
  validateCreateResource,
  validateUpdateResource,
  validateResourceId,
  validateListResources,
  validateAdminDecision,
  handleValidationErrors,
};

