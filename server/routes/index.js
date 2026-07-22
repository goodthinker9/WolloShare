import { Router } from 'express';

const router = Router();

// Health check endpoint for deployment and monitoring.
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WolloShare API is running',
  });
});

// Placeholder route group definitions for future modules.
const futureModulePlaceholder = (req, res) => {
  res.status(501).json({
    success: false,
    message: 'This module will be implemented in a future phase.',
  });
};

router.use('/auth', futureModulePlaceholder);
router.use('/students/verification', futureModulePlaceholder);
router.use('/resources', futureModulePlaceholder);
router.use('/admin', futureModulePlaceholder);

export default router;
