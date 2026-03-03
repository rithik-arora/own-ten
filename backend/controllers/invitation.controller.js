import mongoose from 'mongoose';
import Invitation from '../models/Invitation.model.js';
import Property from '../models/Property.model.js';
import User from '../models/User.model.js';
import { createAndDispatchNotification } from './notification.controller.js';
import { getIO } from '../config/socket.js';
import { invalidatePropertyCache } from '../middleware/cache.middleware.js';
import { sendEmail } from '../services/emailService.js';
import { inviteTemplate } from '../utils/emailTemplates.js';

const INVITE_TTL_DAYS = 7;

/*Helpers*/

const ensureOwner = (req, res, property) => {
  if (property.ownerId.toString() !== req.user.id) {
    res.status(403).json({
      success: false,
      message: 'Not authorized for this property'
    });
    return false;
  }
  return true;
};

const emitSocket = (userId, event, payload) => {
  const io = getIO();
  if (io) {
    io.to(`user_${userId}`).emit(event, payload);
  }
};

/*CREATE INVITATION (OWNER) */

export const createInvitation = async (req, res, next) => {
  try {
    console.log("REQ PARAMS",req.params);
    console.log("REQ BODY",req.body);
    
    

    // ✅ MUST COME FROM ROUTE PARAM
    const propertyId = req.params.id;
    const { email, tenantId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Property id missing'
      });
    }

    const property = await Property.findById(propertyId)
      .select('ownerId tenantId address');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (!ensureOwner(req, res, property)) return;

    if (property.tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Property already has a tenant'
      });
    }

    // Optional direct tenant invite
    let targetTenantId = null;

    if (tenantId) {
      const tenantUser = await User.findById(tenantId);

      if (!tenantUser) {
        return res.status(404).json({
          success: false,
          message: 'Tenant user not found'
        });
      }

      if (tenantUser.role !== 'TENANT') {
        return res.status(400).json({
          success: false,
          message: 'Target user must be TENANT role'
        });
      }

      targetTenantId = tenantUser._id;
    }

    // Generate secure token
    const token = Invitation.generateToken();

    const expiresAt = new Date(
      Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000
    );

    // Create DB record
    const invitation = await Invitation.create({
      propertyId,
      ownerId: req.user.id,
      tenantId: targetTenantId,
      email: email || null,
      token,
      expiresAt
    });

    const inviteLink =
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite/${token}`;

    // Notify tenant (if direct invite)
    if (targetTenantId) {

      await createAndDispatchNotification({
        userId: targetTenantId.toString(),
        disputeId: null,
        type: 'INVITATION_SENT',
        title: 'Property Invitation',
        message: `You have been invited to join property ${property.address}`,
        metadata: {
          propertyId,
          invitationId: invitation._id
        }
      });

      emitSocket(targetTenantId.toString(), 'invitation_sent', {
        invitationId: invitation._id
      });
    }

    // Send email invitation
    try {
      const recipientEmail = email || (targetTenantId ? (await User.findById(targetTenantId))?.email : null);
      
      if (recipientEmail) {
        await sendEmail({
          to: recipientEmail,
          subject: 'Property Invitation - OwnTen',
          html: inviteTemplate(inviteLink)
        });
        console.log(`Invitation email sent to ${recipientEmail}`);
      }
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError.message);
      // Don't fail the request if email fails
    }

    try {
      // Invalidate property-related cache when invitations change tenant assignments
      await invalidatePropertyCache();
    } catch (cacheErr) {
      console.error('Property cache invalidation error (createInvitation):', cacheErr?.message || cacheErr);
    }

    res.status(201).json({
      success: true,
      message: 'Invitation created successfully',
      data: {
        invitation,
        inviteLink
      }
    });

  } catch (error) {
    console.error('CREATE INVITATION ERROR:', error);
    next(error);
  }
};

/* VALIDATE TOKEN*/

const validateTokenAndInvitation = async ({ token, userId }) => {

  const invitation = await Invitation.findOne({ token });

  if (!invitation) return { error: 'Invalid invite token' };

  if (invitation.status !== 'PENDING')
    return { error: 'Invitation already used' };

  if (invitation.expiresAt < new Date())
    return { error: 'Invitation expired' };

  if (
    invitation.tenantId &&
    invitation.tenantId.toString() !== userId
  ) {
    return { error: 'Invitation not assigned to you' };
  }

  return { invitation };
};

/*ATTACH TENANT TO PROPERTY*/

const attachTenantToProperty = async ({ invitation, tenantId }) => {

  const property = await Property.findById(invitation.propertyId)
    .select('tenantId ownerId');

  if (!property) return { error: 'Property not found' };

  if (property.tenantId)
    return { error: 'Property already occupied' };

  property.tenantId = tenantId;
  property.status = 'OCCUPIED';

  await property.save();

  return { property };
};

/*JOIN PROPERTY USING TOKEN */

export const joinWithToken = async (req, res, next) => {
  try {

    if (req.user.role !== 'TENANT') {
      return res.status(403).json({
        success: false,
        message: 'Only tenants can join property'
      });
    }

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Invite token required'
      });
    }

    const { invitation, error } =
      await validateTokenAndInvitation({
        token,
        userId: req.user.id
      });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    const { property, error: propErr } =
      await attachTenantToProperty({
        invitation,
        tenantId: req.user.id
      });

    if (propErr) {
      return res.status(400).json({
        success: false,
        message: propErr
      });
    }

    invitation.status = 'ACCEPTED';
    invitation.tenantId = req.user.id;
    await invitation.save();

    // Notify owner
    await createAndDispatchNotification({
      userId: invitation.ownerId.toString(),
      disputeId: null,
      type: 'INVITATION_ACCEPTED',
      title: 'Invitation Accepted',
      message: `${req.user.name} joined your property`,
      metadata: {
        propertyId: property._id,
        invitationId: invitation._id
      }
    });

    emitSocket(invitation.ownerId.toString(),
      'invitation_accepted',
      { invitationId: invitation._id }
    );

    try {
      // Invalidate property-related cache when tenant joins
      await invalidatePropertyCache();
    } catch (cacheErr) {
      console.error('Property cache invalidation error (joinWithToken):', cacheErr?.message || cacheErr);
    }

    res.status(200).json({
      success: true,
      message: 'Property joined successfully',
      data: {
        propertyId: property._id
      }
    });

  } catch (error) {
    console.error('JOIN TOKEN ERROR:', error);
    next(error);
  }
};

/*TENANT INVITATION INBOX*/

export const getMyInvitations = async (req, res, next) => {
  try {

    if (req.user.role !== 'TENANT') {
      return res.status(403).json({
        success: false,
        message: 'Only tenants can view invitations'
      });
    }

    const invitations = await Invitation.find({
      status: 'PENDING',
      expiresAt: { $gt: new Date() },
      $or: [
        { tenantId: req.user.id },
        { tenantId: null }
      ]
    })
      .populate('propertyId', 'address city state')
      .populate('ownerId', 'name email');

    res.status(200).json({
      success: true,
      data: { invitations }
    });

  } catch (error) {
    next(error);
  }
};

/*ACCEPT INVITATION (INBOX)*/

export const acceptInvitation = async (req, res, next) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation id'
      });
    }

    const invitation = await Invitation.findById(id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    req.body.token = invitation.token;

    return joinWithToken(req, res, next);

  } catch (error) {
    next(error);
  }
};

/* REJECT INVITATION */

export const rejectInvitation = async (req, res, next) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation id'
      });
    }

    const invitation = await Invitation.findById(id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    invitation.status = 'REJECTED';
    await invitation.save();

    await createAndDispatchNotification({
      userId: invitation.ownerId.toString(),
      disputeId: null,
      type: 'INVITATION_REJECTED',
      title: 'Invitation Rejected',
      message: `${req.user.name} rejected your invitation`,
      metadata: {
        propertyId: invitation.propertyId,
        invitationId: invitation._id
      }
    });

    emitSocket(invitation.ownerId.toString(),
      'invitation_rejected',
      { invitationId: invitation._id }
    );

    res.status(200).json({
      success: true,
      message: 'Invitation rejected'
    });

  } catch (error) {
    next(error);
  }
};
