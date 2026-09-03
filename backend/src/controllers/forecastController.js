/**
 * forecastController.js
 * Controller endpoints for /api/forecast routes.
 */

const {
  generateDemandForecast,
  generatePriceForecast,
  generateForecastSummary,
  SUPPORTED_COMMODITIES,
  SUPPORTED_HORIZONS,
} = require('../services/forecasting/forecastingService');

// @desc    Get Real Data-Driven Demand Forecast
// @route   GET /api/forecast/demand
// @access  Public
const getDemandForecast = async (req, res) => {
  try {
    const { commodity, crop, district, mandi, state, horizon, days } = req.query;
    const targetCommodity = commodity || crop || 'Tomato';
    const targetHorizon = days || horizon || 30;

    const result = await generateDemandForecast({
      commodity: targetCommodity,
      district: district || mandi,
      mandi: mandi || district,
      state,
      horizon: targetHorizon,
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

// @desc    Get Real Data-Driven Price Forecast & Trajectory
// @route   GET /api/forecast/price
// @access  Public
const getPriceForecast = async (req, res) => {
  try {
    const { commodity, crop, district, mandi, horizon, days } = req.query;
    const targetCommodity = commodity || crop || 'Tomato';

    const result = await generatePriceForecast({
      commodity: targetCommodity,
      district: district || mandi,
      mandi: mandi || district,
      horizon: days || horizon || 15,
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

// @desc    Get Forecast Summary for All Supported Commodities
// @route   GET /api/forecast/summary
// @access  Public
const getForecastSummary = async (req, res) => {
  try {
    const { district, mandi, state } = req.query;

    const result = await generateForecastSummary({
      district: district || mandi || 'Delhi NCR',
      state: state || 'Delhi',
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDemandForecast,
  getPriceForecast,
  getForecastSummary,
};
