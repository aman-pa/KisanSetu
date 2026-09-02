const mongoose = require('mongoose');

const procurementRequestSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cropName: {
      type: String,
      required: true,
    },
    quantityRequiredKg: {
      type: Number,
      required: true,
    },
    qualityGrade: {
      type: String,
      enum: ['GRADE_A', 'GRADE_B', 'GRADE_C'],
      default: 'GRADE_A',
    },
    maxBudgetPerKg: {
      type: Number,
      required: true,
    },
    deliveryLocation: {
      city: String,
      district: String,
      state: String,
      lat: Number,
      lng: Number,
    },
    requiredDeliveryDate: {
      type: Date,
      required: true,
    },
    additionalRequirements: String,
    status: {
      type: String,
      enum: ['OPEN', 'MATCHED', 'FULFILLED', 'CANCELLED'],
      default: 'OPEN',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProcurementRequest', procurementRequestSchema);
