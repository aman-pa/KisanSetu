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
      status: 'CONFIRMED',
      logisticsStatus: 'PENDING',
      logisticsPartner: null,
      vehicleAssigned: null,
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
                stage: 'ORDER_PLACED',
                timestamp: new Date(),
                actor: req.user.name,
                location: 'KisanSetu Order Processing',
                notes: `Order #${orderNumber} confirmed with Escrow payment. Quantity reserved: ${item.quantityKg} kg. Logistics requirement created (PENDING).`,
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
      filter = {
        $or: [
          { logisticsPartner: req.user._id },
          { status: { $in: ['PENDING', 'CONFIRMED', 'ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT'] } },
        ],
      };
    }

    const orders = await Order.find(filter)
      .populate('buyer', 'name email phone')
      .populate('items.listing', 'cropName grade images batchId location')
      .populate('items.farmer', 'name phone email address profileDetails')
      .populate('logisticsPartner', 'name phone')
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
    const { status, notes, vehicleAssigned, vehicleNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const userIdStr = req.user._id.toString();
    const userRole = req.user.role;

    // Security & Authorization check
    const isBuyer = order.buyer?.toString() === userIdStr;
    const isFarmer = order.items && order.items.some((item) => item.farmer?.toString() === userIdStr);
    const isAssignedLogistics = order.logisticsPartner && order.logisticsPartner.toString() === userIdStr;
    const isLogistics = userRole === 'LOGISTICS';
    const isAdmin = userRole === 'ADMIN';

    if (isAdmin) {
      // Admins have full access to update status
    } else if (isFarmer) {
      // Farmers can accept or cancel their orders
      if (!['ACCEPTED', 'CANCELLED'].includes(status)) {
        return res.status(403).json({
          success: false,
          message: 'Farmers are only authorized to mark orders as ACCEPTED or CANCELLED.',
        });
      }
    } else if (isBuyer) {
      // Buyers can mark orders as COMPLETED (verified delivered) or DISPUTED/CANCELLED
      if (!['COMPLETED', 'DISPUTED', 'CANCELLED'].includes(status)) {
        return res.status(403).json({
          success: false,
          message: 'Buyers are only authorized to mark orders as COMPLETED or DISPUTED.',
        });
      }
    } else if (isLogistics) {
      // Logistics partner can accept unassigned orders or advance their assigned shipments
      if (order.logisticsPartner && !isAssignedLogistics) {
        return res.status(403).json({
          success: false,
          message: 'This delivery is assigned to another logistics carrier.',
        });
      }

      const logisticsAllowedStatuses = ['ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT', 'DELIVERED'];
      if (!logisticsAllowedStatuses.includes(status)) {
        return res.status(403).json({
          success: false,
          message: `Logistics partners can only update status to: ${logisticsAllowedStatuses.join(', ')}.`,
        });
      }

      // Automatically assign the logistics partner if claiming an unassigned shipment
      if (!order.logisticsPartner) {
        order.logisticsPartner = req.user._id;
      }

      // Allow optional vehicle assignment
      const assignedVehicle = vehicleAssigned || vehicleNumber;
      if (assignedVehicle) {
        order.vehicleAssigned = assignedVehicle;
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this order.',
      });
    }

    // Idempotent logistics requirement handling on transition to CONFIRMED
    if (status === 'CONFIRMED') {
      if (!order.logisticsStatus) {
        order.logisticsStatus = 'PENDING';
      }
    } else if (['ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT', 'DELIVERED'].includes(status)) {
      order.logisticsStatus = status;
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
        if (status === 'CONFIRMED') stageName = 'ORDER_PLACED';
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
                location: `${order.deliveryAddress?.city || 'Delhi'}, ${order.deliveryAddress?.state || 'Delhi'}`,
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
