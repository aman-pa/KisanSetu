const express = require('express');
const {
  getAdminDashboardStats,
  updatePurchaseLimit,
  getDisputes,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', protect, authorize('ADMIN'), getAdminDashboardStats);
router.put('/config/purchase-limit', protect, authorize('ADMIN'), updatePurchaseLimit);
router.get('/disputes', protect, authorize('ADMIN'), getDisputes);

module.exports = router;
