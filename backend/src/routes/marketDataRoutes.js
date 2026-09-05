/**
 * marketDataRoutes.js
 * Express routing for agricultural market data layer and live weather endpoints.
 */

const express = require('express');
const router = express.Router();
const {
  getHistoricalPrices,
  getCurrentPrices,
  getArrivals,
  getRegionalSupplyIndicators,
  getWeatherData,
  getProviderStatus,
} = require('../controllers/marketDataController');

// Market Price Endpoints
router.get('/prices/current', getCurrentPrices);
router.get('/prices', getHistoricalPrices);

// Arrival Volume Endpoints
router.get('/arrivals', getArrivals);

// Supply Indicator Analytics
router.get('/supply', getRegionalSupplyIndicators);

// Real Data-Driven Time-Series Demand Forecast (Phase 2)
const { getDemandForecast } = require('../controllers/aiProxyController');
router.get('/forecast', getDemandForecast);

// Live Agricultural Weather & Harvesting Advisories (Phase 5)
router.get('/weather', getWeatherData);

// Data Provider Diagnostics & Multi-Source Telemetry
router.get('/providers/status', getProviderStatus);
router.get('/provider-status', getProviderStatus); // legacy alias

module.exports = router;
