const mongoose = require('mongoose');

const trustScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    overallScore: {
      type: Number,
      default: 90,
    },
    breakdown: {
      orderSuccessRate: { type: Number, default: 95 },
      qualityConsistencyScore: { type: Number, default: 92 },
      deliveryReliabilityScore: { type: Number, default: 94 },
      buyerRatingAvg: { type: Number, default: 4.8 },
      disputeFrequencyPenalty: { type: Number, default: 2 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrustScore', trustScoreSchema);
