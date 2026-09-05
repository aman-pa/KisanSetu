/**
 * AgmarknetLiveProvider.js
 * Production-ready external provider adapter for Indian Mandi Price & Arrival data (data.gov.in / Agmarknet).
 * Incorporates validation, normalization, in-memory TTL caching, and seamless fallback to SeededDataProvider.
 */

const axios = require('axios');
const { MarketDataProvider, DATA_SOURCES } = require('../MarketDataProvider');
const SimpleTtlCache = require('../cache/simpleTtlCache');
const MarketDataNormalizer = require('../normalization/marketDataNormalizer');

class AgmarknetLiveProvider extends MarketDataProvider {
  constructor(options = {}) {
    super('AgmarknetLiveProvider', DATA_SOURCES.LIVE_EXTERNAL);
    this.apiKey = options.apiKey || null;
    this.apiUrl = options.apiUrl || process.env.AGMARKNET_API_URL || 'https://api.data.gov.in/resource';
    this.resourceId = options.resourceId || process.env.AGMARKNET_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
    this.timeoutMs = options.timeoutMs || 8000;
    this.cache = new SimpleTtlCache(options.cacheTtlSeconds || 900); // 15 min cache
    this.lastSuccessfulFetch = null;
    this.lastFailure = null;
    this._seededFallback = null;
  }

  /**
   * Lazily acquire SeededDataProvider instance for graceful fallback.
   */
  getSeededFallback() {
    if (!this._seededFallback) {
      const SeededDataProvider = require('../SeededDataProvider');
      this._seededFallback = new SeededDataProvider();
    }
    return this._seededFallback;
  }

  /**
   * Dynamically resolve API key from instance options or environment variables.
   */
  getApiKey() {
    return this.apiKey || process.env.AGMARKNET_API_KEY || process.env.DATA_GOV_IN_API_KEY || null;
  }

  /**
   * Check if live Agmarknet API credentials are fully configured.
   */
  isConfigured() {
    const key = this.getApiKey();
    return Boolean(key && this.resourceId && key !== 'your_datagov_api_key_here');
  }

  /**
   * Return telemetry and connection health diagnostics (never exposing secret keys).
   */
  async getProviderStatus() {
    const configured = this.isConfigured();
    return {
      provider: this.providerName,
      isLive: configured,
      sourceType: configured ? DATA_SOURCES.LIVE_EXTERNAL : DATA_SOURCES.SEEDED_DEMO,
      status: configured ? (this.lastFailure ? 'DEGRADED_LIVE' : 'ACTIVE_CONFIGURED') : 'UNCONFIGURED_STANDBY',
      lastSuccessfulFetch: this.lastSuccessfulFetch,
      lastFailure: this.lastFailure,
      cacheStats: this.cache.getStats(),
      details: configured
        ? `Connected to live data.gov.in resource ${this.resourceId}`
        : 'API key not configured in environment. Seeded database provider actively serving APMC records.',
    };
  }

