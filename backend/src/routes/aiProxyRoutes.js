const express = require('express');
const { getDemandForecast, getPriceRecommendation } = require('../controllers/aiProxyController');

const router = express.Router();

router.get('/demand/forecast', getDemandForecast);
router.get('/prices/recommendation', getPriceRecommendation);

module.exports = router;
