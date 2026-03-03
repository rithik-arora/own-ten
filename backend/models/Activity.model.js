import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    disputeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispute',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['CREATED', 'STATUS_CHANGED', 'MESSAGE', 'EVIDENCE', 'RESOLVED'],
      required: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
);

activitySchema.index({ disputeId: 1, createdAt: 1 });

export default mongoose.model('Activity', activitySchema);

