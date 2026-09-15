const express = require('express');
const {
  getLogisticsTasks,
  optimizeRoute,
  assignVehicleToOrder,
  verifyPickupQR,
  verifyDeliveryPOD,
  getFleetTelemetry,
} = require('../controllers/logisticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/tasks', protect, authorize('LOGISTICS', 'ADMIN'), getLogisticsTasks);
router.post('/optimize', protect, authorize('LOGISTICS', 'ADMIN', 'FPO', 'BULK_BUYER'), optimizeRoute);
router.post('/assign-vehicle', protect, authorize('LOGISTICS', 'ADMIN'), assignVehicleToOrder);
router.post('/verify-pickup', protect, authorize('LOGISTICS', 'ADMIN'), verifyPickupQR);
router.post('/verify-delivery', protect, authorize('LOGISTICS', 'ADMIN'), verifyDeliveryPOD);
router.get('/telemetry', protect, authorize('LOGISTICS', 'ADMIN'), getFleetTelemetry);

module.exports = router;

