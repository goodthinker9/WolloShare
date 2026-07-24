import downloadModel from '../models/downloadModel.js';

// ──────────────────────────────────────────────
// POST /api/downloads/:resourceId  — Record a download
// ──────────────────────────────────────────────

const recordDownload = async (req, res, next) => {
  try {
    const resourceId = Number(req.params.resourceId);
    const userId = req.user.id;

    // Verify resource exists
    const resource = await downloadModel.findResourceById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Record the download
    await downloadModel.create(resourceId, userId);

    res.status(201).json({
      success: true,
      message: 'Download recorded successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/downloads/history  — My download history
// ──────────────────────────────────────────────

const getMyDownloadHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const downloads = await downloadModel.findByUser(userId);

    res.status(200).json({
      success: true,
      data: downloads,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/downloads/top  — Top 10 downloaded resources
// ──────────────────────────────────────────────

const getTopDownloaded = async (req, res, next) => {
  try {
    const top = await downloadModel.getTopDownloaded();

    res.status(200).json({
      success: true,
      data: top,
    });
  } catch (error) {
    next(error);
  }
};

export {
  recordDownload,
  getMyDownloadHistory,
  getTopDownloaded,
};

