const mongoose = require('mongoose');

const demandForecastSchema = new mongoose.Schema(
  {
    cropName: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    timePeriod: {
      type: String,
      default: 'Next 30 Days',
    },
    historicalDemandKg: Number,
    predictedDemandKg: Number,
    currentSupplyKg: Number,
    demandGapKg: Number,
    status: {
      type: String,
      enum: ['HIGH', 'BALANCED', 'SURPLUS'],
      default: 'HIGH',
    },
    recommendedAction: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('DemandForecast', demandForecastSchema);
