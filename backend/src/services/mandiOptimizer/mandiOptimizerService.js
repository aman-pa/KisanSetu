/**
 * mandiOptimizerService.js
 * Core orchestration service for Net Realization & Mandi Optimizer in KisanSetu AI.
 * 
 * Integrates:
 * - Active Market Data Provider (Live Agmarknet / Seeded APMC)
 * - DistanceProvider (Geodesic + 1.25x Indian Road Circuity Factor)
 * - TransportCostModel (Vehicle-tiered freight estimation)
 * - NetRealizationEngine (Gross revenue, logistics deduction, multi-factor ranking)
 * - Transparent Data Provenance labeling
 */

const { getActiveProvider } = require('../dataProvider');
const { DistanceProvider, MANDI_COORDINATES } = require('./distanceProvider');
const { calculateTransportCost } = require('./transportCostModel');
const { validateOptimizerRequest } = require('./optimizerValidator');
const { computeCandidateEconomics, rankAndOptimizeMandis } = require('./netRealizationEngine');

class SimpleMemoryCache {
  constructor(ttlMs = 5 * 60 * 1000) {
    this.ttlMs = ttlMs;
    this.cache = new Map();
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttlMs,
    });
  }

  clear() {
    this.cache.clear();
  }
}

class MandiOptimizerService {
  constructor() {
    this.distanceProvider = new DistanceProvider();
    this.cache = new SimpleMemoryCache(10 * 60 * 1000); // 10-minute cache
  }

  /**
   * Generates cache key for optimizer parameters.
   */
  _buildCacheKey(params) {
    const lat = params.farmerLocation.lat.toFixed(3);
    const lng = params.farmerLocation.lng.toFixed(3);
    return `${params.commodity}_${params.quantityKg}_${lat}_${lng}_${params.maxDistanceKm}`;
  }

  /**
   * Fetches latest market price snapshots for the requested commodity.
   * Leverages getActiveProvider() (AgmarknetLiveProvider or SeededDataProvider).
   */
  async _fetchMarketSnapshots(commodity) {
    const provider = getActiveProvider();
    let result = null;

    try {
      result = await provider.getCurrentPrices({ commodity });
    } catch (err) {
      console.warn(`[MandiOptimizerService] Provider failed to fetch current prices: ${err.message}. Falling back to default baseline.`);
    }

    const snapshots = result?.snapshots || [];
    const metadata = result?.metadata || {
      source: 'SEEDED_DEMO',
      isSynthetic: true,
      isLive: false,
    };

    return { snapshots, metadata };
  }

  /**
   * Execute optimization for given farmer parameters.
   * 
   * @param {Object} rawParams - Request payload / query parameters
   * @param {Object} [options] - Optional overrides or bypassCache flag
   * @returns {Promise<Object>} Comprehensive optimization outcome
   */
  async optimize(rawParams, options = {}) {
    // 1. Validate & Normalize Inputs
    const params = validateOptimizerRequest(rawParams);

    // 2. Check Cache
    const cacheKey = this._buildCacheKey(params);
    if (!options.bypassCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return {
          ...cached,
          provenance: {
            ...cached.provenance,
            fromCache: true,
          },
        };
      }
    }

    // 3. Fetch Market Data Snapshots
    const { snapshots, metadata } = await this._fetchMarketSnapshots(params.commodity);

    // 4. Match snapshots with known APMC coordinates or directory
    let candidateMandis = [];

    if (snapshots.length > 0) {
      // Map live/seeded snapshots
      candidateMandis = snapshots.map((s) => ({
        market: s.market,
        district: s.district,
        state: s.state,
        pricePerKg: s.currentModalPricePerKg || (s.currentModalPrice ? s.currentModalPrice / 100 : 0),
        pricePerQuintal: s.currentModalPrice || 0,
        observationDate: s.arrivalDate,
        sourceType: metadata.source || s.source || 'SEEDED_DEMO',
        isFallback: metadata.isLive === false,
        trend: s.trend || 'STABLE',
        variety: s.variety || 'Standard',
        supplyStatus: 'BALANCED',
      }));
    }

