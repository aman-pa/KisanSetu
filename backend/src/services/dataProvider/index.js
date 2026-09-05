/**
 * dataProvider/index.js
 * Central registry and factory for agricultural market data and live weather services.
 * Features automated live API routing with resilient zero-downtime fallback to SeededDataProvider.
 */

const { MarketDataProvider, DATA_SOURCES } = require('./MarketDataProvider');
const SeededDataProvider = require('./SeededDataProvider');
const AgmarknetLiveProvider = require('./live/AgmarknetLiveProvider');
const OpenMeteoWeatherProvider = require('./live/OpenMeteoWeatherProvider');

// Singleton Instances
const seededProvider = new SeededDataProvider();
const agmarknetProvider = new AgmarknetLiveProvider();
const weatherProvider = new OpenMeteoWeatherProvider();

/**
 * Active Market Data Provider Router.
 * Uses AgmarknetLiveProvider if configured; automatically falls back to SeededDataProvider.
 */
const getActiveProvider = () => {
  if (agmarknetProvider.isConfigured()) {
    return agmarknetProvider;
  }
  return seededProvider;
};

/**
 * Fetch Live Agricultural Weather Data.
 * @param {Object} query
 * @returns {Promise<Object>}
 */
const getWeatherData = async (query = {}) => {
  return weatherProvider.getAgriWeather(query);
};

/**
 * Comprehensive Multi-Provider Telemetry Diagnostics.
 */
const getCombinedProviderStatus = async () => {
  const activeMarketProvider = getActiveProvider();
  const marketStatus = await activeMarketProvider.getProviderStatus();
  const weatherStatus = weatherProvider.getProviderStatus();

  return {
    success: true,
    activeMarketProvider: marketStatus.provider,
    market: marketStatus,
    weather: weatherStatus,
    availableSources: DATA_SOURCES,
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  MarketDataProvider,
  DATA_SOURCES,
  SeededDataProvider,
  AgmarknetLiveProvider,
  OpenMeteoWeatherProvider,
  seededProvider,
  agmarknetProvider,
  weatherProvider,
  getActiveProvider,
  getWeatherData,
  getCombinedProviderStatus,
};
