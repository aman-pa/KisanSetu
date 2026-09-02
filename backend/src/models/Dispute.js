const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    evidencePhotos: [String],
    stage: {
      type: String,
      enum: ['PICKUP', 'DELIVERY'],
      default: 'DELIVERY',
    },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_INVESTIGATION', 'RESOLVED_REFUND', 'RESOLVED_RELEASED', 'REJECTED'],
      default: 'OPEN',
    },
    resolutionNotes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispute', disputeSchema);
