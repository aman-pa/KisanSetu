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
    storageCondition: {
      type: String,
      enum: ['Open Field', 'Room Temperature', 'Refrigerated', 'Cold Storage', 'Warehouse', 'Other'],
      default: 'Room Temperature',
    },
    images: [String],
    imageHashes: [String],
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
    aiQualityAssessment: {
      initialQualityScore: { type: Number, default: 92 },
      initialGrade: { type: String, default: 'A+' },
      assessedAt: { type: Date, default: Date.now },
      qualityStatus: {
        type: String,
        enum: ['VERIFIED', 'ESTIMATED', 'NOT_VERIFIED'],
        default: 'NOT_VERIFIED',
      },
      latestVerifiedScore: { type: Number, default: 92 },
      latestVerifiedGrade: { type: String, default: 'A+' },
      latestVerifiedAt: { type: Date, default: Date.now },
      overallScore: { type: Number, default: 92 },
      grade: { type: String, default: 'A+' },
      confidence: { type: Number, default: 87 },
      freshness: { type: Number, default: 94 },
      appearance: { type: Number, default: 91 },
      colorQuality: { type: Number, default: 95 },
      visibleDamage: { type: Number, default: 96 },
      spoilageRisk: { type: String, default: 'Low' },
      spoilageRiskScore: { type: Number, default: 90 },
      maturity: { type: Number, default: 88 },
      observations: [String],
      concerns: [String],
      imageConsistency: {
        status: { type: String, enum: ['PASS', 'FAIL', 'UNCERTAIN', 'NOT_CHECKED'], default: 'PASS' },
        isSameCrop: { type: Boolean, default: true },
        image1Crop: { type: String, default: 'Produce' },
        image2Crop: { type: String, default: 'Produce' },
        selectedCrop: { type: String, default: 'Produce' },
        confidence: { type: Number, default: 90 },
        message: String,
      },
      latestGeoVerification: {
        latitude: Number,
        longitude: Number,
        capturedAt: { type: Date, default: Date.now },
        isGeoVerified: { type: Boolean, default: false },
        status: { type: String, enum: ['VERIFIED', 'ESTIMATED', 'NOT_VERIFIED', 'NOT_AVAILABLE'], default: 'NOT_VERIFIED' },
      },
      qualityVerificationHistory: [
        {
          type: { type: String, default: 'INITIAL_ASSESSMENT' },
          score: Number,
          grade: String,
          timestamp: { type: Date, default: Date.now },
          status: { type: String, default: 'NOT_VERIFIED' },
          geoVerification: {
            latitude: Number,
            longitude: Number,
            capturedAt: { type: Date, default: Date.now },
            isGeoVerified: { type: Boolean, default: false },
            status: { type: String, default: 'NOT_VERIFIED' },
          },
          photo: String,
          notes: String,
        },
      ],
      degradationForecast: [
        {
          days: Number,
          score: Number,
          grade: String,
        },
      ],
      analysisTimestamp: { type: Date, default: Date.now },
      imagesAnalyzed: { type: Number, default: 2 },
      imageQualityScores: {
        image1: Number,
        image2: Number,
      },
      status: {
        type: String,
        enum: ['COMPLETE', 'NOT_AVAILABLE'],
        default: 'COMPLETE',
      },
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
