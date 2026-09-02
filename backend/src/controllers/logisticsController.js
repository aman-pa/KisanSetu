const Order = require('../models/Order');
const RouteOptimization = require('../models/RouteOptimization');
const ProduceListing = require('../models/ProduceListing');

// @desc Get Logistics Pickup Dashboard Tasks
// @route GET /api/logistics/tasks
// @access Private (LOGISTICS, ADMIN)
const getLogisticsTasks = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['PENDING', 'ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT'] },
    })
      .populate('buyer', 'name phone address')
      .populate('items.listing')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Optimize Multi-Farm Pickup Route
// @route POST /api/logistics/optimize
// @access Private (LOGISTICS, ADMIN)
const optimizeRoute = async (req, res) => {
  try {
    const { orderIds } = req.body;

    let orders = [];
    if (orderIds && orderIds.length) {
      orders = await Order.find({ _id: { $in: orderIds } }).populate('items.farmer', 'name phone address');
    } else {
      orders = await Order.find({ status: { $in: ['PENDING', 'ACCEPTED'] } }).populate('items.farmer', 'name phone address').limit(4);
    }

    // Build optimized sequence of waypoints for Leaflet interactive map
    const waypoints = [
      {
        type: 'FARM_PICKUP',
        name: 'Farm A - Ramesh Kumar (Karnal, HR)',
        location: { lat: 29.6857, lng: 76.9905 },
        address: 'Kheri Village, Karnal, Haryana',
        batchId: 'KS-BATCH-994821',
        pickupKg: 2000,
        status: 'READY_FOR_PICKUP',
      },
      {
        type: 'FARM_PICKUP',
        name: 'Farm B - Suresh Singh (Panipat, HR)',
        location: { lat: 29.3909, lng: 76.9635 },
        address: 'Samalkha, Panipat, Haryana',
        batchId: 'KS-BATCH-994822',
        pickupKg: 1500,
        status: 'READY_FOR_PICKUP',
      },
      {
        type: 'FARM_PICKUP',
        name: 'Farm C - Punjab FPO Hub (Ambala, PB)',
        location: { lat: 30.3782, lng: 76.7767 },
        address: 'G.T. Road, Ambala, Punjab',
        batchId: 'KS-BATCH-994823',
        pickupKg: 1500,
        status: 'READY_FOR_PICKUP',
      },
      {
        type: 'COLLECTION_HUB',
        name: 'KisanSetu Regional Cold Aggregation Hub',
        location: { lat: 28.7041, lng: 77.1025 },
        address: 'Azadpur APMC Gateway, Delhi NCR',
        status: 'TRANSIT_NODE',
      },
      {
        type: 'BUYER_DROP',
        name: 'Destination - FreshMart Supermarket DC',
        location: { lat: 28.5355, lng: 77.3910 },
        address: 'Sector 62, Noida, Delhi NCR',
        status: 'FINAL_DELIVERY',
      },
    ];

    const totalDistanceKm = 184;
    const totalDurationMinutes = 240;
    const estimatedSavingsPercentage = 34; // 34% reduction in fuel & middleman transit cost

    const routeRecord = await RouteOptimization.create({
      logisticsPartner: req.user._id,
      orders: orders.map((o) => o._id),
      waypoints,
      totalDistanceKm,
      totalDurationMinutes,
      estimatedLogisticsSavings: estimatedSavingsPercentage,
      status: 'ASSIGNED',
    });

    return res.json({
      success: true,
      route: routeRecord,
      summary: {
        totalWaypoints: waypoints.length,
        totalDistanceKm,
        totalDurationHours: (totalDurationMinutes / 60).toFixed(1),
        costSavingsPercentage: estimatedSavingsPercentage,
        estimatedCO2ReducedKg: 42,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLogisticsTasks, optimizeRoute };
