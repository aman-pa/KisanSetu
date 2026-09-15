const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    farmSizeAcres: {
      type: Number,
      default: 5,
    },
    location: {
      village: String,
      district: String,
      state: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    cropsGrown: [String],
    expectedAnnualProductionKg: Number,
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      accountHolderName: String,
    },
    verificationDocUrl: String,
    trustScore: {
      type: Number,
      default: 90,
    },
    qualityScore: {
      type: Number,
      default: 92,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    fpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FPOProfile',
      default: null,
    },
    fpoMembershipStatus: {
      type: String,
      enum: ['NOT_MEMBER', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'NOT_MEMBER',
    },
    fpoRequestedAt: {
      type: Date,
      default: null,
    },
    fpoApprovedAt: {
      type: Date,
      default: null,
    },
    fpoRejectedAt: {
      type: Date,
      default: null,
    },
    fpoRejectionReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);
