const mongoose = require('mongoose');

const qualityVerificationSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    produceListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProduceListing',
    },
    stage: {
      type: String,
      enum: ['LISTING', 'PICKUP', 'DELIVERY'],
      required: true,
    },
    verifier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifierRole: {
      type: String,
      enum: ['FARMER', 'LOGISTICS', 'BUYER', 'SYSTEM_AI'],
    },
    gradeVerified: {
      type: String,
      enum: ['GRADE_A', 'GRADE_B', 'GRADE_C'],
    },
    weightKgMeasured: Number,
    photos: [String],
    metrics: {
      colorScore: Number, // 0 to 100
      defectPercentage: Number,
      sizeUniformityScore: Number,
      packagingCondition: String,
    },
    mismatchDetected: {
      type: Boolean,
      default: false,
    },
    disputeRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispute',
    },
    comments: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('QualityVerification', qualityVerificationSchema);
