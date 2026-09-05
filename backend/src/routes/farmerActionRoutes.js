/**
 * farmerActionRoutes.js
 * Express routing for /api/farmer-action endpoints.
 */

const express = require('express');
const router = express.Router();
const {
  getRecommendation,
  getMandiOptions,
  getSummary,
  getSignals,
} = require('../controllers/farmerActionController');

// Personalized Farmer Action Recommendation
router.get('/recommendation', getRecommendation);

// Available Mandi Options & Regional Ranking
router.get('/mandi-options', getMandiOptions);

// Multi-Commodity Dashboard Summary
router.get('/summary', getSummary);

// Observable & Derived Signals for Farmer Context
router.get('/signals', getSignals);

module.exports = router;