  /**
   * Fetch historical/filtered prices with validation, normalization, and TTL cache.
   */
  async getHistoricalPrices(query = {}) {
    if (!this.isConfigured()) {
      return this.getSeededFallback().getHistoricalPrices(query);
    }

    const cacheKey = SimpleTtlCache.makeKey('agmarknet_prices', query);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const params = {
        'api-key': this.getApiKey(),
        format: 'json',
        offset: ((Number(query.page) || 1) - 1) * (Number(query.limit) || 50),
        limit: Number(query.limit) || 50,
      };

      if (query.commodity) params['filters[commodity]'] = query.commodity;
      if (query.state) params['filters[state]'] = query.state;
      if (query.district) params['filters[district]'] = query.district;
      if (query.market) params['filters[market]'] = query.market;

      const response = await axios.get(`${this.apiUrl}/${this.resourceId}`, {
        params,
        timeout: this.timeoutMs,
      });

      const rawRecords = response.data?.records || [];
      const normalized = MarketDataNormalizer.normalizePrices(rawRecords, {
        source: DATA_SOURCES.LIVE_EXTERNAL,
        sourceTimestamp: new Date().toISOString(),
      });

      // Compute statistics
      const prices = normalized.records.map((r) => r.modalPrice);
      const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      const result = {
        records: normalized.records,
        statistics: {
          totalRecords: normalized.validCount,
          rejectedRecords: normalized.rejectedCount,
          avgModalPrice: avgPrice,
          avgModalPricePerKg: Number((avgPrice / 100).toFixed(2)),
          minObservedPrice: minPrice,
          maxObservedPrice: maxPrice,
          earliestDate: normalized.records[0]?.arrivalDate || null,
          latestDate: normalized.records[normalized.records.length - 1]?.arrivalDate || null,
        },
        metadata: {
          total: response.data?.total || normalized.validCount,
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 50,
          source: DATA_SOURCES.LIVE_EXTERNAL,
          isLive: true,
          isSynthetic: false,
          provider: this.providerName,
          retrievedAt: new Date().toISOString(),
        },
      };

      this.cache.set(cacheKey, result);
      this.lastSuccessfulFetch = new Date().toISOString();
      this.lastFailure = null;
      return result;
    } catch (err) {
      this.lastFailure = err.message;
      console.warn(`[AgmarknetLiveProvider Warning] Live query failed (${err.message}). Falling back to SeededDataProvider.`);
      return this.getSeededFallback().getHistoricalPrices(query);
    }
  }

  /**
   * Get latest modal price snapshots per commodity and market.
   * Returns structured { snapshots: [...], metadata: {...} } contract matching frontend expectation.
   */
  async getCurrentPrices(query = {}) {
    if (!this.isConfigured()) {
      return this.getSeededFallback().getCurrentPrices(query);
    }

    const cacheKey = SimpleTtlCache.makeKey('agmarknet_current', query);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const params = {
        'api-key': this.getApiKey(),
        format: 'json',
        limit: 50,
      };

      if (query.commodity) params['filters[commodity]'] = query.commodity;
      if (query.state) params['filters[state]'] = query.state;
      if (query.district) params['filters[district]'] = query.district;
      if (query.market) params['filters[market]'] = query.market;

      const response = await axios.get(`${this.apiUrl}/${this.resourceId}`, {
        params,
        timeout: this.timeoutMs,
      });

      const rawRecords = response.data?.records || [];
      const normalized = MarketDataNormalizer.normalizePrices(rawRecords, {
        source: DATA_SOURCES.LIVE_EXTERNAL,
        sourceTimestamp: new Date().toISOString(),
      });

      // Group records by market taking latest observation per market
      const marketMap = {};
      normalized.records.forEach((r) => {
        const key = `${r.market}_${r.commodity}`.toLowerCase();
        if (!marketMap[key] || new Date(r.arrivalDate) > new Date(marketMap[key].arrivalDate)) {
          marketMap[key] = r;
        }
      });

      const snapshots = Object.values(marketMap).map((r) => ({
        commodity: r.commodity,
        market: r.market,
        district: r.district,
        state: r.state,
        variety: r.variety,
        grade: r.grade,
        currentModalPrice: r.modalPrice,
        currentModalPricePerKg: r.modalPricePerKg,
        minPrice: r.minPrice,
        maxPrice: r.maxPrice,
        change7d: null, // Unfabricated: live snapshot does not invent unobserved historical delta
        changePercent: null,
        trend: 'LIVE_AUCTION',
        arrivalDate: r.arrivalDate,
        observationDate: r.arrivalDate,
        source: DATA_SOURCES.LIVE_EXTERNAL,
        isSynthetic: false,
        isLive: true,
      }));

      const result = {
        snapshots,
        count: snapshots.length,
        metadata: {
          total: snapshots.length,
          source: DATA_SOURCES.LIVE_EXTERNAL,
          isSynthetic: false,
          isLive: true,
          provider: this.providerName,
          retrievedAt: new Date().toISOString(),
        },
      };

      this.cache.set(cacheKey, result);
      this.lastSuccessfulFetch = new Date().toISOString();
      this.lastFailure = null;
      return result;
    } catch (err) {
      this.lastFailure = err.message;
      console.warn(`[AgmarknetLiveProvider Warning] getCurrentPrices failed (${err.message}). Falling back to SeededDataProvider.`);
      return this.getSeededFallback().getCurrentPrices(query);
    }
  }

  /**
   * Fetch arrival volumes. Falls back to SeededDataProvider if external arrivals series is unindexed.
   */
  async getArrivals(query = {}) {
    if (!this.isConfigured()) {
      return this.getSeededFallback().getArrivals(query);
    }
    // data.gov.in daily prices endpoint provides prices and arrival dates; volume series aggregates via seeded/historical db
    return this.getSeededFallback().getArrivals(query);
  }

  /**
   * Regional supply velocity indicators. Uses SeededDataProvider historical baselines.
   */
  async getRegionalSupplyIndicators(query = {}) {
    return this.getSeededFallback().getRegionalSupplyIndicators(query);
  }
}

module.exports = AgmarknetLiveProvider;
