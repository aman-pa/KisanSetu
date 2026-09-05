/**
 * priceIntelligenceController.js
 * Express controllers for Phase 3 Price Intelligence & Selling Recommendation endpoints.
 */

const {
  getSellingRecommendation,
  getBestMandiComparison,
  getPriceSignals,
  getPriceIntelligenceSummary,
  SUPPORTED_COMMODITIES,
  SUPPORTED_HORIZONS,
} = require('../services/priceIntelligence/priceIntelligenceService');

// @desc    Get Explainable Farmer Selling Recommendation (SELL NOW / WAIT / etc.)
// @route   GET /api/price-intelligence/recommendation
// @access  Public
const getRecommendation = async (req, res) => {
  try {
    const { commodity, crop, mandi, market, district, state, days, horizon } = req.query;
    const targetCommodity = commodity || crop || 'Tomato';
    const targetMandi = mandi || market || district || 'Delhi NCR';
    const horizonDays = days || horizon || 7;

    const result = await getSellingRecommendation({
      commodity: targetCommodity,
      mandi: targetMandi,
      district: district || targetMandi,
      state,
      horizonDays,
    });

    return res.json(result);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message,
      supportedCommodities: SUPPORTED_COMMODITIES,
      supportedHorizons: SUPPORTED_HORIZONS,
    });
  }
};

// @desc    Get Best Mandi Comparison & Multi-Factor Ranking
// @route   GET /api/price-intelligence/best-mandi
// @access  Public
const getBestMandi = async (req, res) => {
  try {
    const { commodity, crop, state } = req.query;
    const targetCommodity = commodity || crop || 'Tomato';

    const result = await getBestMandiComparison({
      commodity: targetCommodity,
      state,
    });

    return res.json(result);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message,
      supportedCommodities: SUPPORTED_COMMODITIES,
    });
  }
};

// @desc    Get Raw Observed and Derived Price Signals
// @route   GET /api/price-intelligence/signals
// @access  Public
const getSignals = async (req, res) => {
  try {
    const { commodity, crop, mandi, market, district } = req.query;
    const targetCommodity = commodity || crop || 'Tomato';

    const result = await getPriceSignals({
      commodity: targetCommodity,
      mandi: mandi || market || district,
      district,
    });

    return res.json(result);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message,
      supportedCommodities: SUPPORTED_COMMODITIES,
    });
  }
};

// @desc    Get Multi-Commodity Intelligence Summary for Dashboards
// @route   GET /api/price-intelligence/summary
// @access  Public
const getSummary = async (req, res) => {
  try {
    const { mandi, market, district, state } = req.query;

    const result = await getPriceIntelligenceSummary({
      mandi: mandi || market || district || 'Delhi NCR',
      district: district || mandi,
      state: state || 'Delhi',
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getRecommendation,
  getBestMandi,
  getSignals,
  getSummary,
};
