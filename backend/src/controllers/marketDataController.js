/**
 * marketDataController.js
 * Controller handling public and authenticated agricultural market data queries.
 * Validates inputs, routes queries to active data providers, and delivers normalized responses.
 */

const {
  getActiveProvider,
  getWeatherData: fetchWeatherData,
  getCombinedProviderStatus,
  DATA_SOURCES,
} = require('../services/dataProvider');

// Input validation helper
const validateDateParams = (from, to) => {
  let fromDate = null;
  let toDate = null;

  if (from) {
    fromDate = new Date(from);
    if (isNaN(fromDate.getTime())) {
      throw new Error("Invalid 'from' date format. Use ISO-8601 (e.g. YYYY-MM-DD).");
    }
  }

  if (to) {
    toDate = new Date(to);
    if (isNaN(toDate.getTime())) {
      throw new Error("Invalid 'to' date format. Use ISO-8601 (e.g. YYYY-MM-DD).");
    }
  }

  if (fromDate && toDate && fromDate > toDate) {
    throw new Error("'from' date cannot be after 'to' date.");
  }

  return { fromDate, toDate };
};

/**
 * @route   GET /api/market-data/prices
 * @desc    Get historical and filtered mandi price records with statistical rollups
 * @access  Public
 */
const getHistoricalPrices = async (req, res) => {
  try {
    const { commodity, state, district, market, from, to, page, limit } = req.query;

    // Validate date range
    validateDateParams(from, to);

    // Validate numeric pagination
    if (page && (isNaN(Number(page)) || Number(page) < 1)) {
      return res.status(400).json({ success: false, message: "'page' parameter must be a positive integer." });
    }
    if (limit && (isNaN(Number(limit)) || Number(limit) < 1)) {
      return res.status(400).json({ success: false, message: "'limit' parameter must be a positive integer." });
    }

    const provider = getActiveProvider();
    const result = await provider.getHistoricalPrices({
      commodity,
      state,
      district,
      market,
      from,
      to,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });

    res.json({
      success: true,
      count: result.records.length,
      records: result.records,
      statistics: result.statistics,
      metadata: result.metadata,
    });
  } catch (err) {
    console.error('[getHistoricalPrices Error]', err.message);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to fetch historical market prices.',
    });
  }
};

/**
 * @route   GET /api/market-data/prices/current
 * @desc    Get latest modal price snapshots per commodity and market with trend indicators
 * @access  Public
 */
const getCurrentPrices = async (req, res) => {
  try {
    const { commodity, state, district, market } = req.query;

    const provider = getActiveProvider();
    const result = await provider.getCurrentPrices({
      commodity,
      state,
      district,
      market,
    });

    res.json({
      success: true,
      count: result.snapshots.length,
      snapshots: result.snapshots,
      metadata: result.metadata,
    });
  } catch (err) {
    console.error('[getCurrentPrices Error]', err.message);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to fetch current market prices.',
    });
  }
};

/**
 * @route   GET /api/market-data/arrivals
 * @desc    Get commodity arrival volumes across mandis
 * @access  Public
 */
const getArrivals = async (req, res) => {
  try {
    const { commodity, state, district, market, from, to, page, limit } = req.query;

    validateDateParams(from, to);

    if (page && (isNaN(Number(page)) || Number(page) < 1)) {
      return res.status(400).json({ success: false, message: "'page' parameter must be a positive integer." });
    }
    if (limit && (isNaN(Number(limit)) || Number(limit) < 1)) {
      return res.status(400).json({ success: false, message: "'limit' parameter must be a positive integer." });
    }

    const provider = getActiveProvider();
    const result = await provider.getArrivals({
      commodity,
      state,
      district,
      market,
      from,
      to,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });

    res.json({
      success: true,
      count: result.arrivals.length,
      arrivals: result.arrivals,
      statistics: result.statistics,
      metadata: result.metadata,
    });
  } catch (err) {
    console.error('[getArrivals Error]', err.message);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to fetch commodity arrivals.',
    });
  }
};

/**
 * @route   GET /api/market-data/supply
 * @desc    Get regional supply velocity, surplus/deficit indicators, and moving averages
 * @access  Public
 */
const getRegionalSupplyIndicators = async (req, res) => {
  try {
    const { commodity, district, state } = req.query;

    const provider = getActiveProvider();
    const result = await provider.getRegionalSupplyIndicators({
      commodity,
      district,
      state,
    });

    res.json({
      success: true,
      count: result.indicators.length,
      indicators: result.indicators,
      metadata: result.metadata,
    });
  } catch (err) {
    console.error('[getRegionalSupplyIndicators Error]', err.message);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to compute regional supply indicators.',
    });
  }
};

/**
 * @route   GET /api/market-data/weather
 * @desc    Get live agricultural weather conditions, 7-day forecast, and crop harvesting/transit advisories
 * @access  Public
 */
const getWeatherData = async (req, res) => {
  try {
    const { district, state, market, lat, lon } = req.query;
    const weatherReport = await fetchWeatherData({ district, state, market, lat, lon });

    res.json({
      success: true,
      weather: weatherReport,
    });
  } catch (err) {
    console.error('[getWeatherData Error]', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch live agricultural weather data.',
    });
  }
};

/**
 * @route   GET /api/market-data/providers/status
 * @desc    Get comprehensive multi-provider telemetry (Market Data + Live Weather)
 * @access  Public
 */
const getProviderStatus = async (req, res) => {
  try {
    const combinedStatus = await getCombinedProviderStatus();

    res.json({
      ...combinedStatus,
      // Backward-compatibility alias
      providerStatus: combinedStatus.market,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getHistoricalPrices,
  getCurrentPrices,
  getArrivals,
  getRegionalSupplyIndicators,
  getWeatherData,
  getProviderStatus,
};
