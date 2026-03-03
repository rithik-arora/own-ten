import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import Message from '../models/Message.model.js'
import Dispute from '../models/Dispute.model.js'
import Property from '../models/Property.model.js'
import { createNotification, formatNotification } from '../controllers/notification.helper.js'
import { createActivity } from '../controllers/activity.helper.js'

let ioInstance = null

export const getIO = () => {
  if (!ioInstance) throw new Error('Socket.IO not initialized')
  return ioInstance
}

export const initializeSocket = (server) => {

  // ✅ Prevent multiple initialization
  if (ioInstance) {
    console.log('⚠️ Socket already initialized')
    return ioInstance
  }

  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    },
    transports: ['websocket'] // ✅ important
  })

  ioInstance = io

  // ==========================
  // AUTH MIDDLEWARE (FAST)
  // ==========================

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token

      if (!token) {
        return next(new Error('Auth token missing'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Store minimal info (NO DB CALL)
      socket.user = {
        id: decoded.id,
        role: decoded.role,
        name: decoded.name
      }

      next()

    } catch (err) {
      console.error('Socket auth error:', err.message)
      next(new Error('Authentication failed'))
    }
  })

  // ==========================
  // CONNECTION HANDLER
  // ==========================

  io.on('connection', (socket) => {

    console.log(`✅ Socket connected: ${socket.id} user=${socket.user.id}`)

    // Personal notification room
    socket.join(`user_${socket.user.id}`)

    // --------------------------
    // JOIN DISPUTE ROOM
    // --------------------------

    socket.on('join_dispute', async (disputeId) => {
      try {

        const dispute = await Dispute.findById(disputeId).select('createdBy againstUser propertyId')

        if (!dispute) {
          socket.emit('error', { message: 'Dispute not found' })
          return
        }

        const userId = socket.user.id

        const isCreator = dispute.createdBy?.toString() === userId
        const isAgainst = dispute.againstUser?.toString() === userId
        const isAdmin = socket.user.role === 'ADMIN'

        let isPropertyOwner = false

        if (socket.user.role === 'OWNER') {
          const property = await Property.findById(dispute.propertyId).select('ownerId')
          isPropertyOwner = property?.ownerId?.toString() === userId
        }

        if (!isCreator && !isAgainst && !isAdmin && !isPropertyOwner) {
          socket.emit('error', { message: 'Not authorized' })
          return
        }

        const room = `dispute_${disputeId}`
        socket.join(room)

        socket.emit('joined_dispute', { disputeId })

      } catch (err) {
        console.error('Join dispute error:', err.message)
        socket.emit('error', { message: 'Join failed' })
      }
    })

    // --------------------------
    // LEAVE ROOM
    // --------------------------

    socket.on('leave_dispute', (disputeId) => {
      socket.leave(`dispute_${disputeId}`)
    })

    // --------------------------
    // SEND MESSAGE
    // --------------------------

    socket.on('send_message', async ({ disputeId, content }) => {
      try {

        if (!content?.trim()) return

        const dispute = await Dispute.findById(disputeId).select('createdBy againstUser')

        if (!dispute) {
          socket.emit('error', { message: 'Dispute not found' })
          return
        }

        const message = await Message.create({
          disputeId,
          senderId: socket.user.id,
          content: content.trim()
        })

        await message.populate('senderId', 'name email role')

        io.to(`dispute_${disputeId}`).emit('receive_message', {
          message
        })

        // Notification to other participant
        const participants = [
          dispute.createdBy?.toString(),
          dispute.againstUser?.toString()
        ].filter(Boolean)

        const receivers = participants.filter(id => id !== socket.user.id)

        for (const uid of receivers) {

          const notification = await createNotification({
            userId: uid,
            disputeId,
            type: 'CHAT_MESSAGE',
            title: 'New message',
            message: `${socket.user.name} sent a message`,
            metadata: { messageId: message._id }
          })

          io.to(`user_${uid}`).emit(
            'notification:new',
            formatNotification(notification)
          )
        }

        // Timeline activity
        await createActivity({
          disputeId,
          userId: socket.user.id,
          type: 'MESSAGE',
          description: `${socket.user.name} sent a message`,
          metadata: {
            messageId: message._id,
            contentPreview: message.content.slice(0, 200)
          }
        })

      } catch (err) {
        console.error('Send message error:', err.message)
      }
    })

    // --------------------------
    // TYPING EVENTS
    // --------------------------

    socket.on('typing_start', ({ disputeId }) => {
      socket.to(`dispute_${disputeId}`).emit('user_typing', {
        userId: socket.user.id,
        userName: socket.user.name
      })
    })

    socket.on('typing_stop', ({ disputeId }) => {
      socket.to(`dispute_${disputeId}`).emit('user_stopped_typing', {
        userId: socket.user.id
      })
    })

    // --------------------------
    // DISCONNECT
    // --------------------------

    // socket.on('disconnect', (reason) => {
    //   console.log(`❌ Socket disconnected ${socket.id} reason=${reason}`)
    // })
    socket.on('disconnect', (reason) => {
  console.log(`❌ Socket disconnected: ${socket.user.name} | Reason: ${reason}`)
})

  })

  return io
}
