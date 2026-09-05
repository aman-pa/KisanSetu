/**
 * priceIntelligenceRoutes.js
 * Express routing for /api/price-intelligence endpoints.
 */

const express = require('express');
const router = express.Router();
const {
  getRecommendation,
  getBestMandi,
  getSignals,
  getSummary,
} = require('../controllers/priceIntelligenceController');

// Selling Recommendation (SELL NOW / WAIT / CONSIDER WAITING)
router.get('/recommendation', getRecommendation);

// Best Mandi Ranking & Cross-Mandi Comparison
router.get('/best-mandi', getBestMandi);

// Observable & Derived Price Signals
router.get('/signals', getSignals);

// Multi-Commodity Intelligence Summary
router.get('/summary', getSummary);

module.exports = router;
