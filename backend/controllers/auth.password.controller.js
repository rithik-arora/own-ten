import crypto from 'crypto';
import { validationResult } from 'express-validator';
import User from '../models/User.model.js';
import { sendEmail } from '../services/emailService.js';

const buildClientUrl = () => {
  return process.env.CLIENT_URL || 'http://localhost:5173';
};

/**
 * POST /api/auth/forgot-password
 * Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Still return generic message to avoid email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.'
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      try {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
          .createHash('sha256')
          .update(resetToken)
          .digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await user.save({ validateBeforeSave: false });

        const resetUrl = `${buildClientUrl()}/reset-password/${resetToken}`;

        const html = `
          <p>You requested a password reset for your OwnTen account.</p>
          <p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
          <p><a href="${resetUrl}" target="_blank" rel="noopener noreferrer">${resetUrl}</a></p>
          <p>If you did not request this, you can safely ignore this email.</p>
        `;

        await sendEmail({
          to: user.email,
          subject: 'OwnTen Password Reset',
          html
        });
      } catch (emailError) {
        console.error('Forgot password email error:', emailError?.message || emailError);
        // Best-effort clean-up of token fields on failure
        try {
          user.resetPasswordToken = undefined;
          user.resetPasswordExpire = undefined;
          await user.save({ validateBeforeSave: false });
        } catch (cleanupError) {
          console.error('Failed to cleanup reset token after email error:', cleanupError?.message || cleanupError);
        }
      }
    }

    // Always respond with success to avoid leaking which emails exist
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password/:token
 * Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