    // If no candidate mandis found in current snapshots, query historical records from seeded provider
    if (candidateMandis.length === 0) {
      try {
        const { seededProvider } = require('../dataProvider');
        const histResult = await seededProvider.getHistoricalPrices({ commodity: params.commodity, limit: 100 });
        const records = histResult?.records || [];
        
        // Group by market to get latest verified record per mandi
        const marketMap = new Map();
        records.forEach((r) => {
          if (!marketMap.has(r.market)) {
            marketMap.set(r.market, r);
          }
        });

        candidateMandis = Array.from(marketMap.values()).map((r) => ({
          market: r.market,
          district: r.district,
          state: r.state,
          pricePerKg: r.modalPricePerKg || (r.modalPrice ? r.modalPrice / 100 : 0),
          pricePerQuintal: r.modalPrice || 0,
          observationDate: r.arrivalDate ? new Date(r.arrivalDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          sourceType: 'SEEDED_DEMO',
          isFallback: true,
          trend: 'STABLE',
          variety: r.variety || 'Standard',
          supplyStatus: 'BALANCED',
        }));
      } catch (fallbackErr) {
        console.warn(`[MandiOptimizerService] Fallback historical query error: ${fallbackErr.message}`);
      }
    }

    // 5. Compute Distances, Logistics Costs & Economics for each Candidate Mandi
    const evaluatedCandidates = [];

    for (const mandi of candidateMandis) {
      try {
        const distanceInfo = this.distanceProvider.calculateDistance(params.farmerLocation, mandi);

        // Filter out mandis beyond max search radius
        if (distanceInfo.distanceKm > params.maxDistanceKm) {
          continue;
        }

        const transportInfo = calculateTransportCost({
          distanceKm: distanceInfo.distanceKm,
          quantityKg: params.quantityKg,
          customConfig: rawParams.customLogisticsConfig || {},
        });

        const candidateEconomics = computeCandidateEconomics({
          mandi,
          quantityKg: params.quantityKg,
          distanceInfo,
          transportInfo,
          commodity: params.commodity,
        });

        evaluatedCandidates.push(candidateEconomics);
      } catch (calcErr) {
        console.warn(`[MandiOptimizerService] Skipping candidate mandi ${mandi.market}: ${calcErr.message}`);
      }
    }

    // If all candidates fell outside maxDistanceKm, recalculate with the closest mandi regardless of limit
    if (evaluatedCandidates.length === 0 && candidateMandis.length > 0) {
      for (const mandi of candidateMandis) {
        const distanceInfo = this.distanceProvider.calculateDistance(params.farmerLocation, mandi);
        const transportInfo = calculateTransportCost({
          distanceKm: distanceInfo.distanceKm,
          quantityKg: params.quantityKg,
        });
        const candidateEconomics = computeCandidateEconomics({
          mandi,
          quantityKg: params.quantityKg,
          distanceInfo,
          transportInfo,
          commodity: params.commodity,
        });
        evaluatedCandidates.push(candidateEconomics);
      }
    }

    if (evaluatedCandidates.length === 0) {
      throw new Error(`Unable to evaluate any candidate mandis for ${params.commodity}.`);
    }

    // 6. Rank and Optimize
    const optimizationResult = rankAndOptimizeMandis(evaluatedCandidates);

    // 7. Prepare Complete Response
    const responsePayload = {
      success: true,
      commodity: params.commodity,
      quantityKg: params.quantityKg,
      quantityQuintals: params.quantityQuintals,
      quantityTonnes: params.quantityTonnes,
      farmerLocation: params.farmerLocation,
      maxDistanceKm: params.maxDistanceKm,
      recommendedMandi: optimizationResult.recommendedMandi,
      baselineLocalMandi: optimizationResult.baselineLocalMandi,
      rankedAlternatives: optimizationResult.rankedAlternatives,
      summary: optimizationResult.summary,
      transportAssumptions: {
        vehicleTier: optimizationResult.recommendedMandi.vehicleTier,
        logisticsPricingModel: 'VEHICLE_TIERED_DISTANCE_WEIGHT_MODEL',
        roadCircuityFactor: 1.25,
        disclaimer: 'Logistics cost is an algorithmic estimate based on regional freight standards, not an active binding quote.',
      },
      provenance: {
        marketDataSource: metadata.source || 'SEEDED_DEMO',
        marketDataProvider: metadata.provider || 'ActiveMarketProvider',
        isMarketDataLive: Boolean(metadata.isLive),
        logisticsSource: 'ESTIMATED',
        distanceSource: 'ESTIMATED',
        calculatedAt: new Date().toISOString(),
        fromCache: false,
      },
    };

    // Store in cache
    this.cache.set(cacheKey, responsePayload);

    return responsePayload;
  }
}

// Singleton instance
const mandiOptimizerService = new MandiOptimizerService();

module.exports = {
  MandiOptimizerService,
  mandiOptimizerService,
};
