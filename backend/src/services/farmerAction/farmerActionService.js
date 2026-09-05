/**
 * farmerActionService.js
 * Primary service orchestrator for Phase 4 Farmer Action Intelligence.
 */

const { validateFarmerContext, SUPPORTED_COMMODITIES } = require('./farmerContextValidator');
const { determineFarmerAction } = require('./actionRecommendationEngine');
const {
  getSellingRecommendation,
  getBestMandiComparison,
  getPriceSignals,
} = require('../priceIntelligence/priceIntelligenceService');
const { generateDemandForecast } = require('../forecasting/forecastingService');

// In-process 10-minute caching layer
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Generates personalized, data-driven Farmer Action Recommendation.
 */
async function getFarmerActionRecommendation(rawParams = {}) {
  // 1. Validate Farmer Context
  const farmerContext = validateFarmerContext(rawParams);
  const { commodity, mandi, quantity, unit, expectedSellingDate } = farmerContext;

  const cacheKey = `action_${commodity}_${mandi}_${quantity}_${unit}_${expectedSellingDate || 'now'}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // 2. Query Phase 3 Selling Recommendation
  let priceRec = null;
  try {
    priceRec = await getSellingRecommendation({
      commodity,
      mandi,
      horizonDays: 7,
    });
  } catch (err) {
    console.warn(`[farmerActionService] Failed to fetch price recommendation for ${commodity} in ${mandi}:`, err.message);
  }

  // 3. Query Phase 3 Best Mandi Comparison
  let bestMandiData = null;
  try {
    bestMandiData = await getBestMandiComparison({ commodity });
  } catch (err) {
    console.warn(`[farmerActionService] Best mandi comparison skipped for ${commodity}:`, err.message);
  }

  // 4. Query Phase 2 Demand Forecast (optional enhancement)
  let forecastData = null;
  try {
    forecastData = await generateDemandForecast({
      commodity,
      district: priceRec?.district || mandi,
      horizon: 7,
    });
  } catch (err) {
    console.warn(`[farmerActionService] Demand forecast skipped:`, err.message);
  }

  // 5. Determine Personalized Farmer Action
  const actionResult = determineFarmerAction({
    farmerContext,
    priceRec,
    bestMandiData,
    forecastData,
  });

  const payload = {
    success: true,
    ...actionResult,
  };

  cache.set(cacheKey, {
    data: payload,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return payload;
}

/**
 * Returns available mandi choices and comparison statistics for a commodity.
 */
async function getMandiOptionsForFarmer({ commodity = 'Tomato' }) {
  const cleanCommodity = commodity.charAt(0).toUpperCase() + commodity.slice(1).toLowerCase();
  const mandiData = await getBestMandiComparison({ commodity: cleanCommodity });

  return {
    success: true,
    commodity: cleanCommodity,
    totalMandis: mandiData.totalMandisCompared,
    topMandi: mandiData.topRecommendedMandi,
    options: mandiData.rankedMandis.map((m) => ({
      market: m.market,
      district: m.district,
      state: m.state,
      modalPricePerQuintal: m.modalPricePerQuintal,
      pricePerKg: m.pricePerKg,
      currentArrivalTonnes: m.currentArrivalTonnes,
      supplyPressure: m.supplyPressureLabel,
      recommendation: m.recommendation,
      isTopPick: m.isTopPick,
      rankingRationale: m.rankingRationale,
    })),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generates multi-commodity action summary for the farmer's dashboard.
 */
async function getFarmerActionSummary({ mandi = 'Karnal', district = 'Karnal', state = 'Haryana' }) {
  const summaries = [];

  for (const crop of SUPPORTED_COMMODITIES) {
    try {
      const actionPayload = await getFarmerActionRecommendation({
        commodity: crop,
        mandi,
        district,
        state,
        quantity: 10,
        unit: 'quintal',
      });

      summaries.push({
        commodity: crop,
        action: actionPayload.action,
        actionLabel: actionPayload.actionLabel,
        badgeColor: actionPayload.badgeColor,
        signalStrength: actionPayload.signalStrength,
        riskLevel: actionPayload.riskLevel,
        currentPrice: actionPayload.currentPrice,
        estimatedGrossValue: actionPayload.estimatedGrossValue,
        decisionSummary: actionPayload.decisionSummary,
        bestAlternativeMandi: actionPayload.bestMandi?.market || 'Local Mandi',
        potentialGain: actionPayload.bestMandi?.potentialGrossDifference || 0,
      });
    } catch (err) {
      console.warn(`[Summary] Skipped crop ${crop}:`, err.message);
    }
  }

  return {
    success: true,
    mandi,
    district,
    state,
    totalCropsSummarized: summaries.length,
    commoditySummaries: summaries,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Returns raw observed and derived signals for farmer decision support.
 */
async function getFarmerActionSignals(params = {}) {
  const farmerContext = validateFarmerContext(params);
  const signalsResult = await getPriceSignals({
    commodity: farmerContext.commodity,
    mandi: farmerContext.mandi,
  });

  return {
    success: true,
    farmerContext,
    ...signalsResult,
  };
}

module.exports = {
  getFarmerActionRecommendation,
  getMandiOptionsForFarmer,
  getFarmerActionSummary,
  getFarmerActionSignals,
  SUPPORTED_COMMODITIES,
};
