import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads/id-cards');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
const allowedExtensions = ['.jpg', '.jpeg', '.png'];

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(extension)) {
    return cb(new Error('Only JPG, JPEG, and PNG image files are allowed'));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const uploadVerificationImage = (req, res, next) => {
  upload.single('university_id_image')(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      let message = 'Image upload failed';

      if (error.code === 'LIMIT_FILE_SIZE') {
        message = 'Image size must be 5 MB or less';
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

export { uploadDir, uploadVerificationImage };
export default uploadVerificationImage;
