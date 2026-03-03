import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/notification.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllNotificationsRead);

export default router;
