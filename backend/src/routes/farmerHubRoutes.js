/**
 * farmerHubRoutes.js
 * Express router for KisanSetu AI Farmer Hub endpoints
 */

const express = require('express');
const router = express.Router();
const {
  getSchemes,
  getStateSchemes,
  getAlerts,
  getPibNews,
  matchSchemes,
} = require('../controllers/farmerHubController');

// Schemes catalog & search
router.get('/schemes', getSchemes);

// State-specific farmer schemes
router.get('/state-schemes', getStateSchemes);
router.get('/state-schemes/:state', getStateSchemes);

// Timely government announcements & deadlines
router.get('/alerts', getAlerts);

// Press Information Bureau (PIB) RSS feed proxy with fallback
router.get('/pib-news', getPibNews);

// Interactive scheme matcher
router.post('/match', matchSchemes);

module.exports = router;
