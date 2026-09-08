/**
 * netRealizationEngine.js
 * Economic Calculation and Multi-Factor Optimization Engine for KisanSetu.
 * 
 * Computes:
 * Gross Revenue = Quantity (kg) * Mandi Price (₹/kg)
 * Total Logistics Cost = Transport Cost + Loading/Toll Allowance
 * Net Realization = Gross Revenue - Total Logistics Cost
 * Net Realization Per Kg = Net Realization / Quantity (kg)
 * Net Advantage = Candidate Net Realization - Baseline Local Net Realization
 */

const { generateMandiExplanation } = require('./optimizerExplanation');

// Perishable commodities with higher spoilage risk over extended transit (> 180km)
const PERISHABLE_COMMODITIES = ['Tomato', 'Apple', 'Onion'];

/**
 * Calculates net realization and economic metrics for a single candidate mandi.
 * 
 * @param {Object} params
 * @param {Object} params.mandi - Mandi price record & metadata
 * @param {number} params.quantityKg - Canonical farmer quantity in kg
 * @param {Object} params.distanceInfo - Distance result from DistanceProvider
 * @param {Object} params.transportInfo - Cost breakdown from TransportCostModel
 * @param {string} params.commodity - Crop name
 * @returns {Object} Candidate economic profile
 */
function computeCandidateEconomics({ mandi, quantityKg, distanceInfo, transportInfo, commodity }) {
  // 1. Determine Price Per Kg
  let pricePerKg = 0;
  if (typeof mandi.pricePerKg === 'number' && mandi.pricePerKg > 0) {
    pricePerKg = mandi.pricePerKg;
  } else if (typeof mandi.modalPrice === 'number' && mandi.modalPrice > 0) {
    pricePerKg = mandi.modalPrice > 200 ? mandi.modalPrice / 100 : mandi.modalPrice;
  } else if (typeof mandi.pricePerQuintal === 'number' && mandi.pricePerQuintal > 0) {
    pricePerKg = mandi.pricePerQuintal / 100;
  } else if (typeof mandi.modal_price === 'number' && mandi.modal_price > 0) {
    pricePerKg = mandi.modal_price > 200 ? mandi.modal_price / 100 : mandi.modal_price;
  }

  pricePerKg = Number(pricePerKg.toFixed(2));
  const pricePerQuintal = Number((pricePerKg * 100).toFixed(2));

  // 2. Compute Revenues & Freight
  const grossRevenue = Math.round(quantityKg * pricePerKg);
  const estimatedLogisticsCost = transportInfo.estimatedTotalCost;
  const netRealization = grossRevenue - estimatedLogisticsCost;
  const netRealizationPerKg = Number((netRealization / quantityKg).toFixed(2));
  const logisticsCostPerKg = Number((estimatedLogisticsCost / quantityKg).toFixed(2));
  const logisticsPercentage = grossRevenue > 0 ? Number(((estimatedLogisticsCost / grossRevenue) * 100).toFixed(1)) : 0;

  // 3. Multi-factor score adjustment (for ranking tie-breaking)
  let scoreModifier = 0;

  // Supply / absorption modifier
  if (mandi.supplyStatus === 'DEFICIT' || mandi.supplyPressure === 'SUPPLY_SHORTAGE') {
    scoreModifier += 0.15;
  } else if (mandi.supplyStatus === 'BALANCED' || mandi.marketPressure === 'BALANCED' || (mandi.arrivalVolumeTonnes && mandi.arrivalVolumeTonnes > 50)) {
    scoreModifier += 0.08;
  }

  // Momentum modifier
  if (mandi.priceTrend === 'PRICE_TREND_UP' || mandi.trend === 'RISING') {
    scoreModifier += 0.10;
  } else if (mandi.priceTrend === 'PRICE_TREND_DOWN' || mandi.trend === 'FALLING') {
    scoreModifier -= 0.10;
  }

  // Perishable transit risk modifier
  const isPerishable = PERISHABLE_COMMODITIES.includes(commodity);
  if (isPerishable && distanceInfo.distanceKm > 180) {
    scoreModifier -= 0.15;
  }

  // Volatility modifier
  if (mandi.volatilityLevel === 'HIGH') {
    scoreModifier -= 0.08;
  }

  const compositeScore = Number((netRealizationPerKg + scoreModifier).toFixed(3));

  return {
    mandiId: mandi.id || mandi.mandiId || mandi.market,
    market: mandi.market || mandi.mandiName || mandi.name,
    district: mandi.district || '',
    state: mandi.state || '',
    commodity: commodity,
    variety: mandi.variety || 'Standard',
    
    // Price details
    pricePerKg,
    pricePerQuintal,
    observationDate: mandi.observationDate || mandi.arrival_date || new Date().toISOString().split('T')[0],
    priceProvenance: mandi.sourceType || mandi.priceProvenance || 'SEEDED_DEMO',
    priceSourceNotice: mandi.isFallback ? 'Fallback Seeded APMC Observation' : (mandi.sourceType === 'LIVE_EXTERNAL' ? 'Live Agmarknet Data' : 'Verified APMC Baseline'),

    // Distance & Logistics details
    distanceKm: distanceInfo.distanceKm,
    distanceSource: distanceInfo.distanceSource || 'ESTIMATED',
    estimatedLogisticsCost,
    logisticsCostPerKg,
    logisticsPercentage,
    vehicleTier: transportInfo.vehicleTier,
    logisticsBreakdown: transportInfo.breakdown,
    logisticsSource: 'ESTIMATED',

    // Financial Realization
    grossRevenue,
    netRealization,
    netRealizationPerKg,
    compositeScore,

    // Market Dynamics
    supplyStatus: mandi.supplyStatus || mandi.supplyPressure || 'BALANCED',
    priceTrend: mandi.priceTrend || mandi.trend || 'STABLE',
    arrivalVolumeTonnes: mandi.arrivalVolumeTonnes || mandi.arrivalVolume || 0,
    volatilityLevel: mandi.volatilityLevel || 'MODERATE',

    // Comparison placeholders (populated after all candidates are computed)
    rank: 0,
    isTopPick: false,
    isBaselineLocal: false,
    netAdvantageOverLocal: 0,
    netAdvantagePerKg: 0,
    distanceDeltaKm: 0,
    priceDeltaPerKg: 0,
    logisticsDeltaCost: 0,
    reasonCodes: [],
    keyHighlights: [],
    explanation: '',
  };
}

