/**
 * priceIntelligenceService.js
 * Comprehensive Service Orchestrator for Phase 3 Price Intelligence & Farmer Recommendations.
 */

const MarketPrice = require('../../models/MarketPrice');
const CommodityArrival = require('../../models/CommodityArrival');
const { generateDemandForecast } = require('../forecasting/forecastingService');
const { extractPriceSignals } = require('./priceSignals');
const { generateRecommendation } = require('./recommendationEngine');
const { rankMandisForCommodity } = require('./mandiComparison');
const { runRecommendationBacktest } = require('./priceIntelligenceValidator');

const SUPPORTED_COMMODITIES = [
  'Tomato',
  'Potato',
  'Onion',
  'Wheat',
  'Rice',
  'Apple',
  'Mustard',
  'Maize',
  'Soybean',
  'Cotton',
  'Sugarcane',
  'Banana',
  'Mango',
  'Green Chilli',
  'Garlic',
  'Ginger',
  'Turmeric',
  'Cauliflower',
  'Cabbage',
  'Brinjal',
  'Spinach',
  'Okra',
  'Carrot',
  'Capsicum',
  'Peas',
  'Cucumber',
  'Bitter Gourd',
  'Bottle Gourd',
  'Coriander',
  'Mint',
  'Groundnut',
  'Moong',
  'Urad',
  'Chana',
  'Arhar',
  'Masoor',
];
const SUPPORTED_HORIZONS = [7, 15, 30];

const COMMODITY_BASE_PRICES = {
  Tomato: 2200,
  Potato: 1600,
  Onion: 2800,
  Wheat: 2275,
  Rice: 3400,
  Apple: 7500,
  Mustard: 5450,
  Maize: 2090,
  Soybean: 4600,
  Cotton: 7120,
  Sugarcane: 350,
  Banana: 2200,
  Mango: 5500,
  'Green Chilli': 4200,
  Garlic: 9500,
  Ginger: 8200,
  Turmeric: 7800,
  Cauliflower: 1800,
  Cabbage: 1400,
  Brinjal: 1700,
  Spinach: 1600,
  Okra: 3200,
  Carrot: 2100,
  Capsicum: 4500,
  Peas: 4800,
  Cucumber: 1900,
  'Bitter Gourd': 3100,
  'Bottle Gourd': 1500,
  Coriander: 6500,
  Mint: 4200,
  Groundnut: 6377,
  Moong: 8558,
  Urad: 6950,
  Chana: 5440,
  Arhar: 7000,
  Masoor: 6425,
};

// In-process 10-minute caching layer
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Fetches daily time series for a specific commodity & market/district.
 */
async function fetchMarketDailySeries(commodity, marketOrDistrict) {
  const query = { commodity };
  if (marketOrDistrict) {
    query.$or = [{ market: marketOrDistrict }, { district: marketOrDistrict }];
  }

  let prices = await MarketPrice.find(query).sort({ arrivalDate: 1 }).lean();
  let arrivals = await CommodityArrival.find(query).sort({ arrivalDate: 1 }).lean();

  if (prices.length < 3) {
    prices = await MarketPrice.find({ commodity }).sort({ arrivalDate: 1 }).lean();
    arrivals = await CommodityArrival.find({ commodity }).sort({ arrivalDate: 1 }).lean();
  }

  if (prices.length < 3) {
    const basePrice = COMMODITY_BASE_PRICES[commodity] || 2500;
    const baseArrival = 100;
    const generated = [];
    const now = new Date();
    for (let i = 15; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dStr = d.toISOString().slice(0, 10);
      const variance = Math.sin(i / 2) * 0.06;
      const modal = Math.round(basePrice * (1 + variance));
      generated.push({
        date: dStr,
        modalPrice: modal,
        minPrice: Math.round(modal * 0.92),
        maxPrice: Math.round(modal * 1.08),
        arrivalQuantity: Math.round(baseArrival * (1 + variance * 0.4) * 10) / 10,
        market: marketOrDistrict || 'APMC Mandi',
        district: 'Regional District',
        state: 'Haryana',
        isSynthetic: true,
      });
    }
    return generated;
  }

  const dailyMap = new Map();
  prices.forEach((p) => {
    const dStr = new Date(p.arrivalDate).toISOString().slice(0, 10);
    if (!dailyMap.has(dStr)) {
      dailyMap.set(dStr, {
        date: dStr,
        modalPrices: [],
        minPrices: [],
        maxPrices: [],
        arrivalQuantities: [],
        market: p.market,
        district: p.district,
        state: p.state,
        isSynthetic: p.isSynthetic,
      });
    }
    dailyMap.get(dStr).modalPrices.push(p.modalPrice);
    if (p.minPrice) dailyMap.get(dStr).minPrices.push(p.minPrice);
    if (p.maxPrice) dailyMap.get(dStr).maxPrices.push(p.maxPrice);
  });

  arrivals.forEach((a) => {
    const dStr = new Date(a.arrivalDate).toISOString().slice(0, 10);
    if (!dailyMap.has(dStr)) {
      dailyMap.set(dStr, {
        date: dStr,
        modalPrices: [],
        minPrices: [],
        maxPrices: [],
        arrivalQuantities: [],
        market: a.market,
        district: a.district,
        state: a.state,
        isSynthetic: a.isSynthetic,
      });
    }
    dailyMap.get(dStr).arrivalQuantities.push(a.arrivalQuantity);
  });

  const sortedDates = Array.from(dailyMap.keys()).sort();
  return sortedDates.map((dStr) => {
    const item = dailyMap.get(dStr);
    const avgPrice = item.modalPrices.length
      ? item.modalPrices.reduce((a, b) => a + b, 0) / item.modalPrices.length
      : 2500;
    const avgMin = item.minPrices.length
      ? item.minPrices.reduce((a, b) => a + b, 0) / item.minPrices.length
      : Math.round(avgPrice * 0.92);
    const avgMax = item.maxPrices.length
      ? item.maxPrices.reduce((a, b) => a + b, 0) / item.maxPrices.length
      : Math.round(avgPrice * 1.08);
    const totalArr = item.arrivalQuantities.length
      ? item.arrivalQuantities.reduce((a, b) => a + b, 0)
      : 100;

    return {
      date: dStr,
      modalPrice: Math.round(avgPrice),
      minPrice: Math.round(avgMin),
      maxPrice: Math.round(avgMax),
      arrivalQuantity: Math.round(totalArr * 10) / 10,
      market: item.market || 'APMC Mandi',
      district: item.district || 'Delhi NCR',
      state: item.state || 'Delhi',
      isSynthetic: item.isSynthetic ?? true,
    };
  });
}

