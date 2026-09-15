const express = require('express');
const { placeOrder, getOrders, getOrderById, payOrderEscrow, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, payOrderEscrow);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