/**
 * Optimizes and ranks candidate mandis for a given farmer context.
 * 
 * @param {Array<Object>} candidateEconomics - List of computed candidate objects
 * @returns {Object} { recommendedMandi, baselineLocalMandi, rankedAlternatives, summary }
 */
function rankAndOptimizeMandis(candidateEconomics) {
  if (!candidateEconomics || candidateEconomics.length === 0) {
    throw new Error('No candidate mandis provided for optimization.');
  }

  // 1. Identify Baseline Local Mandi (closest mandi by distance)
  const sortedByDistance = [...candidateEconomics].sort((a, b) => a.distanceKm - b.distanceKm);
  const baselineLocal = sortedByDistance[0];
  baselineLocal.isBaselineLocal = true;

  // 2. Rank candidates primarily by Net Realization Per Kg (descending),
  // with compositeScore as secondary and distanceKm (ascending) as tertiary tie-breaker
  const ranked = [...candidateEconomics].sort((a, b) => {
    if (Math.abs(b.netRealizationPerKg - a.netRealizationPerKg) > 0.001) {
      return b.netRealizationPerKg - a.netRealizationPerKg;
    }
    if (Math.abs(b.compositeScore - a.compositeScore) > 0.001) {
      return b.compositeScore - a.compositeScore;
    }
    return a.distanceKm - b.distanceKm;
  });

  // 3. Assign Ranks, Comparative Deltas & Explanations
  ranked.forEach((candidate, index) => {
    candidate.rank = index + 1;
    candidate.isTopPick = index === 0;

    // Delta vs Baseline Local Mandi
    candidate.netAdvantageOverLocal = Math.round(candidate.netRealization - baselineLocal.netRealization);
    candidate.netAdvantagePerKg = Number((candidate.netRealizationPerKg - baselineLocal.netRealizationPerKg).toFixed(2));
    candidate.distanceDeltaKm = Number((candidate.distanceKm - baselineLocal.distanceKm).toFixed(1));
    candidate.priceDeltaPerKg = Number((candidate.pricePerKg - baselineLocal.pricePerKg).toFixed(2));
    candidate.logisticsDeltaCost = Math.round(candidate.estimatedLogisticsCost - baselineLocal.estimatedLogisticsCost);

    // Generate Reason Codes & Explanations
    const exp = generateMandiExplanation(candidate, baselineLocal, ranked);
    candidate.reasonCodes = exp.reasonCodes;
    candidate.keyHighlights = exp.keyHighlights;
    candidate.explanation = exp.explanation;
  });

  const recommendedMandi = ranked[0];

  return {
    recommendedMandi,
    baselineLocalMandi: baselineLocal,
    rankedAlternatives: ranked,
    summary: {
      totalMandisEvaluated: ranked.length,
      recommendedMarket: recommendedMandi.market,
      recommendedNetRealization: recommendedMandi.netRealization,
      recommendedNetPerKg: recommendedMandi.netRealizationPerKg,
      netAdvantageOverNearest: recommendedMandi.netAdvantageOverLocal,
      netAdvantagePerKgOverNearest: recommendedMandi.netAdvantagePerKg,
      isNearestMandiRecommended: recommendedMandi.market === baselineLocal.market,
      hasPositiveAdvantageOverNearest: recommendedMandi.netAdvantageOverLocal > 0,
    },
  };
}

module.exports = {
  computeCandidateEconomics,
  rankAndOptimizeMandis,
  PERISHABLE_COMMODITIES,
};
