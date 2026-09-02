const express = require('express');
const { getLogisticsTasks, optimizeRoute } = require('../controllers/logisticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/tasks', protect, authorize('LOGISTICS', 'ADMIN'), getLogisticsTasks);
router.post('/optimize', protect, authorize('LOGISTICS', 'ADMIN', 'FPO', 'BULK_BUYER'), optimizeRoute);

module.exports = router;
