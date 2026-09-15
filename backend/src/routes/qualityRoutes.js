const express = require('express');
const {
  submitPickupVerification,
  submitDeliveryVerification,
  getQualityByBatch,
  validateImageQualityController,
  checkCropConsistencyController,
  reverifyQualityController,
  analyzeCropQualityController,
  verifyPipelineController,
} = require('../controllers/qualityController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// AI Crop Quality Assessment Endpoints
router.post('/verify-pipeline', verifyPipelineController);
router.post('/validate-image', validateImageQualityController);
router.post('/check-consistency', checkCropConsistencyController);
router.post('/analyze', analyzeCropQualityController);
router.post('/reverify', protect, authorize('FARMER', 'FPO', 'ADMIN'), reverifyQualityController);

router.post('/pickup', protect, authorize('LOGISTICS', 'ADMIN'), submitPickupVerification);
router.post('/delivery', protect, submitDeliveryVerification);
router.get('/batch/:batchId', getQualityByBatch);

module.exports = router;
