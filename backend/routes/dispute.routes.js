import express from 'express';
import { body } from 'express-validator';
import {
  createDispute,
  getDisputes,
  getDispute,
  updateDisputeStatus,
  getDisputeTimeline
} from '../controllers/dispute.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation rules
const createDisputeValidation = [
  body('propertyId')
    .notEmpty().withMessage('Property ID is required')
    .isMongoId().withMessage('Invalid property ID'),
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('category')
    .isIn(['MAINTENANCE', 'PAYMENT', 'BEHAVIOR', 'LEASE_VIOLATION', 'OTHER'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority')
];

const updateStatusValidation = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED'])
    .withMessage('Invalid status'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Note cannot exceed 500 characters')
];

// All routes require authentication
router.use(protect);

// Routes
router.post('/', createDisputeValidation, createDispute);
router.get('/', getDisputes);
router.get('/:id', getDispute);
router.get('/:id/timeline', getDisputeTimeline);
router.patch('/:id/status', authorize('OWNER', 'ADMIN'), updateStatusValidation, updateDisputeStatus);

export default router;

