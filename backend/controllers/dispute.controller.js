import Dispute from '../models/Dispute.model.js';
import Property from '../models/Property.model.js';
import User from '../models/User.model.js';
import { validationResult } from 'express-validator';
import { createAndDispatchNotification } from './notification.controller.js';
import { createActivity } from './activity.helper.js';
import { sendEmail } from '../services/emailService.js';
import { disputeTemplate } from '../utils/emailTemplates.js';

// @desc    Create dispute
// @route   POST /api/disputes
// @access  Private
export const createDispute = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { propertyId, title, description, category, priority } = req.body;

    // Verify property exists
    const property = await Property.findById(propertyId)
      .populate('ownerId')
      .populate('tenantId');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Determine againstUser based on who created the dispute
    let againstUser;
    if (req.user.role === 'TENANT') {
      // Tenant can only create disputes against the property owner
      const tenantId = property.tenantId?._id?.toString() || property.tenantId?.toString();
      if (tenantId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only create disputes for properties you are assigned to'
        });
      }
      againstUser = property.ownerId._id || property.ownerId;
    } else if (req.user.role === 'OWNER') {
      // Owner can create disputes against the tenant
      const ownerId = property.ownerId._id?.toString() || property.ownerId.toString();
      if (ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only create disputes for your own properties'
        });
      }
      if (!property.tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Property has no tenant assigned'
        });
      }
      againstUser = property.tenantId._id || property.tenantId;
    } else {
      // Admin can create disputes but need to specify againstUser
      return res.status(400).json({
        success: false,
        message: 'Admin must specify againstUser when creating disputes'
      });
    }

    // Create dispute
    const dispute = await Dispute.create({
      propertyId,
      createdBy: req.user.id,
      againstUser,
      title,
      description,
      category,
      priority: priority || 'MEDIUM'
    });

    // Populate the dispute with user and property details
    const populatedDispute = await Dispute.findById(dispute._id)
      .populate('propertyId', 'address city state')
      .populate('createdBy', 'name email role')
      .populate('againstUser', 'name email role')
      .populate('statusHistory.changedBy', 'name email');

    // Activity: dispute created
    await createActivity({
      disputeId: dispute._id,
      userId: req.user.id,
      type: 'CREATED',
      description: `${req.user.name} created the dispute`,
      metadata: {
        title,
        category,
        priority: priority || 'MEDIUM'
      }
    });

    try {
      await createAndDispatchNotification({
        userId: againstUser.toString(),
        disputeId: dispute._id,
        type: 'DISPUTE_CREATED',
        title: 'New dispute created',
        message: `${req.user.name} opened a dispute: ${title}`,
        metadata: {
          propertyId: propertyId.toString(),
          createdBy: req.user.id
        }
      });
    } catch (notifyErr) {
      console.error('Notification error (createDispute):', notifyErr?.message || notifyErr);
    }

    // Send dispute created emails to both owner and tenant
    try {
      const owner = await User.findById(property.ownerId._id || property.ownerId).select('email');
      const tenant = property.tenantId ? await User.findById(property.tenantId._id || property.tenantId).select('email') : null;
      
      const recipients = [];
      if (owner?.email) recipients.push({ email: owner.email, userId: property.ownerId._id || property.ownerId });
      if (tenant?.email) recipients.push({ email: tenant.email, userId: property.tenantId._id || property.tenantId });
      
      // Send email to all recipients
      for (const recipient of recipients) {
        try {
          await sendEmail({
            to: recipient.email,
            subject: 'New Dispute Created - OwnTen',
            html: disputeTemplate(title)
          });
          console.log(`Dispute created email sent to ${recipient.email}`);
        } catch (emailErr) {
          console.error(`Failed to send dispute email to ${recipient.email}:`, emailErr.message);
        }
      }
    } catch (emailError) {
      console.error('Failed to send dispute created emails:', emailError.message);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Dispute created successfully',
      data: { dispute: populatedDispute }
    });
  } catch (error) {
    next(error);
  }
};

// export const getDisputes = async (req, res, next) => {
//   try {
//     const userId = req.user.id;
//     const role = req.user.role;

//     let query = { isArchived: { $ne: true } };

//     // ADMIN → see all
//     if (role === 'ADMIN') {
//       // no extra filter
//     }

//     // OWNER & TENANT → see disputes where they are involved
//     if (role === 'OWNER' || role === 'TENANT') {
//       query.$or = [
//         { createdBy: userId },
//         { againstUser: userId }
//       ];
//     }

//     const disputes = await Dispute.find(query)
//       .populate('propertyId', 'address city state')
//       .populate('createdBy', 'name email role')
//       .populate('againstUser', 'name email role')
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: disputes.length,
//       data: { disputes }
//     });

//   } catch (err) {
//     next(err);
//   }
// };



