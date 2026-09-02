const mongoose = require('mongoose');

const batchTraceabilitySchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
    },
    produceListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProduceListing',
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cropName: String,
    quantityKg: Number,
    harvestDate: Date,
    qrDataUrl: String,
    timeline: [
      {
        stage: {
          type: String,
          enum: ['LISTED', 'AI_ASSESSED', 'PICKUP_VERIFIED', 'IN_TRANSIT', 'DELIVERED', 'BUYER_VERIFIED'],
        },
        timestamp: { type: Date, default: Date.now },
        actor: String,
        location: String,
        notes: String,
        verificationData: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('BatchTraceability', batchTraceabilitySchema);
