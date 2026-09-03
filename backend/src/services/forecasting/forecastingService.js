/**
 * forecastingService.js
 * Comprehensive Agricultural Demand & Price Forecasting Service Layer.
 */

const axios = require('axios');
const MarketPrice = require('../../models/MarketPrice');
const CommodityArrival = require('../../models/CommodityArrival');
const DemandForecast = require('../../models/DemandForecast');
const { deriveDemandFeatures } = require('./featureEngineering');
const { HybridAdaptiveForecastingModel } = require('./forecastingModel');
const { validateForecastingPerformance } = require('./forecastValidator');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const forecastCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const SUPPORTED_COMMODITIES = ['Tomato', 'Potato', 'Onion', 'Wheat', 'Rice', 'Apple'];
const SUPPORTED_HORIZONS = [7, 15, 30];

/**
 * Fetches and aggregates raw daily time series from database.
 */
async function fetchDailyTimeSeries(commodity, district) {
  const query = { commodity };
  if (district) {
    query.district = district;
  }

  let prices = await MarketPrice.find(query).sort({ arrivalDate: 1 }).lean();
  let arrivals = await CommodityArrival.find(query).sort({ arrivalDate: 1 }).lean();

  if (prices.length < 7) {
    prices = await MarketPrice.find({ commodity }).sort({ arrivalDate: 1 }).lean();
    arrivals = await CommodityArrival.find({ commodity }).sort({ arrivalDate: 1 }).lean();
  }

  if (prices.length === 0) {
    return [];
  }

  const dailyMap = new Map();
  prices.forEach((p) => {
    const dStr = new Date(p.arrivalDate).toISOString().slice(0, 10);
    if (!dailyMap.has(dStr)) {
      dailyMap.set(dStr, { date: dStr, modalPrices: [], arrivalQuantities: [], isSynthetic: p.isSynthetic });
    }
    dailyMap.get(dStr).modalPrices.push(p.modalPrice);
  });

  arrivals.forEach((a) => {
    const dStr = new Date(a.arrivalDate).toISOString().slice(0, 10);
    if (!dailyMap.has(dStr)) {
      dailyMap.set(dStr, { date: dStr, modalPrices: [], arrivalQuantities: [], isSynthetic: a.isSynthetic });
    }
    dailyMap.get(dStr).arrivalQuantities.push(a.arrivalQuantity);
  });

  const sortedDates = Array.from(dailyMap.keys()).sort();
  return sortedDates.map((dStr) => {
    const item = dailyMap.get(dStr);
    const avgPrice = item.modalPrices.length ? item.modalPrices.reduce((a, b) => a + b, 0) / item.modalPrices.length : 2500;
    const totalArrival = item.arrivalQuantities.length ? item.arrivalQuantities.reduce((a, b) => a + b, 0) : 100;
    return {
      date: dStr,
      modalPrice: Math.round(avgPrice),
      arrivalQuantity: Math.round(totalArrival * 10) / 10,
      isSynthetic: item.isSynthetic ?? true,
    };
  });
}

/**
 * Main Demand Forecast Generator
 */
