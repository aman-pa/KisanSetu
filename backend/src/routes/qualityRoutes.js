const express = require('express');
const {
  submitPickupVerification,
  submitDeliveryVerification,
  getQualityByBatch,
} = require('../controllers/qualityController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/pickup', protect, authorize('LOGISTICS', 'ADMIN'), submitPickupVerification);
router.post('/delivery', protect, submitDeliveryVerification);
router.get('/batch/:batchId', getQualityByBatch);

module.exports = router;
