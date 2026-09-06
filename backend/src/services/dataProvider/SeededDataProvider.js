/**
 * SeededDataProvider.js
 * High-performance database provider querying MongoDB MarketPrice and CommodityArrival records.
 * Serves normalized agricultural data with statistical aggregation and transparent SEEDED_DEMO labeling.
 */

const MarketPrice = require('../../models/MarketPrice');
const CommodityArrival = require('../../models/CommodityArrival');
const { MarketDataProvider, DATA_SOURCES } = require('./MarketDataProvider');

class SeededDataProvider extends MarketDataProvider {
  constructor() {
    super('SeededDatabaseProvider', DATA_SOURCES.SEEDED_DEMO);
  }

  /**
   * Query historical mandi prices with filters, pagination, and statistical rollups.
   */
  async getHistoricalPrices(query = {}) {
    const filter = {};

    if (query.commodity) {
      filter.commodity = { $regex: new RegExp(`^${query.commodity.trim()}$`, 'i') };
    }
    if (query.state) {
      filter.state = { $regex: new RegExp(`^${query.state.trim()}$`, 'i') };
    }
    if (query.district) {
      filter.district = { $regex: new RegExp(`^${query.district.trim()}$`, 'i') };
    }
    if (query.market) {
      filter.market = { $regex: new RegExp(`^${query.market.trim()}$`, 'i') };
    }

    if (query.from || query.to) {
      filter.arrivalDate = {};
      if (query.from) {
        const fromDate = new Date(query.from);
        if (!isNaN(fromDate.getTime())) {
          fromDate.setHours(0, 0, 0, 0);
          filter.arrivalDate.$gte = fromDate;
        }
      }
      if (query.to) {
        const toDate = new Date(query.to);
        if (!isNaN(toDate.getTime())) {
          toDate.setHours(23, 59, 59, 999);
          filter.arrivalDate.$lte = toDate;
        }
      }
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      MarketPrice.find(filter)
        .sort({ arrivalDate: -1, commodity: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MarketPrice.countDocuments(filter),
    ]);

    // Compute statistical summary over the filtered dataset
    const statsAggregation = await MarketPrice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          avgModalPrice: { $avg: '$modalPrice' },
          minObserved: { $min: '$minPrice' },
          maxObserved: { $max: '$maxPrice' },
          earliestDate: { $min: '$arrivalDate' },
          latestDate: { $max: '$arrivalDate' },
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = statsAggregation[0] || {
      avgModalPrice: 0,
      minObserved: 0,
      maxObserved: 0,
      earliestDate: null,
      latestDate: null,
      count: 0,
    };

    return {
      records: records.map((r) => ({
        ...r,
        modalPricePerKg: Math.round((r.modalPrice / 100) * 100) / 100,
        minPricePerKg: Math.round((r.minPrice / 100) * 100) / 100,
        maxPricePerKg: Math.round((r.maxPrice / 100) * 100) / 100,
        source: r.source || DATA_SOURCES.SEEDED_DEMO,
        isSynthetic: r.isSynthetic !== undefined ? r.isSynthetic : true,
        isLive: false,
      })),
      statistics: {
        totalRecords: total,
        avgModalPrice: Math.round(stats.avgModalPrice || 0),
        avgModalPricePerKg: Math.round(((stats.avgModalPrice || 0) / 100) * 100) / 100,
        minObservedPrice: stats.minObserved || 0,
        maxObservedPrice: stats.maxObserved || 0,
        earliestDate: stats.earliestDate,
        latestDate: stats.latestDate,
      },
      metadata: {
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        source: DATA_SOURCES.SEEDED_DEMO,
        isSynthetic: true,
        isLive: false,
        provider: this.providerName,
        disclaimer: 'Curated agricultural demo market dataset for SIH 2026 prototyping and ML model validation.',
        retrievedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Get latest modal price snapshots per commodity & market with trend indicators.
   */
  async getCurrentPrices(query = {}) {
    const match = {};
    if (query.commodity) {
      match.commodity = { $regex: new RegExp(`^${query.commodity.trim()}$`, 'i') };
    }
    if (query.state) {
      match.state = { $regex: new RegExp(`^${query.state.trim()}$`, 'i') };
    }
    if (query.district) {
      match.district = { $regex: new RegExp(`^${query.district.trim()}$`, 'i') };
    }
    if (query.market) {
      match.market = { $regex: new RegExp(`^${query.market.trim()}$`, 'i') };
    }

    // Aggregation to find the most recent record per (commodity, state, district, market)
    const snapshots = await MarketPrice.aggregate([
      { $match: match },
      { $sort: { arrivalDate: -1 } },
      {
        $group: {
          _id: {
            commodity: '$commodity',
            state: '$state',
            district: '$district',
            market: '$market',
          },
          latestRecordId: { $first: '$_id' },
          commodity: { $first: '$commodity' },
          variety: { $first: '$variety' },
          grade: { $first: '$grade' },
          state: { $first: '$state' },
          district: { $first: '$district' },
          market: { $first: '$market' },
          arrivalDate: { $first: '$arrivalDate' },
          modalPrice: { $first: '$modalPrice' },
          minPrice: { $first: '$minPrice' },
          maxPrice: { $first: '$maxPrice' },
          unit: { $first: '$unit' },
          source: { $first: '$source' },
          isSynthetic: { $first: '$isSynthetic' },
          history: { $push: { arrivalDate: '$arrivalDate', modalPrice: '$modalPrice' } },
        },
      },
      { $sort: { commodity: 1, district: 1 } },
    ]);

    // Enhance snapshots with 7-day trend calculation
    const enrichedSnapshots = snapshots.map((s) => {
      const modalPerKg = Math.round((s.modalPrice / 100) * 100) / 100;
      let trend = 'STABLE';
      let change7d = 0;
      let changePercent = 0;

      if (s.history && s.history.length >= 2) {
        // Find record ~7 days prior
        const currentPrice = s.modalPrice;
        const prevPrice = s.history[1].modalPrice;
        change7d = currentPrice - prevPrice;
        changePercent = prevPrice > 0 ? Math.round(((currentPrice - prevPrice) / prevPrice) * 1000) / 10 : 0;

        if (changePercent > 3.0) trend = 'RISING';
        else if (changePercent < -3.0) trend = 'FALLING';
      }

      return {
        commodity: s.commodity,
        variety: s.variety,
        grade: s.grade,
        state: s.state,
        district: s.district,
        market: s.market,
        arrivalDate: s.arrivalDate,
        currentModalPrice: s.modalPrice,
        currentModalPricePerKg: modalPerKg,
        minPrice: s.minPrice,
        maxPrice: s.maxPrice,
        unit: s.unit,
        trend,
        change7d,
        changePercent,
        source: s.source || DATA_SOURCES.SEEDED_DEMO,
        isSynthetic: s.isSynthetic !== undefined ? s.isSynthetic : true,
        isLive: false,
      };
    });

    return {
      snapshots: enrichedSnapshots,
      metadata: {
        totalSnapshots: enrichedSnapshots.length,
        source: DATA_SOURCES.SEEDED_DEMO,
        isSynthetic: true,
        isLive: false,
        provider: this.providerName,
        retrievedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Query commodity arrival volume history.
   */
  async getArrivals(query = {}) {
    const filter = {};

    if (query.commodity) {
      filter.commodity = { $regex: new RegExp(`^${query.commodity.trim()}$`, 'i') };
    }
    if (query.state) {
      filter.state = { $regex: new RegExp(`^${query.state.trim()}$`, 'i') };
    }
    if (query.district) {
      filter.district = { $regex: new RegExp(`^${query.district.trim()}$`, 'i') };
    }
    if (query.market) {
      filter.market = { $regex: new RegExp(`^${query.market.trim()}$`, 'i') };
    }

    if (query.from || query.to) {
      filter.arrivalDate = {};
      if (query.from) {
        const fromDate = new Date(query.from);
        if (!isNaN(fromDate.getTime())) {
          fromDate.setHours(0, 0, 0, 0);
          filter.arrivalDate.$gte = fromDate;
        }
      }
      if (query.to) {
        const toDate = new Date(query.to);
        if (!isNaN(toDate.getTime())) {
          toDate.setHours(23, 59, 59, 999);
          filter.arrivalDate.$lte = toDate;
        }
      }
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const [arrivals, total] = await Promise.all([
      CommodityArrival.find(filter)
        .sort({ arrivalDate: -1, commodity: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CommodityArrival.countDocuments(filter),
    ]);

    const volumeAgg = await CommodityArrival.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalArrivalTonnes: { $sum: '$arrivalQuantity' },
          avgDailyArrivalTonnes: { $avg: '$arrivalQuantity' },
          count: { $sum: 1 },
        },
      },
    ]);

    const volStats = volumeAgg[0] || { totalArrivalTonnes: 0, avgDailyArrivalTonnes: 0, count: 0 };

    return {
      arrivals: arrivals.map((a) => ({
        ...a,
        source: a.source || DATA_SOURCES.SEEDED_DEMO,
        isSynthetic: a.isSynthetic !== undefined ? a.isSynthetic : true,
        isLive: false,
      })),
      statistics: {
        totalRecords: total,
        totalArrivalTonnes: Math.round(volStats.totalArrivalTonnes * 10) / 10,
        avgDailyArrivalTonnes: Math.round(volStats.avgDailyArrivalTonnes * 10) / 10,
      },
      metadata: {
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        source: DATA_SOURCES.SEEDED_DEMO,
        isSynthetic: true,
        isLive: false,
        provider: this.providerName,
        retrievedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Compute regional supply deficit/surplus indicators.
   */
  async getRegionalSupplyIndicators(query = {}) {
    const match = {};
    if (query.commodity) {
      match.commodity = { $regex: new RegExp(`^${query.commodity.trim()}$`, 'i') };
    }
    if (query.district) {
      match.district = { $regex: new RegExp(`^${query.district.trim()}$`, 'i') };
    }
    if (query.state) {
      match.state = { $regex: new RegExp(`^${query.state.trim()}$`, 'i') };
    }

    const now = new Date();
    const past7Days = new Date(now.getTime() - 7 * 86400000);
    const past30Days = new Date(now.getTime() - 30 * 86400000);

    // Group arrivals by commodity & district to compute 7d vs 30d volume velocity
    const indicatorsAgg = await CommodityArrival.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            commodity: '$commodity',
            district: '$district',
            state: '$state',
          },
          totalArrivals: { $sum: '$arrivalQuantity' },
          recent7dArrivals: {
            $sum: {
              $cond: [{ $gte: ['$arrivalDate', past7Days] }, '$arrivalQuantity', 0],
            },
          },
          past30dArrivals: {
            $sum: {
              $cond: [{ $gte: ['$arrivalDate', past30Days] }, '$arrivalQuantity', 0],
            },
          },
          activeMarkets: { $addToSet: '$market' },
          latestArrivalDate: { $max: '$arrivalDate' },
        },
      },
      { $sort: { '_id.commodity': 1, '_id.district': 1 } },
    ]);

    const indicators = indicatorsAgg.map((item) => {
      const avgWeeklyBaseline = (item.past30dArrivals / 30) * 7 || (item.totalArrivals / 60) * 7 || 100;
      const recent7d = item.recent7dArrivals;
      const ratio = avgWeeklyBaseline > 0 ? recent7d / avgWeeklyBaseline : 1.0;

      let supplyStatus = 'BALANCED';
      let statusScore = 50; // 0: severe deficit, 100: severe surplus

      if (ratio > 1.25) {
        supplyStatus = 'SURPLUS';
        statusScore = Math.min(100, Math.round(50 + (ratio - 1) * 50));
      } else if (ratio < 0.75) {
        supplyStatus = 'DEFICIT';
        statusScore = Math.max(0, Math.round(50 - (1 - ratio) * 50));
      } else {
        supplyStatus = 'BALANCED';
        statusScore = Math.round(50 + (ratio - 1) * 25);
      }

      return {
        commodity: item._id.commodity,
        district: item._id.district,
        state: item._id.state,
        supplyStatus,
        supplyIndexScore: statusScore,
        weeklyArrivalTonnes: Math.round(recent7d * 10) / 10,
        baselineWeeklyTonnes: Math.round(avgWeeklyBaseline * 10) / 10,
        ratioToBaseline: Math.round(ratio * 100) / 100,
        activeMarketsCount: item.activeMarkets.length,
        markets: item.activeMarkets,
        latestArrivalDate: item.latestArrivalDate,
        source: DATA_SOURCES.SEEDED_DEMO,
        isSynthetic: true,
        isLive: false,
      };
    });

    return {
      indicators,
      metadata: {
        totalRegionsAnalyzed: indicators.length,
        source: DATA_SOURCES.SEEDED_DEMO,
        isSynthetic: true,
        isLive: false,
        provider: this.providerName,
        computedAt: new Date().toISOString(),
      },
    };
  }
}

module.exports = SeededDataProvider;
