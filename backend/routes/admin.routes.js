import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/adminOnly.middleware.js';
import {
  adminStats,
  getUsersAdmin,
  updateUserStatusAdmin,
  getDisputesAdmin,
  forceDisputeStatusAdmin
} from '../controllers/admin.controller.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/stats', adminStats);

// User management
router.get('/users', getUsersAdmin);
router.put('/users/:id/status', updateUserStatusAdmin);

// Dispute moderation
router.get('/disputes', getDisputesAdmin);
router.put('/disputes/:id/force-status', forceDisputeStatusAdmin);

export default router;
