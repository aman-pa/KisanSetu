const User = require('../models/User');
const ProduceListing = require('../models/ProduceListing');
const Order = require('../models/Order');
const SystemConfig = require('../models/SystemConfig');
const DemandForecast = require('../models/DemandForecast');
const Dispute = require('../models/Dispute');

// @desc Get Admin Intelligence Dashboard Analytics
// @route GET /api/admin/dashboard
// @access Private (ADMIN)
const getAdminDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const farmersCount = await User.countDocuments({ role: 'FARMER' });
    const fposCount = await User.countDocuments({ role: 'FPO' });
    const buyersCount = await User.countDocuments({ role: 'BULK_BUYER' });
    const consumersCount = await User.countDocuments({ role: 'CONSUMER' });

    const totalListings = await ProduceListing.countDocuments();
    const activeListings = await ProduceListing.countDocuments({ status: 'AVAILABLE' });

    const orders = await Order.find();
    const totalOrders = orders.length;

    let totalTradedValue = 0;
    let totalProduceTradedKg = 0;
    orders.forEach((o) => {
      totalTradedValue += o.totalAmount || 0;
      o.items.forEach((item) => {
        totalProduceTradedKg += item.quantityKg || 0;
      });
    });

    // Get Consumer Max Purchase Limit Config
    const limitConfig = await SystemConfig.findOne({ key: 'CONSUMER_MAX_PURCHASE_LIMIT_KG' });
    const consumerMaxLimitKg = limitConfig ? Number(limitConfig.value) : 10;

    // Regional Surplus / Shortage Hotspots
    const surplusShortageAlerts = [
      {
        district: 'Karnal',
        state: 'Haryana',
        crop: 'Tomato',
        supplyTonnes: 40,
        demandTonnes: 25,
        differenceTonnes: 15,
        type: 'SURPLUS',
        recommendedRedistribution: 'Delhi NCR (6,300 kg shortage)',
        severity: 'MEDIUM',
      },
      {
        district: 'Delhi NCR',
        state: 'Delhi',
        crop: 'Tomato',
        supplyTonnes: 12.2,
        demandTonnes: 18.5,
        differenceTonnes: -6.3,
        type: 'SHORTAGE',
        recommendedRedistribution: 'Import from Karnal & Panipat',
        severity: 'HIGH',
      },
      {
        district: 'Jalandhar',
        state: 'Punjab',
        crop: 'Potato',
        supplyTonnes: 85,
        demandTonnes: 30,
        differenceTonnes: 55,
        type: 'SURPLUS',
        recommendedRedistribution: 'Redistribute to Jaipur & Mumbai',
        severity: 'HIGH',
      },
    ];

    return res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          farmers: farmersCount,
          fpos: fposCount,
          buyers: buyersCount,
          consumers: consumersCount,
        },
        produce: {
          totalListings,
          activeListings,
          totalProduceTradedKg,
        },
        financials: {
          totalTradedValue,
          estimatedIntermediarySavingsValue: Math.round(totalTradedValue * 0.28), // 28% saved by eliminating 4-5 middlemen layers
          estimatedSpoilageWastageReducedPercentage: 22,
        },
        orders: {
          total: totalOrders,
        },
        config: {
          consumerMaxPurchaseLimitKg: consumerMaxLimitKg,
        },
      },
      surplusShortageAlerts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update Consumer Max Purchase Limit (Admin Config)
// @route PUT /api/admin/config/purchase-limit
// @access Private (ADMIN)
const updatePurchaseLimit = async (req, res) => {
  try {
    const { maxLimitKg } = req.body;
    if (!maxLimitKg || isNaN(maxLimitKg) || Number(maxLimitKg) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid positive number for max limit in kg.' });
    }

    const updatedConfig = await SystemConfig.findOneAndUpdate(
      { key: 'CONSUMER_MAX_PURCHASE_LIMIT_KG' },
      { value: Number(maxLimitKg), description: 'Maximum allowed produce purchase per consumer order to prevent bulk cornering' },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      message: `Consumer max purchase limit updated to ${maxLimitKg} kg successfully!`,
      config: updatedConfig,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get All Platform Disputes
// @route GET /api/admin/disputes
// @access Private (ADMIN)
const getDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate('order')
      .populate('raisedBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: disputes.length, disputes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAdminDashboardStats, updatePurchaseLimit, getDisputes };
