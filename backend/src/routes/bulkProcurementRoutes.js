const express = require('express');
const {
  createProcurementRequest,
  getProcurementRequests,
  getSmartMatches,
} = require('../controllers/bulkProcurementController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('BULK_BUYER', 'FPO', 'ADMIN'), createProcurementRequest);
router.get('/', getProcurementRequests);
router.get('/:id/match', protect, getSmartMatches);

module.exports = router;
