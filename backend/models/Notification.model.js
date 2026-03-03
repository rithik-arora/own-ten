import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  dispute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispute'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'DISPUTE_CREATED',
      'STATUS_UPDATED',
      'CHAT_MESSAGE',
      'EVIDENCE_UPLOADED',
      'INVITATION_SENT',
      'INVITATION_ACCEPTED',
      'INVITATION_REJECTED',
      'JOIN_REQUEST_SENT',
      'JOIN_REQUEST_APPROVED',
      'JOIN_REQUEST_REJECTED'
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  isRead: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false
  }
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
