import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Storage destinations by field name ────────────────────────────

const resourceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const dir = path.resolve(__dirname, `../uploads/resources/${year}/${month}`);

    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

const idCardStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const dir = path.resolve(__dirname, `../uploads/id-cards/${year}/${month}`);

    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

// ── File filters ──────────────────────────────────────────────────

const resourceFileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];

  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension) || !allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX'));
  }

  cb(null, true);
};

const idCardFileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension) || !allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Allowed: JPG, JPEG, PNG'));
  }

  cb(null, true);
};

// ── Multer instances with env-based size limits ───────────────────

const maxResourceSize = process.env.MAX_RESOURCE_SIZE
  ? Number(process.env.MAX_RESOURCE_SIZE)
  : 10 * 1024 * 1024; // 10 MB default

const maxIdCardSize = process.env.MAX_ID_CARD_SIZE
  ? Number(process.env.MAX_ID_CARD_SIZE)
  : 5 * 1024 * 1024; // 5 MB default

const uploadResource = multer({
  storage: resourceStorage,
  limits: { fileSize: maxResourceSize },
  fileFilter: resourceFileFilter,
});

const uploadIdCard = multer({
  storage: idCardStorage,
  limits: { fileSize: maxIdCardSize },
  fileFilter: idCardFileFilter,
});

// ── Middleware wrappers with proper error handling ─────────────────

const uploadResourceFile = (req, res, next) => {
  uploadResource.single('file')(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      let message = 'File upload failed';

      if (error.code === 'LIMIT_FILE_SIZE') {
        message = 'File size exceeds maximum limit';
      } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        message = 'Unexpected file field';
      }

      return res.status(400).json({ success: false, message });
    }

    if (error) {
      return res.status(400).json({ success: false, message: error.message || 'File upload failed' });
    }

    next();
  });
};

const uploadIdCardImage = (req, res, next) => {
  uploadIdCard.single('university_id_image')(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      let message = 'Image upload failed';

      if (error.code === 'LIMIT_FILE_SIZE') {
        message = 'File size exceeds maximum limit';
      } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        message = 'Unexpected file field';
      }

      return res.status(400).json({ success: false, message });
    }

    if (error) {
      return res.status(400).json({ success: false, message: error.message || 'Image upload failed' });
    }

    next();
  });
};

export { uploadResourceFile, uploadIdCardImage };
export default uploadResourceFile;

