const mongoose = require('mongoose');

const buyerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    businessType: {
      type: String,
      enum: ['SUPERMARKET', 'RESTAURANT_CHAIN', 'WHOLESALER', 'FOOD_PROCESSOR', 'EXPORTER'],
      default: 'SUPERMARKET',
    },
    gstNumber: String,
    procurementCategory: [String],
    verifiedStatus: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BuyerProfile', buyerProfileSchema);
