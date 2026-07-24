import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  addRating,
  updateRating,
  deleteRating,
  getResourceRatings,
  getAverageRating,
} from '../controllers/ratingController.js';

const router = Router();

// ── Public routes (no auth required) ───────────────────────────────

// GET /api/ratings/resource/:resourceId  — Get ratings for a resource
router.get('/resource/:resourceId', getResourceRatings);

// GET /api/ratings/resource/:resourceId/average  — Get average rating
router.get('/resource/:resourceId/average', getAverageRating);

// ── Authenticated routes ──────────────────────────────────────────

// POST /api/ratings/:resourceId  — Add a rating
router.post('/:resourceId', authMiddleware, addRating);

// PUT /api/ratings/:resourceId  — Update my rating
router.put('/:resourceId', authMiddleware, updateRating);

// DELETE /api/ratings/:resourceId  — Delete my rating
router.delete('/:resourceId', authMiddleware, deleteRating);

export default router;

