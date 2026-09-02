const mongoose = require('mongoose');

const logisticsProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: String,
    vehicleType: {
      type: String,
      enum: ['MINI_TRUCK', 'REFRIGERATED_TRUCK', 'HEAVY_CONTAINER', 'TEMPO'],
      default: 'REFRIGERATED_TRUCK',
    },
    vehicleNumber: String,
    vehicleCapacityKg: {
      type: Number,
      default: 5000,
    },
    serviceAreas: [String],
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LogisticsProfile', logisticsProfileSchema);
