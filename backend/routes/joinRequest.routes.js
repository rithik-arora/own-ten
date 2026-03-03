import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  createJoinRequest,
  getMyJoinRequests,
  getPropertyJoinRequests,
  approveJoinRequest,
  rejectJoinRequest
} from '../controllers/joinRequest.controller.js';

const router = express.Router();

router.use(protect);

// Tenant
router.post('/:propertyId', authorize('TENANT'), createJoinRequest);
router.get('/my', authorize('TENANT'), getMyJoinRequests);

// Owner/Admin
router.get('/property/:propertyId', authorize('OWNER', 'ADMIN'), getPropertyJoinRequests);
router.post('/:requestId/approve', authorize('OWNER', 'ADMIN'), approveJoinRequest);
router.post('/:requestId/reject', authorize('OWNER', 'ADMIN'), rejectJoinRequest);

export default router;

