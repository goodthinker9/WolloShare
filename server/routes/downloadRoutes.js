import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  recordDownload,
  getMyDownloadHistory,
  getTopDownloaded,
} from '../controllers/downloadController.js';

const router = Router();

// ── Public route ───────────────────────────────────────────────────

// GET /api/downloads/top  — Top 10 downloaded resources
router.get('/top', getTopDownloaded);

// ── Authenticated routes ──────────────────────────────────────────

// POST /api/downloads/:resourceId  — Record a download
router.post('/:resourceId', authMiddleware, recordDownload);

// GET /api/downloads/history  — My download history
router.get('/history', authMiddleware, getMyDownloadHistory);

export default router;

