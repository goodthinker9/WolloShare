import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WolloShare API',
      description: 'Student resource sharing platform API',
      version: '1.0.0',
      contact: {
        name: 'WolloShare Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            full_name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['student', 'admin'], example: 'student' },
            account_status: {
              type: 'string',
              enum: ['pending', 'active', 'suspended', 'disabled'],
              example: 'active',
            },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        StudentProfile: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            student_id: { type: 'string', example: 'S12345' },
            department: { type: 'string', example: 'Computer Science' },
            program: { type: 'string', example: 'BSc in Software Engineering' },
            academic_level: { type: 'string', example: 'Year 3' },
            verification_status: {
              type: 'string',
              enum: ['pending', 'verified', 'rejected'],
              example: 'verified',
            },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Resource: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            uploader_id: { type: 'integer', example: 1 },
            course_id: { type: 'integer', example: 1 },
            department_id: { type: 'integer', example: 1 },
            academic_level_id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Introduction to Algorithms' },
            description: { type: 'string', example: 'Lecture notes on sorting algorithms' },
            file_name: { type: 'string', example: 'algorithms.pdf' },
            resource_type: {
              type: 'string',
              enum: ['Lecture Note', 'Assignment', 'Exam', 'Book', 'Project'],
              example: 'Lecture Note',
            },
            semester: { type: 'string', example: '2024/1' },
            tags: { type: 'string', example: 'algorithms, data structures' },
            file_size: { type: 'integer', example: 2048576 },
            mime_type: { type: 'string', example: 'application/pdf' },
            approval_status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              example: 'approved',
            },
            download_count: { type: 'integer', example: 42 },
            created_at: { type: 'string', format: 'date-time' },
            uploader_name: { type: 'string', example: 'John Doe' },
          },
        },
        Rating: {
          type: 'object',
          properties: {
            rating_id: { type: 'integer', example: 1 },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            comment: { type: 'string', example: 'Excellent lecture notes.' },
            full_name: { type: 'string', example: 'John Doe' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Bookmark: {
          type: 'object',
          properties: {
            resource_id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Introduction to Algorithms' },
            resource_type: { type: 'string', example: 'Lecture Note' },
            file_name: { type: 'string', example: 'algorithms.pdf' },
            approval_status: { type: 'string', example: 'approved' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Resource Approved' },
            message: {
              type: 'string',
              example: 'Your resource "Introduction to Algorithms" has been approved.',
            },
            type: {
              type: 'string',
              enum: ['resource', 'verification', 'report', 'system'],
              example: 'resource',
            },
            is_read: { type: 'boolean', example: false },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Report: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            resource_id: { type: 'integer', example: 1 },
            resource_title: { type: 'string', example: 'Introduction to Algorithms' },
            reported_by: { type: 'string', example: 'John Doe' },
            reason: { type: 'string', example: 'Inappropriate content' },
            status: {
              type: 'string',
              enum: ['pending', 'reviewed', 'resolved'],
              example: 'pending',
            },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [],
};

// We will manually define paths here since the project uses separate route files
const manualPaths = {
  // ──────────────────────────────────────────────
  // AUTHENTICATION
  // ──────────────────────────────────────────────
  '/api/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'Register a new user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['full_name', 'email', 'password'],
              properties: {
                full_name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', format: 'email', example: 'john@example.com' },
                password: { type: 'string', format: 'password', example: 'securePassword123' },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Registration successful' },
                  data: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Login user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email', example: 'john@example.com' },
                password: { type: 'string', format: 'password', example: 'securePassword123' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Login successful, returns JWT token',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                },
              },
            },
          },
        },
        401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  // ──────────────────────────────────────────────
  // STUDENT VERIFICATION
  // ──────────────────────────────────────────────
  '/api/student/verification-status': {
    get: {
      tags: ['Student Verification'],
      summary: 'Get student verification status',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Verification status retrieved', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/StudentProfile' } } } } } },
        401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  // ──────────────────────────────────────────────
  // RESOURCES
  // ──────────────────────────────────────────────
  '/api/resources': {
    get: {
      tags: ['Resources'],
      summary: 'List approved resources (public)',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'department_id', in: 'query', schema: { type: 'integer' } },
        { name: 'course_id', in: 'query', schema: { type: 'integer' } },
        { name: 'resource_type', in: 'query', schema: { type: 'string' } },
        { name: 'sort_by', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'most_downloaded', 'highest_rated', 'alphabetical'] } },
      ],
      responses: {
        200: { description: 'Resources retrieved', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'object', properties: { items: { type: 'array', items: { $ref: '#/components/schemas/Resource' } }, currentPage: { type: 'integer' }, totalPages: { type: 'integer' }, totalItems: { type: 'integer' } } } } } } } },
      },
    },
    post: {
      tags: ['Resources'],
      summary: 'Upload a new resource (student only)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['file', 'title', 'course_id', 'department_id', 'academic_level_id', 'resource_type'],
              properties: {
                file: { type: 'string', format: 'binary', description: 'Resource file (PDF, DOC, DOCX, PPT, PPTX)' },
                title: { type: 'string', example: 'Introduction to Algorithms' },
                description: { type: 'string', example: 'Lecture notes on algorithms' },
                course_id: { type: 'integer', example: 1 },
                department_id: { type: 'integer', example: 1 },
                academic_level_id: { type: 'integer', example: 1 },
                resource_type: { type: 'string', enum: ['Lecture Note', 'Assignment', 'Exam', 'Book', 'Project'] },
                semester: { type: 'string', example: '2024/1' },
                tags: { type: 'string', example: 'algorithms, data structures' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Resource uploaded and pending approval', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string' }, data: { $ref: '#/components/schemas/Resource' } } } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/resources/my': {
    get: {
      tags: ['Resources'],
      summary: 'Get my uploaded resources (student)',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Resources retrieved', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Resource' } } } } } } },
        401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/resources/{id}': {
    get: {
      tags: ['Resources'],
      summary: 'Get resource details',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Resource details', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Resource' } } } } } },
        404: { description: 'Resource not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    put: {
      tags: ['Resources'],
      summary: 'Update my resource (student)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                course_id: { type: 'integer' },
                resource_type: { type: 'string' },
                tags: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Resource updated' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Resource not found' },
      },
    },
    delete: {
      tags: ['Resources'],
      summary: 'Delete my resource (student)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Resource deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Resource not found' },
      },
    },
  },
  '/api/resources/{id}/download': {
    get: {
      tags: ['Resources'],
      summary: 'Download a resource file',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'File downloaded' },
        401: { description: 'Unauthorized' },
        404: { description: 'Resource or file not found' },
      },
    },
  },

  // ──────────────────────────────────────────────
  // BOOKMARKS
  // ──────────────────────────────────────────────
  '/api/bookmarks': {
    get: {
      tags: ['Bookmarks'],
      summary: 'Get my bookmarks',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Bookmarks retrieved', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Bookmark' } } } } } } },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/api/bookmarks/{resourceId}': {
    post: {
      tags: ['Bookmarks'],
      summary: 'Add a bookmark',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'resourceId', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        201: { description: 'Bookmarked successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        401: { description: 'Unauthorized' },
        404: { description: 'Resource not found' },
        409: { description: 'Already bookmarked', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    delete: {
      tags: ['Bookmarks'],
      summary: 'Remove a bookmark',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'resourceId', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Bookmark removed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        401: { description: 'Unauthorized' },
      },
    },
  },

  // ──────────────────────────────────────────────
  // RATINGS
  // ──────────────────────────────────────────────
  '/api/ratings/resource/{resourceId}': {
    get: {
      tags: ['Ratings'],
      summary: 'Get all ratings for a resource',
      parameters: [{ name: 'resourceId', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Ratings retrieved', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Rating' } } } } } } },
        404: { description: 'Resource not found' },
      },
    },
  },
  '/api/ratings/resource/{resourceId}/average': {
    get: {
      tags: ['Ratings'],
      summary: 'Get average rating for a resource',
      parameters: [{ name: 'resourceId', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Average rating retrieved' },
        404: { description: 'Resource not found' },
      },
    },
  },
  '/api/ratings/{resourceId}': {
    post: {
      tags: ['Ratings'],
      summary: 'Rate a resource',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'resourceId', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['rating'],
              properties: {
                rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                comment: { type: 'string', example: 'Excellent lecture notes.' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Rating submitted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        400: { description: 'Invalid rating' },
        401: { description: 'Unauthorized' },
        404: { description: 'Resource not found' },
        409: { description: 'Already rated' },
      },
    },
    put: {
      tags: ['Ratings'],
      summary: 'Update my rating',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'resourceId', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                rating: { type: 'integer', minimum: 1, maximum: 5 },
                comment: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Rating updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        401: { description: 'Unauthorized' },
        404: { description: 'Rating not found' },
      },
    },
    delete: {
      tags: ['Ratings'],
      summary: 'Delete my rating',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'resourceId', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Rating removed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        401: { description: 'Unauthorized' },
        404: { description: 'Rating not found' },
      },
    },
  },

  // ──────────────────────────────────────────────
  // DOWNLOADS
  // ──────────────────────────────────────────────
  '/api/downloads/top': {
    get: {
      tags: ['Downloads'],
      summary: 'Get top downloaded resources (public)',
      responses: {
        200: { description: 'Top downloaded resources retrieved' },
      },
    },
  },
  '/api/downloads/{resourceId}': {
    post: {
      tags: ['Downloads'],
      summary: 'Record a download',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'resourceId', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        201: { description: 'Download recorded successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Resource not found' },
      },
    },
  },
  '/api/downloads/history': {
    get: {
      tags: ['Downloads'],
      summary: 'Get my download history',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Download history retrieved' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  // ──────────────────────────────────────────────
  // PROFILE
  // ──────────────────────────────────────────────
  '/api/profile': {
    get: {
      tags: ['Profile'],
      summary: 'Get my profile',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Profile retrieved', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/StudentProfile' } } } } } },
        401: { description: 'Unauthorized' },
      },
    },
    put: {
      tags: ['Profile'],
      summary: 'Update my profile',
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                full_name: { type: 'string' },
                department_id: { type: 'integer' },
                program_id: { type: 'integer' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Profile updated' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/api/profile/change-password': {
    put: {
      tags: ['Profile'],
      summary: 'Change my password',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['currentPassword', 'newPassword'],
              properties: {
                currentPassword: { type: 'string', format: 'password', example: 'currentPass123' },
                newPassword: { type: 'string', format: 'password', example: 'newSecurePass456' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Password changed successfully' },
        400: { description: 'Invalid current password or validation error' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  // ──────────────────────────────────────────────
  // NOTIFICATIONS
  // ──────────────────────────────────────────────
  '/api/notifications': {
    get: {
      tags: ['Notifications'],
      summary: 'Get my notifications',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Notifications retrieved', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } } } } },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/api/notifications/unread-count': {
    get: {
      tags: ['Notifications'],
      summary: 'Get unread notification count',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Unread count retrieved' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/api/notifications/{id}/read': {
    put: {
      tags: ['Notifications'],
      summary: 'Mark a notification as read',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Marked as read' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Notification not found' },
      },
    },
  },
  '/api/notifications/read-all': {
    put: {
      tags: ['Notifications'],
      summary: 'Mark all notifications as read',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'All marked as read' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  // ──────────────────────────────────────────────
  // DASHBOARD
  // ──────────────────────────────────────────────
  '/api/dashboard/student': {
    get: {
      tags: ['Dashboards'],
      summary: 'Get student dashboard',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Student dashboard data' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/api/admin/dashboard': {
    get: {
      tags: ['Admin'],
      summary: 'Get admin dashboard',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Admin dashboard data' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },

  // ──────────────────────────────────────────────
  // ADMIN USER MANAGEMENT
  // ──────────────────────────────────────────────
  '/api/admin/users': {
    get: {
      tags: ['Admin - Users'],
      summary: 'Get all users (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'active', 'suspended', 'disabled'] } },
        { name: 'role', in: 'query', schema: { type: 'string', enum: ['student', 'admin'] } },
      ],
      responses: {
        200: { description: 'Users retrieved' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },
  '/api/admin/users/stats': {
    get: {
      tags: ['Admin - Users'],
      summary: 'Get user statistics (admin only)',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'User statistics' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },
  '/api/admin/users/{id}': {
    get: {
      tags: ['Admin - Users'],
      summary: 'Get single user details (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'User details retrieved' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'User not found' },
      },
    },
    delete: {
      tags: ['Admin - Users'],
      summary: 'Delete a user (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'User deleted' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'User not found' },
      },
    },
  },
  '/api/admin/users/{id}/status': {
    patch: {
      tags: ['Admin - Users'],
      summary: 'Update user account status (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['status'],
              properties: {
                status: { type: 'string', enum: ['pending', 'active', 'suspended', 'disabled'] },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Status updated' },
        400: { description: 'Invalid status' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'User not found' },
      },
    },
  },
  '/api/admin/users/{id}/role': {
    patch: {
      tags: ['Admin - Users'],
      summary: 'Update user role (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['role'],
              properties: {
                role: { type: 'string', enum: ['student', 'admin'] },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Role updated' },
        400: { description: 'Invalid role' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - cannot remove own admin role' },
        404: { description: 'User not found' },
      },
    },
  },

  // ──────────────────────────────────────────────
  // ADMIN ANALYTICS
  // ──────────────────────────────────────────────
  '/api/admin/analytics/dashboard': {
    get: {
      tags: ['Admin - Analytics'],
      summary: 'Get analytics dashboard summary (admin only)',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Analytics dashboard summary' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },
  '/api/admin/analytics/resources': {
    get: {
      tags: ['Admin - Analytics'],
      summary: 'Get resource type statistics (admin only)',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Resource statistics' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' } },
    },
  },
  '/api/admin/analytics/departments': {
    get: {
      tags: ['Admin - Analytics'],
      summary: 'Get department statistics (admin only)',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Department statistics' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' } },
    },
  },
  '/api/admin/analytics/top-downloads': {
    get: {
      tags: ['Admin - Analytics'],
      summary: 'Get top downloaded resources (admin only)',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Top downloads' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' } },
    },
  },
  '/api/admin/analytics/top-rated': {
    get: {
      tags: ['Admin - Analytics'],
      summary: 'Get top rated resources (admin only)',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Top rated resources' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' } },
    },
  },
  '/api/admin/analytics/activity': {
    get: {
      tags: ['Admin - Analytics'],
      summary: 'Get recent activity timeline (admin only)',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Recent activity' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' } },
    },
  },
  '/api/admin/analytics/uploads/monthly': {
    get: {
      tags: ['Admin - Analytics'],
      summary: 'Get monthly upload statistics (admin only)',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Monthly uploads' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' } },
    },
  },
  '/api/admin/analytics/downloads/monthly': {
    get: {
      tags: ['Admin - Analytics'],
      summary: 'Get monthly download statistics (admin only)',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Monthly downloads' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' } },
    },
  },
  '/api/admin/analytics/verifications': {
    get: {
      tags: ['Admin - Analytics'],
      summary: 'Get verification statistics (admin only)',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Verification statistics' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' } },
    },
  },

  // ──────────────────────────────────────────────
  // REPORTS
  // ──────────────────────────────────────────────
  '/api/reports': {
    get: {
      tags: ['Reports'],
      summary: 'Get all reports (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'reviewed', 'resolved'] }, description: 'Filter by status' },
      ],
      responses: {
        200: { description: 'Reports retrieved', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, count: { type: 'integer' }, data: { type: 'array', items: { $ref: '#/components/schemas/Report' } } } } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - admin only' },
      },
    },
    post: {
      tags: ['Reports'],
      summary: 'Create a report (student)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['resource_id', 'reason'],
              properties: {
                resource_id: { type: 'integer', example: 1 },
                reason: { type: 'string', example: 'Inappropriate content' },
                description: { type: 'string', example: 'Additional details about the issue' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Report submitted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string' }, data: { $ref: '#/components/schemas/Report' } } } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - student only' },
      },
    },
  },
  '/api/reports/my': {
    get: {
      tags: ['Reports'],
      summary: 'Get my reports (student only)',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'My reports retrieved', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, count: { type: 'integer' }, data: { type: 'array', items: { $ref: '#/components/schemas/Report' } } } } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - student only' },
      },
    },
  },
  '/api/reports/{id}': {
    get: {
      tags: ['Reports'],
      summary: 'Get report details (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Report details retrieved' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Report not found' },
      },
    },
    delete: {
      tags: ['Reports'],
      summary: 'Delete a report (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Report deleted' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Report not found' },
      },
    },
  },
  '/api/reports/{id}/status': {
    put: {
      tags: ['Reports'],
      summary: 'Update report status (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['status'],
              properties: {
                status: { type: 'string', enum: ['reviewed', 'resolved'] },
                reviewed_by: { type: 'integer', description: 'Reviewer user ID' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Report status updated' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Report not found' },
      },
    },
  },
  '/api/reports/{id}/assign': {
    put: {
      tags: ['Reports'],
      summary: 'Assign a reviewer to a report (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['reviewed_by'],
              properties: {
                reviewed_by: { type: 'integer', example: 2, description: 'Reviewer user ID' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Reviewer assigned successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Report not found' },
      },
    },
  },

  // ──────────────────────────────────────────────
  // ADMIN VERIFICATION MANAGEMENT
  // ──────────────────────────────────────────────
  '/api/admin/verifications': {
    get: {
      tags: ['Admin - Verifications'],
      summary: 'List pending verifications (admin only)',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Pending verifications' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' } },
    },
  },
  '/api/admin/verifications/{id}': {
    get: {
      tags: ['Admin - Verifications'],
      summary: 'Get verification details (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Verification details' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' }, 404: { description: 'Verification not found' } },
    },
  },
  '/api/admin/verifications/{id}/approve': {
    put: {
      tags: ['Admin - Verifications'],
      summary: 'Approve a student verification (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Verification approved' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } },
    },
  },
  '/api/admin/verifications/{id}/reject': {
    put: {
      tags: ['Admin - Verifications'],
      summary: 'Reject a student verification (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                rejection_reason: { type: 'string', example: 'ID card not clearly visible' },
              },
            },
          },
        },
      },
      responses: { 200: { description: 'Verification rejected' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } },
    },
  },

  // ──────────────────────────────────────────────
  // ADMIN RESOURCE MANAGEMENT
  // ──────────────────────────────────────────────
  '/api/admin/resources/pending': {
    get: {
      tags: ['Admin - Resources'],
      summary: 'Get pending resources (admin only)',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Pending resources' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' } },
    },
  },
  '/api/admin/resources/{id}/approve': {
    put: {
      tags: ['Admin - Resources'],
      summary: 'Approve a resource (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Resource approved' }, 400: { description: 'Already processed' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' }, 404: { description: 'Resource not found' } },
    },
  },
  '/api/admin/resources/{id}/reject': {
    put: {
      tags: ['Admin - Resources'],
      summary: 'Reject a resource (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                rejection_reason: { type: 'string', example: 'Duplicate content' },
              },
            },
          },
        },
      },
      responses: { 200: { description: 'Resource rejected' }, 400: { description: 'Already processed' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' }, 404: { description: 'Resource not found' } },
    },
  },

  // ──────────────────────────────────────────────
  // FILE SERVING
  // ──────────────────────────────────────────────
  '/api/files/{filename}': {
    get: {
      tags: ['Files'],
      summary: 'Download a resource file by filename (authenticated)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'filename', in: 'path', required: true, schema: { type: 'string' }, description: 'Filename of the resource to download' }],
      responses: {
        200: { description: 'File downloaded successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Access denied - directory traversal attempt' },
        404: { description: 'File not found' },
      },
    },
  },

  // ──────────────────────────────────────────────
  // HEALTH CHECK
  // ──────────────────────────────────────────────
  '/api/health': {
    get: {
      tags: ['System'],
      summary: 'Health check endpoint',
      responses: {
        200: { description: 'API is running', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'WolloShare API is running' } } } } } },
      },
    },
  },
};

options.definition.paths = manualPaths;

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
