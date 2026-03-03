import mongoose from 'mongoose';
import crypto from 'crypto';

const invitationSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    index: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING',
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

invitationSchema.statics.generateToken = () => crypto.randomBytes(24).toString('hex');

export default mongoose.model('Invitation', invitationSchema);
