import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema(
  {
    disputeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispute',
      required: [true, 'Dispute ID is required'],
      index: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader ID is required'],
      index: true
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
      enum: ['image', 'pdf', 'video', 'doc']
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true
    },
    size: {
      type: Number,
      required: [true, 'File size is required']
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

evidenceSchema.index({ disputeId: 1, createdAt: -1 });

export default mongoose.model('Evidence', evidenceSchema);







