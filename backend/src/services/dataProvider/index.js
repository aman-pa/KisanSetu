/**
 * dataProvider/index.js
 * Central registry and factory for agricultural data providers.
 */

const { MarketDataProvider, DATA_SOURCES } = require('./MarketDataProvider');
const AgmarknetProvider = require('./AgmarknetProvider');
const SeededDataProvider = require('./SeededDataProvider');

// Default singleton instance
const seededProvider = new SeededDataProvider();
const agmarknetProvider = new AgmarknetProvider();

// Active provider router (defaults to SeededDataProvider unless live credentials are authenticated)
const getActiveProvider = () => {
  if (agmarknetProvider.isConfigured()) {
    return agmarknetProvider;
  }
  return seededProvider;
};

module.exports = {
  MarketDataProvider,
  DATA_SOURCES,
  AgmarknetProvider,
  SeededDataProvider,
  seededProvider,
  agmarknetProvider,
  getActiveProvider,
};
