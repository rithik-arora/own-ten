import express from 'express';
import { getMessages } from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.get('/dispute/:disputeId', getMessages);

export default router;

