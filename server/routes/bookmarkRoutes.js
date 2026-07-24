import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  addBookmark,
  removeBookmark,
  getMyBookmarks,
} from '../controllers/bookmarkController.js';

const router = Router();

// All bookmark routes require authentication
router.use(authMiddleware);

// POST /api/bookmarks/:resourceId  — Add a bookmark
router.post('/:resourceId', addBookmark);

// DELETE /api/bookmarks/:resourceId  — Remove a bookmark
router.delete('/:resourceId', removeBookmark);

// GET /api/bookmarks  — Get all bookmarks for the logged-in user
router.get('/', getMyBookmarks);

export default router;

