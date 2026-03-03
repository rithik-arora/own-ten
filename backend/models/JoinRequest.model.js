import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    index: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
    index: true
  }
}, {
  timestamps: true
});

// One active (PENDING) request per tenant per property
joinRequestSchema.index(
  { propertyId: 1, tenantId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'PENDING' }
  }
);

// Query performance
joinRequestSchema.index({ propertyId: 1, status: 1, createdAt: -1 });
joinRequestSchema.index({ tenantId: 1, status: 1, updatedAt: -1 });

export default mongoose.model('JoinRequest', joinRequestSchema);

