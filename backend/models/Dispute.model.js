import mongoose from 'mongoose';

/*
|--------------------------------------------------------------------------
| STATUS HISTORY SCHEMA
|--------------------------------------------------------------------------
*/
const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED']
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    trim: true
  }
}, { _id: false });

/*
|--------------------------------------------------------------------------
| DISPUTE SCHEMA
|--------------------------------------------------------------------------
*/
const disputeSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  againstUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },

  category: {
    type: String,
    enum: ['MAINTENANCE', 'PAYMENT', 'BEHAVIOR', 'LEASE_VIOLATION', 'OTHER'],
    default: 'OTHER'
  },

  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },

  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'],
    default: 'OPEN'
  },

  /*
  |--------------------------------------------------------------------------
  | ⭐ IMPORTANT FIELD
  | Used to hide disputes when tenant leaves property
  |--------------------------------------------------------------------------
  */
  isArchived: {
    type: Boolean,
    default: false
  },

  statusHistory: [statusHistorySchema]

}, {
  timestamps: true
});

/*
|--------------------------------------------------------------------------
| ADD INITIAL STATUS HISTORY
|--------------------------------------------------------------------------
*/
disputeSchema.pre('save', function (next) {
  if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
    this.statusHistory = [{
      status: this.status,
      changedBy: this.createdBy,
      changedAt: new Date()
    }];
  }
  next();
});

/*
|--------------------------------------------------------------------------
| INDEXES (PERFORMANCE)
|--------------------------------------------------------------------------
*/
disputeSchema.index({ propertyId: 1 });
disputeSchema.index({ createdBy: 1 });
disputeSchema.index({ againstUser: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ isArchived: 1 });
disputeSchema.index({ createdAt: -1 });

export default mongoose.model('Dispute', disputeSchema);