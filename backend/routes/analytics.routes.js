import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { getOwnerAnalytics, getAdminAnalytics } from '../controllers/analytics.controller.js';

const router = express.Router();

router.use(protect);

router.get('/owner', authorize('OWNER', 'ADMIN'), getOwnerAnalytics);
router.get('/admin', authorize('ADMIN'), getAdminAnalytics);

export default router;