async function generateDemandForecast({ commodity = 'Tomato', district, mandi, state, horizon = 30, days }) {
  const cleanCommodity = commodity.charAt(0).toUpperCase() + commodity.slice(1).toLowerCase();
  const parsedHorizon = parseInt(days || horizon, 10);

  if (!SUPPORTED_COMMODITIES.includes(cleanCommodity)) {
    const error = new Error(`Unsupported commodity '${commodity}'. Supported: ${SUPPORTED_COMMODITIES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (!SUPPORTED_HORIZONS.includes(parsedHorizon)) {
    const error = new Error(`Invalid forecast horizon '${parsedHorizon}'. Supported horizons: 7, 15, 30 days.`);
    error.statusCode = 400;
    throw error;
  }

  const targetDistrict = district || mandi || 'Delhi NCR';
  const targetState = state || 'Delhi';
  const cacheKey = `demand_${cleanCommodity}_${targetDistrict}_${parsedHorizon}`;

  const cached = forecastCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // 1. Fetch & Engineer Features
  const rawSeries = await fetchDailyTimeSeries(cleanCommodity, district || mandi);
  if (rawSeries.length < 7) {
    const error = new Error(`Insufficient historical data points for ${cleanCommodity} in ${targetDistrict}.`);
    error.statusCode = 422;
    throw error;
  }

  const enrichedHistory = deriveDemandFeatures(rawSeries);

  // 2. Perform Out-of-Sample Validation Benchmark
  const backtest = validateForecastingPerformance(enrichedHistory, Math.min(15, parsedHorizon));

  // 3. Train Model & Forecast
  const model = new HybridAdaptiveForecastingModel();
  model.fit(enrichedHistory);

  const lastDate = enrichedHistory[enrichedHistory.length - 1].date;
  const forecastSeries = model.predict(lastDate, parsedHorizon);

  // 4. Compute Summary Analytics
  const pointPreds = forecastSeries.map((f) => f.predictedDemandTonnes);
  const hist14 = enrichedHistory.slice(-14);
  const histDailyAvg = hist14.reduce((sum, h) => sum + h.demandProxyTonnes, 0) / hist14.length;
  const predDailyAvg = pointPreds.reduce((sum, p) => sum + p, 0) / pointPreds.length;
  const totalPredDemand = pointPreds.reduce((sum, p) => sum + p, 0);

  const currentSupplyDaily = enrichedHistory.slice(-7).reduce((sum, h) => sum + h.arrivalQuantityTonnes, 0) / 7;
  const totalExpectedSupply = currentSupplyDaily * parsedHorizon;
  const demandGap = Math.round((totalPredDemand - totalExpectedSupply) * 10) / 10;
  const pctChange = Math.round(((predDailyAvg - histDailyAvg) / (histDailyAvg + 1e-6)) * 1000) / 10;

  let status = 'BALANCED';
  let recommendation = `Balanced market equilibrium projected in ${targetDistrict} for ${cleanCommodity} over next ${parsedHorizon} days.`;

  if (demandGap > 0.1 * totalExpectedSupply) {
    status = 'HIGH';
    recommendation = `High demand pressure (+${pctChange}%) projected in ${targetDistrict} for ${cleanCommodity} over next ${parsedHorizon} days. FPOs and farmers should aggregate lots to capture peak pricing.`;
  } else if (demandGap < -0.1 * totalExpectedSupply) {
    status = 'SURPLUS';
    recommendation = `Surplus supply inventory (${pctChange}%) projected in ${targetDistrict} for ${cleanCommodity} over next ${parsedHorizon} days. Producers advised to route surplus produce to deficit consuming mandis.`;
  }

  const forecastResult = {
    success: true,
    commodity: cleanCommodity,
    district: targetDistrict,
    mandi: targetDistrict,
    state: targetState,
    horizonDays: parsedHorizon,
    forecastHorizon: `${parsedHorizon} days`,
    timePeriod: `Next ${parsedHorizon} Days`,
    historicalDailyAvgTonnes: Math.round(histDailyAvg * 10) / 10,
    predictedDailyAvgTonnes: Math.round(predDailyAvg * 10) / 10,
    totalPredictedDemandTonnes: Math.round(totalPredDemand * 10) / 10,
    currentSupplyDailyAvgTonnes: Math.round(currentSupplyDaily * 10) / 10,
    demandGapTonnes: demandGap,
    demandStatus: status,
    trend: pctChange >= 1.0 ? 'increasing' : pctChange <= -1.0 ? 'decreasing' : 'stable',
    demandTrendPercentage: pctChange,
    recommendation,
    historicalSeries: enrichedHistory.slice(-14),
    forecastSeries,
    validationBenchmark: backtest,
    modelMetadata: {
      modelName: 'KisanSetu Hybrid Adaptive Time-Series Engine (Damped Holt Trend + Fourier Harmonics)',
      modelVersion: '2.0.0-phase2',
      dataPointsUsed: enrichedHistory.length,
      trainingDateRange: {
        start: enrichedHistory[0]?.date,
        end: enrichedHistory[enrichedHistory.length - 1]?.date,
      },
      validationMetrics: {
        inSampleMAE: model.inSampleMetrics.mae,
        inSampleRMSE: model.inSampleMetrics.rmse,
        inSampleWAPE: model.inSampleMetrics.wape,
        outOfSampleWAPE: backtest.metrics?.wape,
        unit: 'Tonnes',
      },
      confidenceIntervals: {
        supported: true,
        levels: ['80%', '95%'],
        method: 'Empirical In-Sample Residual Variance with sqrt(h) Horizon Scaling',
      },
      targetVariable: 'Heuristic Market Absorption & Pressure Proxy (Price-Adjusted Arrival Volume in Tonnes)',
      targetFormula: 'M_t = Arrival_t * (1 + 0.5 * (Price_t - RollingPrice30d) / RollingPrice30d)',
      isSynthetic: enrichedHistory[0]?.isSynthetic ?? true,
      dataProvenance: enrichedHistory[0]?.isSynthetic ? 'SEEDED_DEMO_AGMARKNET' : 'OBSERVED_APMC_FEED',
      disclaimer: 'Forecast is an algorithmic projection of mandi market absorption and buying pressure proxy. It does not represent direct retail consumer checkout ground truth.',
    },
    generatedAt: new Date().toISOString(),
  };

  // Persist snapshot to MongoDB
  try {
    await DemandForecast.findOneAndUpdate(
      { cropName: cleanCommodity, district: targetDistrict, timePeriod: `Next ${parsedHorizon} Days` },
      {
        cropName: cleanCommodity,
        district: targetDistrict,
        state: targetState,
        timePeriod: `Next ${parsedHorizon} Days`,
        historicalDemandKg: Math.round(forecastResult.historicalDailyAvgTonnes * 1000),
        predictedDemandKg: Math.round(forecastResult.predictedDailyAvgTonnes * 1000),
        currentSupplyKg: Math.round(forecastResult.currentSupplyDailyAvgTonnes * 1000),
        demandGapKg: Math.round(forecastResult.demandGapTonnes * 1000),
        status: forecastResult.demandStatus,
        recommendedAction: forecastResult.recommendation,
      },
      { upsert: true, new: true }
    );
  } catch (dbErr) {
    console.warn('[DemandForecast] DB save warning:', dbErr.message);
  }

  forecastCache.set(cacheKey, {
    data: forecastResult,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return forecastResult;
}

/**
 * Price Forecast Generator
 */
async function generatePriceForecast({ commodity = 'Tomato', district, mandi, horizon = 15, days }) {
  const cleanCommodity = commodity.charAt(0).toUpperCase() + commodity.slice(1).toLowerCase();
  const parsedHorizon = parseInt(days || horizon, 10);
  const targetDistrict = district || mandi || 'Delhi NCR';

  const rawSeries = await fetchDailyTimeSeries(cleanCommodity, targetDistrict);
  if (rawSeries.length < 7) {
    const error = new Error(`Insufficient price history for ${cleanCommodity}.`);
    error.statusCode = 422;
    throw error;
  }

  const recentPrices = rawSeries.slice(-14).map((r) => r.modalPrice);
  const currentPrice = recentPrices[recentPrices.length - 1];
  const avgPrice14 = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;

  const priceTrend = ((currentPrice - avgPrice14) / avgPrice14) * 100;
  const expectedMin = Math.round(currentPrice * 0.95);
  const expectedMax = Math.round(currentPrice * 1.12);

  return {
    success: true,
    commodity: cleanCommodity,
    district: targetDistrict,
    currentModalPricePerQuintal: currentPrice,
    currentPricePerKg: Math.round((currentPrice / 100) * 10) / 10,
    forecastHorizon: `${parsedHorizon} days`,
    expectedPriceRange: {
      minPerQuintal: expectedMin,
      maxPerQuintal: expectedMax,
      minPerKg: Math.round((expectedMin / 100) * 10) / 10,
      maxPerKg: Math.round((expectedMax / 100) * 10) / 10,
      unit: '₹',
    },
    priceTrendPercentage: Math.round(priceTrend * 10) / 10,
    priceDirection: priceTrend >= 1 ? 'BULLISH' : priceTrend <= -1 ? 'BEARISH' : 'STABLE',
    recommendation: priceTrend >= 1
      ? `Price momentum is upward for ${cleanCommodity}. Farmers advised to stagger release over next ${parsedHorizon} days for peak realization.`
      : `Stable pricing expected for ${cleanCommodity} in ${targetDistrict}.`,
    isSynthetic: rawSeries[0]?.isSynthetic ?? true,
    dataProvenance: rawSeries[0]?.isSynthetic ? 'SEEDED_DEMO_AGMARKNET' : 'OBSERVED_APMC_FEED',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Summary Forecast Generator (All Supported Commodities)
 */
async function generateForecastSummary({ district = 'Delhi NCR', state = 'Delhi' }) {
  const summaries = [];
  for (const crop of SUPPORTED_COMMODITIES) {
    try {
      const forecast = await generateDemandForecast({ commodity: crop, district, state, horizon: 7 });
      summaries.push({
        commodity: crop,
        predictedDailyAvgTonnes: forecast.predictedDailyAvgTonnes,
        demandStatus: forecast.demandStatus,
        demandTrendPercentage: forecast.demandTrendPercentage,
        modelAccuracy: `${(100 - forecast.modelMetadata.validationMetrics.inSampleWAPE).toFixed(1)}%`,
      });
    } catch (e) {
      console.warn(`Summary skip for ${crop}:`, e.message);
    }
  }

  return {
    success: true,
    district,
    state,
    horizon: '7 days',
    summaryCount: summaries.length,
    commoditySummaries: summaries,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  generateDemandForecast,
  generatePriceForecast,
  generateForecastSummary,
  SUPPORTED_COMMODITIES,
  SUPPORTED_HORIZONS,
};
