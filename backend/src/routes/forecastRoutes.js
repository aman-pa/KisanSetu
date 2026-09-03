/**
 * forecastRoutes.js
 * Express routing for /api/forecast endpoints.
 */

const express = require('express');
const router = express.Router();
const {
  getDemandForecast,
  getPriceForecast,
  getForecastSummary,
} = require('../controllers/forecastController');

// Demand Forecasting
router.get('/demand', getDemandForecast);

// Price Forecasting
router.get('/price', getPriceForecast);

// Platform Intelligence Summary
router.get('/summary', getForecastSummary);

module.exports = router;
