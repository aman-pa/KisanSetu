/**
 * marketDataRoutes.js
 * Express routing for agricultural market data layer endpoints.
 */

const express = require('express');
const router = express.Router();
const {
  getHistoricalPrices,
  getCurrentPrices,
  getArrivals,
  getRegionalSupplyIndicators,
  getProviderStatus,
} = require('../controllers/marketDataController');

// Market Price Endpoints
router.get('/prices/current', getCurrentPrices);
router.get('/prices', getHistoricalPrices);

// Arrival Volume Endpoints
router.get('/arrivals', getArrivals);

// Supply Indicator Analytics
router.get('/supply', getRegionalSupplyIndicators);

// Data Provider Diagnostics
router.get('/providers/status', getProviderStatus);

module.exports = router;
