const express = require('express');
const { placeOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/', protect, getOrders);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
