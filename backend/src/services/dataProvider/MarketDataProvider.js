/**
 * MarketDataProvider.js
 * Base interface and abstraction layer for all agricultural market data providers.
 * Enforces clear source classification and strict contract integrity.
 */

const DATA_SOURCES = {
  LIVE_EXTERNAL: 'LIVE_EXTERNAL',
  SEEDED_DEMO: 'SEEDED_DEMO',
  SYNTHETIC_FALLBACK: 'SYNTHETIC_FALLBACK',
};

class MarketDataProvider {
  constructor(providerName, defaultSource = DATA_SOURCES.SEEDED_DEMO) {
    if (new.target === MarketDataProvider) {
      throw new TypeError('Cannot construct MarketDataProvider directly. Use a concrete provider.');
    }
    this.providerName = providerName;
    this.defaultSource = defaultSource;
  }

  /**
   * Fetch historical mandi price records with filtering, pagination, and statistical summary.
   * @param {Object} query - Filter parameters
   * @param {string} query.commodity - Required commodity name
   * @param {string} [query.state] - State filter
   * @param {string} [query.district] - District filter
   * @param {string} [query.market] - Specific market/mandi filter
   * @param {string|Date} [query.from] - Start arrival date
   * @param {string|Date} [query.to] - End arrival date
   * @param {number} [query.limit=50] - Number of records
   * @param {number} [query.page=1] - Page number
   * @returns {Promise<{ records: Array, metadata: Object }>}
   */
  async getHistoricalPrices(query) {
    throw new Error(`getHistoricalPrices() not implemented in ${this.providerName}`);
  }

  /**
   * Get latest modal price snapshot per commodity and district/market.
   * @param {Object} query - Filter parameters
   * @param {string} [query.commodity] - Optional commodity name
   * @param {string} [query.state] - State filter
   * @param {string} [query.district] - District filter
   * @param {string} [query.market] - Market filter
   * @returns {Promise<{ snapshots: Array, metadata: Object }>}
   */
  async getCurrentPrices(query) {
    throw new Error(`getCurrentPrices() not implemented in ${this.providerName}`);
  }

  /**
   * Fetch commodity arrival volume series.
   * @param {Object} query - Filter parameters
   * @param {string} query.commodity - Required commodity name
   * @param {string} [query.state] - State filter
   * @param {string} [query.district] - District filter
   * @param {string} [query.market] - Specific market filter
   * @param {string|Date} [query.from] - Start date
   * @param {string|Date} [query.to] - End date
   * @param {number} [query.limit=50] - Limit
   * @param {number} [query.page=1] - Page
   * @returns {Promise<{ arrivals: Array, metadata: Object }>}
   */
  async getArrivals(query) {
    throw new Error(`getArrivals() not implemented in ${this.providerName}`);
  }

  /**
   * Calculate regional supply and deficit/surplus indicators based on arrival velocity and moving averages.
   * @param {Object} query - Filter parameters
   * @param {string} [query.commodity] - Commodity name
   * @param {string} [query.district] - District filter
   * @param {string} [query.state] - State filter
   * @returns {Promise<{ indicators: Array, metadata: Object }>}
   */
  async getRegionalSupplyIndicators(query) {
    throw new Error(`getRegionalSupplyIndicators() not implemented in ${this.providerName}`);
  }

  /**
   * Check provider health, connectivity status, and authentication validity.
   * @returns {Promise<{ provider: string, isLive: boolean, status: string, details: string }>}
   */
  async getProviderStatus() {
    return {
      provider: this.providerName,
      isLive: this.defaultSource === DATA_SOURCES.LIVE_EXTERNAL,
      sourceType: this.defaultSource,
      status: 'READY',
      details: 'Provider abstraction initialized',
    };
  }
}

module.exports = {
  MarketDataProvider,
  DATA_SOURCES,
};
