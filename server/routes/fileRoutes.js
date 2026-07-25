import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authMiddleware from '../middleware/authMiddleware.js';
import { checkFileExists } from '../utils/fileUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// GET /files/:filename — Secure file download (authenticated users only)
router.get('/:filename', authMiddleware, (req, res, next) => {
  try {
    const { filename } = req.params;

    // Prevent directory traversal attacks
    const sanitized = path.basename(filename);
    const filePath = path.resolve(__dirname, '../uploads/resources', sanitized);

    // Ensure the resolved path stays within the uploads directory
    const uploadsDir = path.resolve(__dirname, '../uploads/resources');
    if (!filePath.startsWith(uploadsDir)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Check if file exists
    if (!checkFileExists(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    res.download(filePath, sanitized);
  } catch (error) {
    next(error);
  }
});

export default router;
