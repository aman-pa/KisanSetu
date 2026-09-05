/**
 * farmerActionController.js
 * Express controllers for /api/farmer-action endpoints.
 */

const {
  getFarmerActionRecommendation,
  getMandiOptionsForFarmer,
  getFarmerActionSummary,
  getFarmerActionSignals,
  SUPPORTED_COMMODITIES,
} = require('../services/farmerAction/farmerActionService');

// @desc    Get Personalized Farmer Action Recommendation (SELL_NOW, WAIT, COMPARE_MANDIS, etc.)
// @route   GET /api/farmer-action/recommendation
// @access  Public
const getRecommendation = async (req, res) => {
  try {
    const { commodity, crop, mandi, market, district, quantity, qty, unit, expectedSellingDate, date } = req.query;

    const result = await getFarmerActionRecommendation({
      commodity: commodity || crop,
      mandi: mandi || market || district,
      quantity: quantity ?? qty,
      unit,
      expectedSellingDate: expectedSellingDate || date,
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

// @desc    Get Available Mandi Options & Arbitrage Comparison for Farmer
// @route   GET /api/farmer-action/mandi-options
// @access  Public
const getMandiOptions = async (req, res) => {
  try {
    const { commodity, crop } = req.query;

    const result = await getMandiOptionsForFarmer({
      commodity: commodity || crop || 'Tomato',
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

// @desc    Get Multi-Commodity Action Intelligence Summary
// @route   GET /api/farmer-action/summary
// @access  Public
const getSummary = async (req, res) => {
  try {
    const { mandi, market, district, state } = req.query;

    const result = await getFarmerActionSummary({
      mandi: mandi || market || district || 'Karnal',
      district: district || mandi,
      state: state || 'Haryana',
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Observable and Derived Market Signals for Farmer Context
// @route   GET /api/farmer-action/signals
// @access  Public
const getSignals = async (req, res) => {
  try {
    const { commodity, crop, mandi, market, district, quantity, unit } = req.query;

    const result = await getFarmerActionSignals({
      commodity: commodity || crop,
      mandi: mandi || market || district,
      quantity,
      unit,
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

module.exports = {
  getRecommendation,
  getMandiOptions,
  getSummary,
  getSignals,
};
