import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  createOrder,
  verifyPayment,
  getMyPayments,
  getOwnerEarnings
} from '../controllers/payment.controller.js';

const router = express.Router();

router.use(protect);

router.post('/create-order', authorize('TENANT'), createOrder);
router.post('/verify', authorize('TENANT'), verifyPayment);
router.get('/my', authorize('TENANT'), getMyPayments);
router.get('/owner', authorize('OWNER', 'ADMIN'), getOwnerEarnings);

export default router;

