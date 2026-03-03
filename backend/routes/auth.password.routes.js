import express from 'express';
import { body } from 'express-validator';
import { forgotPassword, resetPassword } from '../controllers/auth.password.controller.js';

const router = express.Router();

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  forgotPassword
);

// POST /api/auth/reset-password/:token
router.post(
  '/reset-password/:token',
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  resetPassword
);

export default router;