/**
 * Generates explainable Farmer Selling Recommendation (SELL / WAIT / CONSIDER WAITING).
 */
async function getSellingRecommendation({ commodity = 'Tomato', mandi, district, state, horizonDays = 7 }) {
  const cleanCommodity = commodity.charAt(0).toUpperCase() + commodity.slice(1).toLowerCase();
  const parsedHorizon = parseInt(horizonDays, 10) || 7;

  if (!SUPPORTED_COMMODITIES.includes(cleanCommodity)) {
    const error = new Error(`Unsupported commodity '${commodity}'. Supported: ${SUPPORTED_COMMODITIES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const targetMandi = mandi || district || 'Delhi NCR';
  const cacheKey = `rec_${cleanCommodity}_${targetMandi}_${parsedHorizon}`;

  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // 1. Fetch Historical Time Series
  const rawSeries = await fetchMarketDailySeries(cleanCommodity, targetMandi);
  if (rawSeries.length < 3) {
    const error = new Error(`Insufficient price history for ${cleanCommodity} in ${targetMandi}.`);
    error.statusCode = 422;
    throw error;
  }

  // 2. Extract Signals
  const signals = extractPriceSignals(rawSeries);

  // 3. Obtain Phase 2 Forecast Input Signal
  let forecastSignal = null;
  try {
    const fRes = await generateDemandForecast({
      commodity: cleanCommodity,
      district: signals.observed.district,
      horizon: parsedHorizon,
    });
    if (fRes?.success) {
      forecastSignal = fRes;
    }
  } catch (fErr) {
    console.warn('[priceIntelligence] Phase 2 forecast signal unavailable:', fErr.message);
  }

  // 4. Generate Recommendation
  const recResult = generateRecommendation(signals, forecastSignal, parsedHorizon);

  // 5. Run Out-of-Sample Historical Backtesting Validation
  const backtest = runRecommendationBacktest(rawSeries, parsedHorizon);

  const responsePayload = {
    success: true,
    commodity: cleanCommodity,
    market: signals.observed.market,
    district: signals.observed.district,
    state: signals.observed.state,
    evaluationHorizon: `${parsedHorizon} days`,
    ...recResult,
    signalsSummary: {
      observed: signals.observed,
      derived: signals.derived,
    },
    validationBenchmark: backtest,
    dataProvenance: signals.observed.dataSource,
    generatedAt: new Date().toISOString(),
  };

  cache.set(cacheKey, {
    data: responsePayload,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return responsePayload;
}

/**
 * Mandi Comparison & Ranking across all available APMC markets.
 */
async function getBestMandiComparison({ commodity = 'Tomato', state }) {
  const cleanCommodity = commodity.charAt(0).toUpperCase() + commodity.slice(1).toLowerCase();

  if (!SUPPORTED_COMMODITIES.includes(cleanCommodity)) {
    const error = new Error(`Unsupported commodity '${commodity}'. Supported: ${SUPPORTED_COMMODITIES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const cacheKey = `best_mandi_${cleanCommodity}_${state || 'all'}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // Fetch all records for commodity
  const query = { commodity: cleanCommodity };
  if (state) query.state = state;

  const prices = await MarketPrice.find(query).sort({ arrivalDate: 1 }).lean();
  const arrivals = await CommodityArrival.find(query).sort({ arrivalDate: 1 }).lean();

  if (prices.length === 0) {
    const error = new Error(`No market records available for ${cleanCommodity}.`);
    error.statusCode = 422;
    throw error;
  }

  // Group into mandi map
  const mandiSeriesMap = {};
  prices.forEach((p) => {
    const mName = p.market || p.district || 'Main Mandi';
    if (!mandiSeriesMap[mName]) mandiSeriesMap[mName] = [];
    mandiSeriesMap[mName].push({
      date: new Date(p.arrivalDate).toISOString().slice(0, 10),
      modalPrice: p.modalPrice,
      minPrice: p.minPrice,
      maxPrice: p.maxPrice,
      arrivalQuantity: 100, // default placeholder
      market: p.market,
      district: p.district,
      state: p.state,
      isSynthetic: p.isSynthetic,
    });
  });

  arrivals.forEach((a) => {
    const mName = a.market || a.district || 'Main Mandi';
    if (mandiSeriesMap[mName]) {
      const dStr = new Date(a.arrivalDate).toISOString().slice(0, 10);
      const match = mandiSeriesMap[mName].find((item) => item.date === dStr);
      if (match) {
        match.arrivalQuantity = a.arrivalQuantity;
      }
    }
  });

  const rankedMandis = rankMandisForCommodity(mandiSeriesMap, cleanCommodity);

  const payload = {
    success: true,
    commodity: cleanCommodity,
    stateFilter: state || 'All Regions',
    totalMandisCompared: rankedMandis.length,
    topRecommendedMandi: rankedMandis[0]?.market || 'N/A',
    topMandiPricePerQuintal: rankedMandis[0]?.modalPricePerQuintal || 0,
    rankedMandis,
    rankingMethodology:
      'Multi-factor scoring combining price realization premium (40%), price momentum (25%), supply saturation/glut risk (20%), and volatility stability (15%).',
    dataProvenance: prices[0]?.isSynthetic ? 'SEEDED_DEMO_AGMARKNET' : 'OBSERVED_APMC_FEED',
    generatedAt: new Date().toISOString(),
  };

  cache.set(cacheKey, {
    data: payload,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return payload;
}

/**
 * Returns raw observed and derived price signals for auditing & charting.
 */
async function getPriceSignals({ commodity = 'Tomato', mandi, district }) {
  const cleanCommodity = commodity.charAt(0).toUpperCase() + commodity.slice(1).toLowerCase();
  const targetMandi = mandi || district || 'Delhi NCR';

  const rawSeries = await fetchMarketDailySeries(cleanCommodity, targetMandi);
  if (rawSeries.length < 3) {
    const error = new Error(`Insufficient market data for ${cleanCommodity}.`);
    error.statusCode = 422;
    throw error;
  }

  const signals = extractPriceSignals(rawSeries);
  return {
    success: true,
    commodity: cleanCommodity,
    market: signals.observed.market,
    district: signals.observed.district,
    signals,
    historicalSeries: rawSeries.slice(-14),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Summary intelligence across all 6 commodities for dashboard widgets.
 */
async function getPriceIntelligenceSummary({ mandi, district, state }) {
  const summaries = [];
  for (const crop of SUPPORTED_COMMODITIES) {
    try {
      const rec = await getSellingRecommendation({
        commodity: crop,
        mandi,
        district,
        state,
        horizonDays: 7,
      });
      summaries.push({
        commodity: crop,
        currentModalPrice: rec.currentPrice,
        pricePerKg: rec.currentPricePerKg,
        priceTrend: rec.priceTrend,
        priceTrendLabel: rec.priceTrendLabel,
        recommendation: rec.recommendation,
        badgeColor: rec.badgeColor,
        score: rec.score,
        signalStrength: rec.signalStrength,
        primaryReason: rec.explanation[0] || rec.summaryText,
      });
    } catch (err) {
      console.warn(`[Summary] Skipped ${crop}:`, err.message);
    }
  }

  return {
    success: true,
    district: district || mandi || 'Delhi NCR',
    state: state || 'Delhi',
    summaryCount: summaries.length,
    commoditySummaries: summaries,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  getSellingRecommendation,
  getBestMandiComparison,
  getPriceSignals,
  getPriceIntelligenceSummary,
  SUPPORTED_COMMODITIES,
  SUPPORTED_HORIZONS,
};
