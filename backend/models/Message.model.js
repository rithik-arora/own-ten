import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  disputeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispute',
    required: [true, 'Dispute ID is required'],
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  }
}, {
  timestamps: true
});

// Index for efficient queries
messageSchema.index({ disputeId: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);

