/**
 * mandiOptimizerRoutes.js
 * Express route definitions for Phase 6 Net Realization & Mandi Optimizer.
 */

const express = require('express');
const router = express.Router();

const {
  optimizeMandi,
  getMandiCoordinates,
  getTransportRates,
  getOptimizerMetadata,
} = require('../controllers/mandiOptimizerController');

// Optimization calculation endpoints (supporting both POST and GET)
router.post('/optimize', optimizeMandi);
router.get('/optimize', optimizeMandi);

// Auxiliary metadata endpoints
router.get('/mandi-coordinates', getMandiCoordinates);
router.get('/transport-rates', getTransportRates);
router.get('/metadata', getOptimizerMetadata);

module.exports = router;
