import crypto from 'crypto'
import mongoose from 'mongoose'
import Property from '../models/Property.model.js'
import Dispute from '../models/Dispute.model.js'
import Payment from '../models/Payment.model.js'
import User from '../models/User.model.js'
import { getRazorpay } from '../config/razorpay.js'
import { createAndDispatchNotification } from './notification.controller.js'
import { getIO } from '../config/socket.js'
import { sendEmail } from '../services/emailService.js'
import { paymentTemplate } from '../utils/emailTemplates.js'

/*SOCKET EMIT */
const emitSocket = (userId, event, payload) => {
  try {
    const io = getIO()
    io.to(`user_${userId}`).emit(event, payload)
  } catch {}
}

/*VALIDATE PROPERTY + AMOUNT*/
const getExpectedAmount = async ({
  tenantId,
  propertyId,
  disputeId,
  type
}) => {
  if (!['RENT', 'DISPUTE_FEE'].includes(type)) {
    return { error: 'Invalid payment type' }
  }

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return { error: 'Invalid property id' }
  }

  const property = await Property.findById(propertyId).select(
    'ownerId tenantId rentAmount'
  )

  if (!property) return { error: 'Property not found' }

  if (property.tenantId?.toString() !== tenantId) {
    return { error: 'You are not tenant of this property' }
  }

  // RENT
  if (type === 'RENT') {
    const amount = Number(property.rentAmount || 0)
    if (!amount) return { error: 'Invalid rent amount' }

    return {
      amount,
      ownerId: property.ownerId.toString(),
      property
    }
  }

  // DISPUTE FEE
  if (!disputeId) return { error: 'Dispute ID required' }

  const dispute = await Dispute.findById(disputeId)
  if (!dispute) return { error: 'Dispute not found' }

  const fee = Number(process.env.DISPUTE_FEE_AMOUNT || 200)

  return {
    amount: fee,
    ownerId: property.ownerId.toString(),
    property,
    dispute
  }
}

/*CREATE ORDER*/
export const createOrder = async (req, res, next) => {
  try {
    if (req.user.role !== 'TENANT') {
      return res.status(403).json({
        success: false,
        message: 'Only tenants can pay'
      })
    }

    const { propertyId, disputeId, type } = req.body

    const { amount, ownerId, property, dispute, error } =
      await getExpectedAmount({
        tenantId: req.user.id,
        propertyId,
        disputeId,
        type
      })

    if (error) {
      return res.status(400).json({ success: false, message: error })
    }

    // remove old CREATED payments
    await Payment.deleteMany({
      tenantId: req.user.id,
      propertyId,
      status: 'CREATED'
    })

    const razorpay = getRazorpay()

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `own-ten-${Date.now()}`,
      notes: {
        tenantId: req.user.id,
        propertyId,
        ownerId,
        type
      }
    })

    const payment = await Payment.create({
      tenantId: req.user.id,
      ownerId,
      propertyId,
      disputeId: dispute?._id || null,
      amount,
      currency: 'INR',
      status: 'CREATED',
      razorpayOrderId: order.id,
      type
    })

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment._id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
      }
    })
  } catch (err) {
    next(err)
  }
}

/*VERIFY PAYMENT*/
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id
    })

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      })
    }

    // already verified
    if (payment.status === 'SUCCESS') {
      return res.json({
        success: true,
        message: 'Already verified',
        data: { payment }
      })
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(body)
      .digest('hex')

    if (expected !== razorpay_signature) {
      payment.status = 'FAILED'
      await payment.save()

      return res.status(400).json({
        success: false,
        message: 'Signature mismatch'
      })
    }

    payment.status = 'SUCCESS'
    payment.razorpayPaymentId = razorpay_payment_id
    payment.razorpaySignature = razorpay_signature
    if (payment.type === 'RENT') {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  payment.rentMonth = `${year}-${month}`
}
    await payment.save()

    // notify owner
    await createAndDispatchNotification({
      userId: payment.ownerId.toString(),
      type: 'STATUS_UPDATED',
      title: 'Payment received',
      message: `₹${payment.amount} received`,
      metadata: {
        paymentId: payment._id,
        propertyId: payment.propertyId
      }
    })

    emitSocket(payment.ownerId.toString(), 'payment_success', {
      amount: payment.amount
    })

    // Send payment success email to owner (only for RENT payments)
    if (payment.type === 'RENT') {
      try {
        const owner = await User.findById(payment.ownerId).select('email');
        const property = await Property.findById(payment.propertyId).select('address');
        
        if (owner?.email && property) {
          await sendEmail({
            to: owner.email,
            subject: 'Rent Received - OwnTen',
            html: paymentTemplate(payment.amount, property)
          });
          console.log(`Payment success email sent to owner: ${owner.email}`);
        }
      } catch (emailError) {
        console.error('Failed to send payment success email:', emailError.message);
        // Don't fail the request if email fails
      }
    }

    res.json({
      success: true,
      message: 'Payment verified',
      data: { payment }
    })
  } catch (err) {
    next(err)
  }
}

/* TENANT PAYMENTS*/
export const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ tenantId: req.user.id })
      .populate('propertyId', 'address')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: { payments }
    })
  } catch (err) {
    next(err)
  }
}

/* OWNER EARNINGS*/
export const getOwnerEarnings = async (req, res, next) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.user.id)

    const [total, monthly, recent] = await Promise.all([
      Payment.aggregate([
        { $match: { ownerId, status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { ownerId, status: 'SUCCESS' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Payment.find({ ownerId, status: 'SUCCESS' })
        .populate('tenantId', 'name')
        .populate('propertyId', 'address')
        .sort({ createdAt: -1 })
        .limit(5)
    ])

    res.json({
      success: true,
      data: {
        totalEarned: total[0]?.total || 0,
        monthlyEarnings: monthly,
        recentPayments: recent
      }
    })
  } catch (err) {
    next(err)
  }
}