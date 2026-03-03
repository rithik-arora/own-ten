import mongoose from 'mongoose'
import Property from '../models/Property.model.js'
import JoinRequest from '../models/JoinRequest.model.js'
import { createAndDispatchNotification } from './notification.controller.js'
import { getIO } from '../config/socket.js'

const emitSocket = (userId, event, payload) => {
  try {
    const io = getIO()
    io.to(`user_${userId}`).emit(event, payload)
  } catch (_) {}
}

/* TENANT → SEND JOIN REQUEST
   POST /api/join-requests/:propertyId*/
export const createJoinRequest = async (req, res, next) => {
  try {
    if (req.user.role !== 'TENANT') {
      return res.status(403).json({
        success: false,
        message: 'Only tenants can send join requests'
      })
    }

    const { propertyId } = req.params

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property id'
      })
    }

    const property = await Property.findById(propertyId)
      .select('ownerId tenantId status isPublic address')

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      })
    }

    if (!property.isPublic) {
      return res.status(400).json({
        success: false,
        message: 'Property is not public'
      })
    }

    if (property.status !== 'AVAILABLE' || property.tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Property not available'
      })
    }

    // 🚀 BLOCK ONLY IF PENDING EXISTS
    const existingPending = await JoinRequest.findOne({
      propertyId,
      tenantId: req.user.id,
      status: 'PENDING'
    })

    if (existingPending) {
      return res.status(409).json({
        success: false,
        message: 'Join request already sent'
      })
    }

    // 🚀 CLEAN OLD APPROVED REQUESTS
    await JoinRequest.deleteMany({
      propertyId,
      tenantId: req.user.id,
      status: 'APPROVED'
    })

    const joinRequest = await JoinRequest.create({
      propertyId,
      tenantId: req.user.id
    })

    // 🔔 Notify owner
    await createAndDispatchNotification({
      userId: property.ownerId.toString(),
      type: 'JOIN_REQUEST_SENT',
      title: 'New join request',
      message: `${req.user.name} requested to join ${property.address}`,
      metadata: {
        propertyId: property._id,
        joinRequestId: joinRequest._id
      }
    })

    emitSocket(property.ownerId.toString(), 'join_request:new', {
      joinRequestId: joinRequest._id,
      propertyId: property._id
    })

    res.status(201).json({
      success: true,
      message: 'Join request sent',
      data: { joinRequest }
    })
  } catch (error) {
    next(error)
  }
}

/* OWNER → GET PROPERTY REQUESTS */
export const getPropertyJoinRequests = async (req, res, next) => {
  try {
    const { propertyId } = req.params

    const property = await Property.findById(propertyId).select('ownerId')

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      })
    }

    const isOwner = property.ownerId.toString() === req.user.id
    const isAdmin = req.user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    const requests = await JoinRequest.find({
      propertyId,
      status: 'PENDING'
    }).populate('tenantId', 'name email')

    res.status(200).json({
      success: true,
      data: { requests }
    })
  } catch (error) {
    next(error)
  }
}

/*TENANT → MY REQUESTS*/
export const getMyJoinRequests = async (req, res, next) => {
  try {
    const requests = await JoinRequest.find({
      tenantId: req.user.id
    }).populate('propertyId', 'address city state rentAmount status')

    res.status(200).json({
      success: true,
      data: { requests }
    })
  } catch (error) {
    next(error)
  }
}

/*APPROVE REQUEST */
export const approveJoinRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params

    const request = await JoinRequest.findById(requestId)
      .populate('propertyId')

    if (!request || request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request'
      })
    }

    const property = await Property.findById(request.propertyId)

    if (property.ownerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    if (property.tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Property already occupied'
      })
    }

    // assign tenant
    property.tenantId = request.tenantId
    property.status = 'OCCUPIED'
    await property.save()

    request.status = 'APPROVED'
    await request.save()

    await JoinRequest.updateMany(
      { propertyId: property._id, status: 'PENDING', _id: { $ne: requestId } },
      { $set: { status: 'REJECTED' } }
    )

    await createAndDispatchNotification({
      userId: request.tenantId.toString(),
      type: 'JOIN_REQUEST_APPROVED',
      title: 'Request approved',
      message: `Your request for ${property.address} approved`
    })

    emitSocket(request.tenantId.toString(), 'join_request:updated', {
      status: 'APPROVED'
    })

    res.status(200).json({
      success: true,
      message: 'Request approved'
    })
  } catch (error) {
    next(error)
  }
}

/*REJECT REQUEST*/
export const rejectJoinRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params

    const request = await JoinRequest.findById(requestId)
      .populate('propertyId')

    if (!request || request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request'
      })
    }

    const property = request.propertyId

    if (property.ownerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    request.status = 'REJECTED'
    await request.save()

    await createAndDispatchNotification({
      userId: request.tenantId.toString(),
      type: 'JOIN_REQUEST_REJECTED',
      title: 'Request rejected',
      message: `Your request for ${property.address} rejected`
    })

    emitSocket(request.tenantId.toString(), 'join_request:updated', {
      status: 'REJECTED'
    })

    res.status(200).json({
      success: true,
      message: 'Request rejected'
    })
  } catch (error) {
    next(error)
  }
}