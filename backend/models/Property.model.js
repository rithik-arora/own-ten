import mongoose from 'mongoose'
import crypto from 'crypto'

const propertySchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },

  isPublic: {
    type: Boolean,
    default: true
  },

  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  address: {
    type: String,
    required: true,
    trim: true
  },

  city: {
    type: String,
    required: true,
    trim: true
  },

  state: {
    type: String,
    required: true,
    trim: true
  },

  rentAmount: {
    type: Number,
    required: true
  },

  rentDueDay:{
    type:Number,
    default:5,
    min:1,
    max:28
  },

  status: {
    type: String,
    enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'],
    default: 'AVAILABLE'
  },

  /* =========================================
     🔥 MULTIPLE PROPERTY IMAGES (PRO LEVEL)
  ========================================= */
  images: [
    {
      url: String,
      public_id: String
    }
  ],

  inviteToken: String,
  inviteTokenExpiry: Date

}, { timestamps: true })

/* =========================================
   INVITE TOKEN
========================================= */
propertySchema.methods.generateInviteToken = function () {
  const token = crypto.randomBytes(32).toString('hex')
  this.inviteToken = crypto.createHash('sha256').update(token).digest('hex')
  this.inviteTokenExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000
  return token
}

propertySchema.methods.matchInviteToken = function (token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  return this.inviteToken === hashedToken && this.inviteTokenExpiry > Date.now()
}

export default mongoose.model('Property', propertySchema)