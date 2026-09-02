const mongoose = require('mongoose');

const routeOptimizationSchema = new mongoose.Schema(
  {
    logisticsPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    waypoints: [
      {
        type: { type: String, enum: ['FARM_PICKUP', 'COLLECTION_HUB', 'BUYER_DROP'] },
        name: String,
        location: {
          lat: Number,
          lng: Number,
        },
        address: String,
        batchId: String,
        orderId: String,
      },
    ],
    totalDistanceKm: Number,
    totalDurationMinutes: Number,
    estimatedLogisticsSavings: Number,
    status: {
      type: String,
      enum: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'ASSIGNED',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RouteOptimization', routeOptimizationSchema);
