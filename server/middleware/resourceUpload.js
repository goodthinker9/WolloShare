import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads/resources');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/png',
]);

const allowedExtensions = new Set(['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.jpg', '.jpeg', '.png']);

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
    return cb(new Error('Unsupported file type. Allowed types: PDF, DOC, DOCX, PPT, PPTX, ZIP, JPG, and PNG'));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter,
});

const uploadResourceFile = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      let message = 'File upload failed';

      if (error.code === 'LIMIT_FILE_SIZE') {
        message = 'File size must be 25 MB or less';
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

export { uploadDir, uploadResourceFile };
export default uploadResourceFile;
