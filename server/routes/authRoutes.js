import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';
import { validateRegister, validateLogin, handleValidationErrors } from '../validators/authValidator.js';

const router = Router();

router.post('/register', uploadMiddleware, validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);

export default router;
