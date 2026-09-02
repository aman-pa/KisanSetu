const mongoose = require('mongoose');

const priceRecommendationSchema = new mongoose.Schema(
  {
    cropName: {
      type: String,
      required: true,
    },
    district: String,
    grade: String,
    currentAveragePrice: Number,
    recommendedMinPrice: Number,
    recommendedMaxPrice: Number,
    reasoning: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('PriceRecommendation', priceRecommendationSchema);
