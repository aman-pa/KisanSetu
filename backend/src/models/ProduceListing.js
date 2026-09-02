const mongoose = require('mongoose');

const produceListingSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['VEGETABLES', 'FRUITS', 'GRAINS', 'PULSES', 'SPICES'],
      default: 'VEGETABLES',
    },
    quantityKg: {
      type: Number,
      required: true,
    },
    availableQuantityKg: {
      type: Number,
      required: true,
    },
    pricePerKg: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      enum: ['GRADE_A', 'GRADE_B', 'GRADE_C'],
      default: 'GRADE_A',
    },
    harvestDate: {
      type: Date,
      required: true,
    },
    images: [String],
    location: {
      district: { type: String, required: true },
      state: { type: String, required: true },
      lat: Number,
      lng: Number,
    },
    batchId: {
      type: String,
      unique: true,
    },
    aiQualityEstimateScore: {
      type: Number,
      default: 92, // 0 to 100
    },
    aiPriceRecommendation: {
      min: Number,
      max: Number,
      reasoning: String,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'RESERVED', 'SOLD_OUT'],
      default: 'AVAILABLE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProduceListing', produceListingSchema);
