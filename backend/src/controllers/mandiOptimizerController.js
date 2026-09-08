/**
 * mandiOptimizerController.js
 * Express controllers for Phase 6 Net Realization & Mandi Optimizer endpoints.
 */

const { mandiOptimizerService } = require('../services/mandiOptimizer/mandiOptimizerService');
const { MANDI_COORDINATES } = require('../services/mandiOptimizer/distanceProvider');
const { VEHICLE_TIERS, DEFAULT_CONFIG } = require('../services/mandiOptimizer/transportCostModel');
const { SUPPORTED_COMMODITIES } = require('../services/mandiOptimizer/optimizerValidator');

// @desc    Calculate Net Realization & Recommend Economically Optimal Mandi
// @route   POST /api/mandi-optimizer/optimize
// @route   GET /api/mandi-optimizer/optimize
// @access  Public
const optimizeMandi = async (req, res) => {
  try {
    const rawParams = {
      ...req.query,
      ...req.body,
    };

    // If coordinates sent as flat query params lat/lng or body farmerLocation
    if (!rawParams.farmerLocation && (rawParams.lat !== undefined || rawParams.latitude !== undefined)) {
      rawParams.farmerLocation = {
        lat: Number(rawParams.lat || rawParams.latitude),
        lng: Number(rawParams.lng || rawParams.lon || rawParams.longitude),
        district: rawParams.district,
        state: rawParams.state,
      };
    }

    const bypassCache = req.query.bypassCache === 'true' || req.body.bypassCache === true;
    const result = await mandiOptimizerService.optimize(rawParams, { bypassCache });

    return res.json(result);
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: err.message,
      validationErrors: err.validationErrors || [err.message],
      supportedCommodities: SUPPORTED_COMMODITIES,
    });
  }
};

// @desc    Get APMC Mandi Coordinate Directory
// @route   GET /api/mandi-optimizer/mandi-coordinates
// @access  Public
const getMandiCoordinates = async (req, res) => {
  try {
    return res.json({
      success: true,
      count: Object.keys(MANDI_COORDINATES).length,
      mandis: MANDI_COORDINATES,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Transport Cost Configuration & Vehicle Tiers
// @route   GET /api/mandi-optimizer/transport-rates
// @access  Public
const getTransportRates = async (req, res) => {
  try {
    return res.json({
      success: true,
      vehicleTiers: VEHICLE_TIERS,
      defaultConfig: DEFAULT_CONFIG,
      modelType: 'VEHICLE_TIERED_DISTANCE_WEIGHT_MODEL',
      disclaimer: 'Logistics cost is an algorithmic estimate based on regional freight standards, not an active binding quote.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Supported Commodities & Units
// @route   GET /api/mandi-optimizer/metadata
// @access  Public
const getOptimizerMetadata = async (req, res) => {
  try {
    return res.json({
      success: true,
      supportedCommodities: SUPPORTED_COMMODITIES,
      supportedUnits: ['kg', 'quintal', 'tonnes'],
      canonicalUnit: 'kg',
      defaultSearchRadiusKm: 300,
      roadCircuityFactor: 1.25,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  optimizeMandi,
  getMandiCoordinates,
  getTransportRates,
  getOptimizerMetadata,
};
