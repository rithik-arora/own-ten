import mongoose from 'mongoose';

const adminActionSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  actionType: {
    type: String,
    required: true,
    enum: ['BLOCK_USER', 'UNBLOCK_USER', 'FORCE_STATUS']
  },
  targetType: {
    type: String,
    required: true,
    enum: ['USER', 'DISPUTE']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  meta: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

adminActionSchema.index({ createdAt: -1 });

export default mongoose.model('AdminAction', adminActionSchema);