export const getDisputes = async (req, res, next) => {
  try {
    const userId = req.user.id
    const role = req.user.role

    let propertyFilter = {}

    // ADMIN sees all
    if (role === 'ADMIN') {
      const disputes = await Dispute.find({ isArchived: { $ne: true } })
        .populate('propertyId', 'address city state ownerId tenantId')
        .populate('createdBy', 'name email role')
        .populate('againstUser', 'name email role')
        .sort({ createdAt: -1 })

      return res.json({
        success: true,
        count: disputes.length,
        data: { disputes }
      })
    }

    // OWNER → only properties he owns AND still have tenant
    if (role === 'OWNER') {
      propertyFilter = {
        ownerId: userId,
        tenantId: { $ne: null } // 🔥 IMPORTANT
      }
    }

    // TENANT → only properties he is CURRENT tenant of
    if (role === 'TENANT') {
      propertyFilter = {
        tenantId: userId
      }
    }

    // Find current active properties
    const properties = await Property.find(propertyFilter).select('_id')
    const propertyIds = properties.map(p => p._id)

    // If no active properties → return empty
    if (propertyIds.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: { disputes: [] }
      })
    }

    // Now fetch disputes ONLY linked to active properties
    const disputes = await Dispute.find({
      propertyId: { $in: propertyIds },
      isArchived: { $ne: true }
    })
      .populate('propertyId', 'address city state')
      .populate('createdBy', 'name email role')
      .populate('againstUser', 'name email role')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: disputes.length,
      data: { disputes }
    })

  } catch (err) {
    next(err)
  }
}


export const getDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('propertyId')
      .populate('createdBy', 'name email role')
      .populate('againstUser', 'name email role')
      .populate('statusHistory.changedBy', 'name email');

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    const property = await Property.findById(dispute.propertyId);

    const isOwner =
      property?.ownerId?.toString() === req.user.id;

    const isTenant =
      property?.tenantId &&
      property.tenantId.toString() === req.user.id;

    const isCreator =
      dispute.createdBy?._id?.toString() === req.user.id ||
      dispute.createdBy?.toString() === req.user.id;

    const isAgainst =
      dispute.againstUser?._id?.toString() === req.user.id ||
      dispute.againstUser?.toString() === req.user.id;

    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isTenant && !isCreator && !isAgainst && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: { dispute }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get dispute activity timeline
// @route   GET /api/disputes/:id/timeline
// @access  Private (participants, property owner, admin)
export const getDisputeTimeline = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .select('propertyId createdBy againstUser')
      .populate('createdBy', 'name email role')
      .populate('againstUser', 'name email role');

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Authorization: reuse same rules as getDispute
    const isCreator = dispute.createdBy._id.toString() === req.user.id;
    const isAgainst = dispute.againstUser._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    let isPropertyOwner = false;
    if (req.user.role === 'OWNER') {
      const property = await Property.findById(dispute.propertyId).select('ownerId');
      isPropertyOwner = property?.ownerId.toString() === req.user.id;
    }

    if (!isCreator && !isAgainst && !isAdmin && !isPropertyOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this timeline'
      });
    }

    const Activity = (await import('../models/Activity.model.js')).default;

    const activities = await Activity.find({ disputeId: dispute._id })
      .populate('userId', 'name email role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: { activities }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update dispute status
// @route   PATCH /api/disputes/:id/status
// @access  Private (Owner/Admin only)
export const updateDisputeStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, note } = req.body;

    const dispute = await Dispute.findById(req.params.id)
      .populate('propertyId');

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Check authorization
    const isAdmin = req.user.role === 'ADMIN';
    // Handle both populated and non-populated property
    let propertyOwnerId;
    if (dispute.propertyId.ownerId && typeof dispute.propertyId.ownerId === 'object') {
      propertyOwnerId = dispute.propertyId.ownerId._id?.toString() || dispute.propertyId.ownerId.toString();
    } else {
      // Property might not be populated, fetch it
      const property = await Property.findById(dispute.propertyId);
      propertyOwnerId = property?.ownerId.toString();
    }
    const isPropertyOwner = propertyOwnerId === req.user.id;

    if (!isAdmin && !isPropertyOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update dispute status'
      });
    }

    // Check if status is valid
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Update status and add to history
    const oldStatus = dispute.status;
    dispute.status = status;
    dispute.statusHistory.push({
      status,
      changedBy: req.user.id,
      changedAt: new Date(),
      note: note || ''
    });

    await dispute.save();

    // Populate the updated dispute
    const updatedDispute = await Dispute.findById(dispute._id)
      .populate('propertyId', 'address city state')
      .populate('createdBy', 'name email role')
      .populate('againstUser', 'name email role')
      .populate('statusHistory.changedBy', 'name email');

    // Activity: status changed
    await createActivity({
      disputeId: dispute._id,
      userId: req.user.id,
      type: status === 'RESOLVED' ? 'RESOLVED' : 'STATUS_CHANGED',
      description:
        status === 'RESOLVED'
          ? `${req.user.name} marked the dispute as resolved`
          : `${req.user.name} changed status from ${oldStatus} to ${status}`,
      metadata: {
        previousStatus: oldStatus,
        newStatus: status,
        note: note || ''
      }
    });

    try {
      const recipients = [
        updatedDispute.createdBy?._id?.toString(),
        updatedDispute.againstUser?._id?.toString()
      ].filter(id => id && id !== req.user.id);

      for (const userId of recipients) {
        await createAndDispatchNotification({
          userId,
          disputeId: updatedDispute._id,
          type: 'STATUS_UPDATED',
          title: 'Dispute status updated',
          message: `${req.user.name} changed status to ${status}`,
          metadata: {
            previousStatus: oldStatus,
            newStatus: status,
            note
          }
        });
      }
    } catch (notifyErr) {
      console.error('Notification error (updateDisputeStatus):', notifyErr?.message || notifyErr);
    }

    res.status(200).json({
      success: true,
      message: `Dispute status updated from ${oldStatus} to ${status}`,
      data: { dispute: updatedDispute }
    });
  } catch (error) {
    next(error);
  }
};

