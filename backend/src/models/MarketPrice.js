const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema(
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
    grade: {
      type: String,
      enum: ['GRADE_A', 'GRADE_B', 'GRADE_C', 'FAQ', 'STANDARD'],
      default: 'GRADE_A',
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
    minPrice: {
      type: Number,
      required: [true, 'Minimum price is required'],
      min: [0, 'Minimum price cannot be negative'],
    },
    maxPrice: {
      type: Number,
      required: [true, 'Maximum price is required'],
      min: [0, 'Maximum price cannot be negative'],
    },
    modalPrice: {
      type: Number,
      required: [true, 'Modal price is required'],
      min: [0, 'Modal price cannot be negative'],
    },
    unit: {
      type: String,
      enum: ['Rs/Quintal', 'Rs/Kg', 'Rs/Tonne'],
      default: 'Rs/Quintal',
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

// Compound indexes for high-frequency queries
marketPriceSchema.index({ commodity: 1, market: 1, arrivalDate: -1 });
marketPriceSchema.index({ commodity: 1, district: 1, arrivalDate: -1 });
marketPriceSchema.index({ commodity: 1, arrivalDate: -1 });

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
