const mongoose = require('mongoose');

const commodityArrivalSchema = new mongoose.Schema(
  {
    commodity: {
      type: String,
      required: [true, 'Commodity name is required'],
      trim: true,
      index: true,
    },
    variety: {
      type: String,
      trim: true,
      default: 'Standard',
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      index: true,
    },
    market: {
      type: String,
      required: [true, 'Market name is required'],
      trim: true,
      index: true,
    },
    arrivalDate: {
      type: Date,
      required: [true, 'Arrival date is required'],
      index: true,
    },
    arrivalQuantity: {
      type: Number,
      required: [true, 'Arrival quantity is required'],
      min: [0, 'Arrival quantity cannot be negative'],
    },
    unit: {
      type: String,
      enum: ['Tonnes', 'Quintals', 'Kg'],
      default: 'Tonnes',
    },
    source: {
      type: String,
      enum: ['LIVE_EXTERNAL', 'SEEDED_DEMO', 'SYNTHETIC_FALLBACK'],
      default: 'SEEDED_DEMO',
    },
    sourceTimestamp: {
      type: Date,
      default: Date.now,
    },
    isSynthetic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for analytical and time-series queries
commodityArrivalSchema.index({ commodity: 1, market: 1, arrivalDate: -1 });
commodityArrivalSchema.index({ commodity: 1, district: 1, arrivalDate: -1 });
commodityArrivalSchema.index({ commodity: 1, arrivalDate: -1 });

module.exports = mongoose.model('CommodityArrival', commodityArrivalSchema);
