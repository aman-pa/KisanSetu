/**
 * demandForecastService.js
 * Proxy re-export to modular forecasting architecture under ./forecasting/forecastingService.js
 */

const {
  generateDemandForecast,
  generatePriceForecast,
  generateForecastSummary,
  SUPPORTED_COMMODITIES,
  SUPPORTED_HORIZONS,
} = require('./forecasting/forecastingService');

module.exports = {
  generateDemandForecast,
  generatePriceForecast,
  generateForecastSummary,
  SUPPORTED_COMMODITIES,
  SUPPORTED_HORIZONS,
};
