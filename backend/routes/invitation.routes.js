import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { createInvitation, joinWithToken, getMyInvitations, acceptInvitation, rejectInvitation } from '../controllers/invitation.controller.js';
import { authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Owner creates invitation
router.post('/create', authorize('OWNER', 'ADMIN'), createInvitation);

// Tenant joins via token
router.post('/join', authorize('TENANT'), joinWithToken);

// Tenant inbox
router.get('/my', authorize('TENANT'), getMyInvitations);

// Tenant accept / reject
router.post('/:id/accept', authorize('TENANT'), acceptInvitation);
router.post('/:id/reject', authorize('TENANT'), rejectInvitation);

export default router;
