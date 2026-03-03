import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Property from '../models/Property.model.js';
import Dispute from '../models/Dispute.model.js';
import AdminAction from '../models/AdminAction.model.js';
import { createActivity } from './activity.helper.js';

const parsePagination = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const adminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalProperties, totalDisputes, openDisputes] = await Promise.all([
      User.countDocuments({}),
      Property.countDocuments({}),
      Dispute.countDocuments({}),
      Dispute.countDocuments({ status: 'OPEN' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProperties,
        totalDisputes,
        openDisputes
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUsersAdmin = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const { role } = req.query;

    const query = {};
    if (role) {
      if (!['OWNER', 'TENANT', 'ADMIN'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role filter' });
      }
      query.role = role;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be boolean' });
    }

    // Safety: prevent admin from blocking themselves
    if (req.user.id === id) {
      return res.status(400).json({ success: false, message: 'You cannot change your own status' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const previousStatus = user.isActive;
    user.isActive = isActive;
    await user.save();

    const actionType = isActive ? 'UNBLOCK_USER' : 'BLOCK_USER';

    await AdminAction.create({
      adminId: req.user.id,
      actionType,
      targetType: 'USER',
      targetId: user._id,
      meta: {
        previousIsActive: previousStatus,
        newIsActive: isActive,
        targetRole: user.role,
        targetEmail: user.email
      }
    });

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'unblocked' : 'blocked'} successfully`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const getDisputesAdmin = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const { status } = req.query;

    const query = {};
    if (status) {
      if (!['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status filter' });
      }
      query.status = status;
    }

    const [disputes, total] = await Promise.all([
      Dispute.find(query)
        .populate('propertyId', 'address city state')
        .populate('createdBy', 'name email role')
        .populate('againstUser', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Dispute.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        disputes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const forceDisputeStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid dispute id' });
    }

    if (!['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    if (!note || typeof note !== 'string' || note.trim().length < 3 || note.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'note is required (3-500 characters) for admin override'
      });
    }

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    const oldStatus = dispute.status;
    dispute.status = status;
    dispute.statusHistory.push({
      status,
      changedBy: req.user.id,
      changedAt: new Date(),
      note: `ADMIN OVERRIDE: ${note.trim()}`
    });
    await dispute.save();

    await AdminAction.create({
      adminId: req.user.id,
      actionType: 'FORCE_STATUS',
      targetType: 'DISPUTE',
      targetId: dispute._id,
      meta: {
        previousStatus: oldStatus,
        newStatus: status,
        note: note.trim()
      }
    });

    const populated = await Dispute.findById(dispute._id)
      .populate('propertyId', 'address city state')
      .populate('createdBy', 'name email role')
      .populate('againstUser', 'name email role')
      .populate('statusHistory.changedBy', 'name email role');

    res.status(200).json({
      success: true,
      message: `Dispute status forced from ${oldStatus} to ${status}`,
      data: { dispute: populated }
    });

    // Activity: admin forced status
    await createActivity({
      disputeId: dispute._id,
      userId: req.user.id,
      type: status === 'RESOLVED' ? 'RESOLVED' : 'STATUS_CHANGED',
      description: `Admin forced status from ${oldStatus} to ${status}`,
      metadata: {
        previousStatus: oldStatus,
        newStatus: status,
        note: note.trim(),
        adminOverride: true
      }
    });
  } catch (error) {
    next(error);
  }
};

