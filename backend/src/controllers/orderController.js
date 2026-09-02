const Order = require('../models/Order');
const ProduceListing = require('../models/ProduceListing');
const SystemConfig = require('../models/SystemConfig');
const BatchTraceability = require('../models/BatchTraceability');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc Place Order (Consumer or Bulk Aggregated Order)
// @route POST /api/orders
// @access Private
const placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, procurementRequestId } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Order items cannot be empty' });
    }

    // 1. ADMIN CONFIGURABLE PURCHASE LIMIT VALIDATION FOR CONSUMERS
    if (req.user.role === 'CONSUMER') {
      const configDoc = await SystemConfig.findOne({ key: 'CONSUMER_MAX_PURCHASE_LIMIT_KG' });
      const maxLimitKg = configDoc ? Number(configDoc.value) : 10;

      const totalOrderedKg = items.reduce((sum, item) => sum + Number(item.quantityKg), 0);

      if (totalOrderedKg > maxLimitKg) {
        return res.status(400).json({
          success: false,
          errorType: 'PURCHASE_LIMIT_EXCEEDED',
          message: `Consumer purchase limit exceeded! You requested ${totalOrderedKg} kg, but consumer accounts are restricted to maximum ${maxLimitKg} kg per order to ensure fair distribution. For larger quantities, please register as a Bulk Buyer.`,
        });
      }
    }

    // 2. Validate availability and calculate item subtotals
    let totalProduceCost = 0;
    const processedItems = [];

    for (const item of items) {
      const listing = await ProduceListing.findById(item.listingId);
      if (!listing) {
        return res.status(404).json({ success: false, message: `Produce listing ${item.listingId} not found` });
      }

      if (listing.availableQuantityKg < item.quantityKg) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for crop '${listing.cropName}'. Requested: ${item.quantityKg} kg, Available: ${listing.availableQuantityKg} kg`,
        });
      }

      const subtotal = item.quantityKg * listing.pricePerKg;
      totalProduceCost += subtotal;

      processedItems.push({
        listing: listing._id,
        farmer: listing.farmer,
        cropName: listing.cropName,
        quantityKg: item.quantityKg,
        pricePerKg: listing.pricePerKg,
        subtotal,
        batchId: listing.batchId,
      });

      // Deduct available stock
      listing.availableQuantityKg -= item.quantityKg;
      if (listing.availableQuantityKg <= 0) {
        listing.status = 'SOLD_OUT';
      }
      await listing.save();
    }

    // Logistics & Platform fee calculation
    const logisticsCost = req.user.role === 'CONSUMER' ? 60 : Math.round(totalProduceCost * 0.05 + 500);
    const platformFee = Math.round(totalProduceCost * 0.02);
    const grandTotal = totalProduceCost + logisticsCost + platformFee;

    const orderNumber = `KS-ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await Order.create({
      orderNumber,
      buyer: req.user._id,
      buyerRole: req.user.role,
      items: processedItems,
      totalProduceCost,
      logisticsCost,
      platformFee,
      totalAmount: grandTotal,
      deliveryAddress: deliveryAddress || {
        street: req.user.address?.street || '123 Market Road',
        city: req.user.address?.city || 'Delhi',
        state: req.user.address?.state || 'Delhi',
        pincode: req.user.address?.pincode || '110001',
      },
      paymentStatus: 'PAID_ESCROW',
      paymentTransactionId: `TXN-SIMULATED-${Date.now()}`,
      procurementRequestRef: procurementRequestId || null,
      status: 'PENDING',
    });

    // Notify Farmers of new incoming orders
    for (const item of processedItems) {
      await Notification.create({
        recipient: item.farmer,
        title: 'New Order Received! 🛒',
        message: `Order #${orderNumber}: ${item.quantityKg} kg of ${item.cropName} ordered by ${req.user.name}.`,
        type: 'ORDER',
        link: `/farmer/orders`,
      });

      // Update Batch Traceability Timeline
      if (item.batchId) {
        await BatchTraceability.findOneAndUpdate(
          { batchId: item.batchId },
          {
            $push: {
              timeline: {
                stage: 'IN_TRANSIT',
                timestamp: new Date(),
                actor: req.user.name,
                location: 'KisanSetu Order Processing',
                notes: `Order #${orderNumber} confirmed with Escrow payment. Quantity reserved: ${item.quantityKg} kg.`,
              },
            },
          }
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully with simulated payment!',
      order,
    });
  } catch (error) {
    console.error('Place order error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Orders for User (Role-specific)
// @route GET /api/orders
const getOrders = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'CONSUMER' || req.user.role === 'BULK_BUYER') {
      filter = { buyer: req.user._id };
    } else if (req.user.role === 'FARMER') {
      filter = { 'items.farmer': req.user._id };
    } else if (req.user.role === 'LOGISTICS') {
      filter = { $or: [{ logisticsPartner: req.user._id }, { status: { $in: ['PENDING', 'ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT'] } }] };
    }

    const orders = await Order.find(filter)
      .populate('buyer', 'name email phone')
      .populate('items.listing', 'cropName grade images batchId')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update Order Status (Accept, Pickup, Deliver, Complete)
// @route PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    if (status === 'COMPLETED') {
      order.paymentStatus = 'RELEASED_TO_FARMER';
    }

    await order.save();

    // Update batch timeline
    for (const item of order.items) {
      if (item.batchId) {
        let stageName = 'IN_TRANSIT';
        if (status === 'DELIVERED') stageName = 'DELIVERED';
        if (status === 'COMPLETED') stageName = 'BUYER_VERIFIED';

        await BatchTraceability.findOneAndUpdate(
          { batchId: item.batchId },
          {
            $push: {
              timeline: {
                stage: stageName,
                timestamp: new Date(),
                actor: req.user.name,
                location: `${order.deliveryAddress.city}, ${order.deliveryAddress.state}`,
                notes: notes || `Order #${order.orderNumber} status updated to ${status}.`,
              },
            },
          }
        );
      }
    }

    return res.json({ success: true, message: `Order updated to ${status}`, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { placeOrder, getOrders, updateOrderStatus };
