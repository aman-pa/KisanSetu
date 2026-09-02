const mongoose = require('mongoose');

const fpoProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    orgName: {
      type: String,
      required: true,
    },
    registrationNumber: String,
    representativeName: String,
    numberOfMemberFarmers: {
      type: Number,
      default: 150,
    },
    cropsHandled: [String],
    operatingRegions: [String],
    verificationDocUrl: String,
    totalRevenue: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FPOProfile', fpoProfileSchema);
