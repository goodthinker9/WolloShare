import bookmarkModel from '../models/bookmarkModel.js';

// ──────────────────────────────────────────────
// POST /api/bookmarks/:resourceId  — Add bookmark
// ──────────────────────────────────────────────

const addBookmark = async (req, res, next) => {
  try {
    const resourceId = Number(req.params.resourceId);
    const userId = req.user.id;

    // Check resource exists
    const resource = await bookmarkModel.findResourceById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Check if already bookmarked
    const existingBookmark = await bookmarkModel.findByResourceAndUser(resourceId, userId);

    if (existingBookmark) {
      return res.status(409).json({
        success: false,
        message: 'Resource already bookmarked',
      });
    }

    // Insert bookmark
    await bookmarkModel.create(resourceId, userId);

    res.status(201).json({
      success: true,
      message: 'Bookmarked successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// DELETE /api/bookmarks/:resourceId  — Remove bookmark
// ──────────────────────────────────────────────

const removeBookmark = async (req, res, next) => {
  try {
    const resourceId = Number(req.params.resourceId);
    const userId = req.user.id;

    await bookmarkModel.remove(resourceId, userId);

    res.status(200).json({
      success: true,
      message: 'Bookmark removed',
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/bookmarks  — Get my bookmarks
// ──────────────────────────────────────────────

const getMyBookmarks = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const bookmarks = await bookmarkModel.findUserBookmarks(userId);

    res.status(200).json({
      success: true,
      data: bookmarks,
    });
  } catch (error) {
    next(error);
  }
};

export {
  addBookmark,
  removeBookmark,
  getMyBookmarks,
};

