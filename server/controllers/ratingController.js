import ratingModel from '../models/ratingModel.js';

// ──────────────────────────────────────────────
// POST /api/ratings/:resourceId  — Add rating
// ──────────────────────────────────────────────

const addRating = async (req, res, next) => {
  try {
    const resourceId = Number(req.params.resourceId);
    const userId = req.user.id;
    const { rating, comment } = req.body;

    // Validate rating is an integer between 1 and 5
    const parsedRating = Number(rating);

    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5',
      });
    }

    // Check resource exists
    const resource = await ratingModel.findResourceById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Check if already rated
    const existingRating = await ratingModel.findByResourceAndUser(resourceId, userId);

    if (existingRating) {
      return res.status(409).json({
        success: false,
        message: 'You have already rated this resource.',
      });
    }

    // Create rating
    await ratingModel.create(resourceId, userId, parsedRating, comment || null);

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/ratings/:resourceId  — Update my rating
// ──────────────────────────────────────────────

const updateRating = async (req, res, next) => {
  try {
    const resourceId = Number(req.params.resourceId);
    const userId = req.user.id;
    const { rating, comment } = req.body;

    // Validate rating is an integer between 1 and 5 if provided
    if (rating !== undefined) {
      const parsedRating = Number(rating);

      if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5',
        });
      }
    }

    // Find the existing rating for this user and resource
    const existingRating = await ratingModel.findByResourceAndUser(resourceId, userId);

    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found',
      });
    }

    // Update with provided values, fall back to existing
    const updatedRating = rating !== undefined ? Number(rating) : existingRating.rating;
    const updatedComment = comment !== undefined ? comment : existingRating.comment;

    await ratingModel.update(existingRating.id, updatedRating, updatedComment);

    res.status(200).json({
      success: true,
      message: 'Rating updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// DELETE /api/ratings/:resourceId  — Delete my rating
// ──────────────────────────────────────────────

const deleteRating = async (req, res, next) => {
  try {
    const resourceId = Number(req.params.resourceId);
    const userId = req.user.id;

    // Find the existing rating for this user and resource
    const existingRating = await ratingModel.findByResourceAndUser(resourceId, userId);

    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found',
      });
    }

    await ratingModel.remove(existingRating.id);

    res.status(200).json({
      success: true,
      message: 'Rating removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/ratings/resource/:resourceId  — Get ratings for a resource
// ──────────────────────────────────────────────

const getResourceRatings = async (req, res, next) => {
  try {
    const resourceId = Number(req.params.resourceId);

    // Check resource exists
    const resource = await ratingModel.findResourceById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    const ratings = await ratingModel.findByResource(resourceId);

    res.status(200).json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/ratings/resource/:resourceId/average  — Get average rating
// ──────────────────────────────────────────────

const getAverageRating = async (req, res, next) => {
  try {
    const resourceId = Number(req.params.resourceId);

    // Check resource exists
    const resource = await ratingModel.findResourceById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    const stats = await ratingModel.getAverageRating(resourceId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export {
  addRating,
  updateRating,
  deleteRating,
  getResourceRatings,
  getAverageRating,
};

