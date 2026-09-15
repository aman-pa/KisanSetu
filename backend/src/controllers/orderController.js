const Order = require('../models/Order');
const ProduceListing = require('../models/ProduceListing');
const SystemConfig = require('../models/SystemConfig');
const BatchTraceability = require('../models/BatchTraceability');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc Place Order (Consumer or Bulk Aggregated Order)
// @route POST /api/orders
// @access Private
// @desc Place Order (Buy Request sent to Seller - No upfront payment)
// @route POST /api/orders
// @access Private
const placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, procurementRequestId } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Order items cannot be empty' });
    }

    // Validate availability and calculate item subtotals
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

      // Deduct available stock upon placing request
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

    const orderNumber = `KS-TICKET-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

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
      paymentStatus: 'UNPAID',
      procurementRequestRef: procurementRequestId || null,
      status: 'PENDING',
    });

    // Notify Farmers of incoming Buy Request
    for (const item of processedItems) {
      await Notification.create({
        recipient: item.farmer,
        title: 'New Buy Request Received! 📩',
        message: `Ticket #${orderNumber}: ${req.user.name} sent a request to buy ${item.quantityKg} kg of ${item.cropName}. Click to review & accept.`,
        type: 'ORDER',
        link: `/ticket/${order._id}`,
      });

      // Update Batch Traceability Timeline
      if (item.batchId) {
        await BatchTraceability.findOneAndUpdate(
          { batchId: item.batchId },
          {
            $push: {
              timeline: {
                stage: 'BUY_REQUESTED',
                timestamp: new Date(),
                actor: req.user.name,
                location: 'KisanSetu Order System',
                notes: `Buy Request Ticket #${orderNumber} submitted by ${req.user.name} (${item.quantityKg} kg). Awaiting Seller Acceptance.`,
              },
            },
          }
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: `Buy Request sent to Seller successfully! Ticket ID: ${orderNumber}`,
      order,
    });
  } catch (error) {
    console.error('Place order error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Single Order / Trade Ticket Details by ID
// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone address role profileDetails')
      .populate('items.listing', 'cropName grade images batchId category pricePerKg')
      .populate('items.farmer', 'name phone email address profileDetails');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Trade Ticket / Order not found' });
    }

    return res.json({ success: true, order });
  } catch (error) {
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
      .populate('buyer', 'name email phone address')
      .populate('items.listing', 'cropName grade images batchId')
      .populate('items.farmer', 'name phone email address profileDetails')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Pay Escrow & Confirm Order (After Seller Accepts Buy Request)
// @route PUT /api/orders/:id/pay
const payOrderEscrow = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone')
      .populate('items.farmer', 'name phone email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order Ticket not found' });
    }

    if (order.buyer.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this order' });
    }

    order.paymentStatus = 'PAID_ESCROW';
    order.paymentTransactionId = `TXN-ESCROW-${Date.now()}`;
    order.status = 'IN_TRANSIT';
    await order.save();

    // Notify Farmer of Escrow Payment Confirmation
    for (const item of order.items) {
      await Notification.create({
        recipient: item.farmer._id || item.farmer,
        title: 'Escrow Payment Secured! 💳',
        message: `Buyer ${req.user.name} paid ₹${order.totalAmount} for Ticket #${order.orderNumber}. Dispatch produce now.`,
        type: 'ORDER',
        link: `/ticket/${order._id}`,
      });
    }

    return res.json({
      success: true,
      message: 'Escrow Payment secured successfully! Produce is now in transit.',
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update Order Status (Accept, Decline, Deliver, Complete)
// @route PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findById(req.params.id).populate('buyer', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;

    // If Seller declines/cancels order, restore produce stock
    if (status === 'CANCELLED') {
      for (const item of order.items) {
        const listing = await ProduceListing.findById(item.listing);
        if (listing) {
          listing.availableQuantityKg += item.quantityKg;
          if (listing.status === 'SOLD_OUT') listing.status = 'AVAILABLE';
          await listing.save();
        }
      }
    }

    if (status === 'COMPLETED') {
      order.paymentStatus = 'RELEASED_TO_FARMER';
    }

    await order.save();

    // Notify Buyer of Status Update
    await Notification.create({
      recipient: order.buyer._id || order.buyer,
      title: status === 'ACCEPTED' ? 'Buy Request Accepted! 🎉' : `Order Status Updated: ${status}`,
      message:
        status === 'ACCEPTED'
          ? `Seller accepted your Buy Request (Ticket #${order.orderNumber})! You can now proceed to Pay & Confirm Escrow.`
          : `Order Ticket #${order.orderNumber} status changed to ${status}.`,
      type: 'ORDER',
      link: `/ticket/${order._id}`,
    });

    // Update batch timeline
    for (const item of order.items) {
      if (item.batchId) {
        let stageName = 'IN_TRANSIT';
        if (status === 'ACCEPTED') stageName = 'SELLER_ACCEPTED';
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
                location: `${order.deliveryAddress?.city || 'Market'}, ${order.deliveryAddress?.state || 'State'}`,
                notes: notes || `Order Ticket #${order.orderNumber} status updated to ${status}.`,
              },
            },
          }
        );
      }
    }

    return res.json({ success: true, message: `Order Ticket updated to ${status}`, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { placeOrder, getOrders, getOrderById, payOrderEscrow, updateOrderStatus };
