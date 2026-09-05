/**
 * actionRecommendationEngine.js
 * Core decision-support and gross value estimation engine for Farmer Actions.
 * 
 * Reuses Phase 3 Price Intelligence signals and Phase 2 Demand Forecasts without duplicating models.
 */

const { evaluateActionRisk } = require('./actionRisk');
const { buildActionExplanations } = require('./actionExplanation');

/**
 * Synthesizes farmer context, price intelligence, and forecast signals into a personalized action payload.
 * 
 * @param {Object} params
 * @param {Object} params.farmerContext - { commodity, mandi, quantity, unit, quantityInQuintals, expectedSellingDate }
 * @param {Object} params.priceRec - Phase 3 selling recommendation result
 * @param {Object} params.bestMandiData - Phase 3 best mandi comparison result
 * @param {Object} params.forecastData - Phase 2 demand forecast result
 * @returns {Object} Complete Farmer Action payload
 */
function determineFarmerAction({
  farmerContext,
  priceRec,
  bestMandiData = null,
  forecastData = null,
}) {
  const { commodity, mandi, quantity, unit, quantityInQuintals, expectedSellingDate } = farmerContext;

  // 1. Insufficient Data Check
  if (!priceRec || !priceRec.signalsSummary || priceRec.signalsSummary.derived.totalHistoricalObservations < 3) {
    return {
      action: 'INSUFFICIENT_DATA',
      actionLabel: 'Insufficient Historical Data',
      signalStrength: 0,
      riskLevel: 'HIGH',
      commodity,
      mandi,
      quantity,
      unit,
      currentPrice: 0,
      estimatedGrossValue: 0,
      reasons: ['Fewer than 3 continuous daily market observations exist for this commodity and location.'],
      explanation: 'Historical market data is currently insufficient to compute a reliable decision recommendation.',
      alternativeAction: 'Refer to nearby major APMC terminal markets for benchmark pricing.',
      disclaimer: 'Decision support requires sufficient historical observation depth.',
      generatedAt: new Date().toISOString(),
    };
  }

  const { observed, derived } = priceRec.signalsSummary;
  const currentModalPrice = observed.currentModalPricePerQuintal;

  // 2. Quantity & Gross Value Estimation (Price/quintal * Quantity in quintals)
  const estimatedGrossValue = Math.round(currentModalPrice * quantityInQuintals);

  // 3. Multi-Mandi Arbitrage Evaluation
  let bestMandiOption = null;
  let hasSignificantMandiArbitrage = false;

  if (bestMandiData && bestMandiData.rankedMandis && bestMandiData.rankedMandis.length > 0) {
    const topMandi = bestMandiData.rankedMandis[0];
    const priceDiff = topMandi.modalPricePerQuintal - currentModalPrice;
    const priceDiffPercent = (priceDiff / (currentModalPrice + 1e-6)) * 100;
    const potentialGrossDiff = Math.round(priceDiff * quantityInQuintals);

    const isCurrentMandi = observed?.market
      ? topMandi.market.toLowerCase() === observed.market.toLowerCase()
      : topMandi.market.toLowerCase().includes(mandi.toLowerCase()) || mandi.toLowerCase().includes(topMandi.market.toLowerCase());

    bestMandiOption = {
      market: topMandi.market,
      district: topMandi.district,
      state: topMandi.state,
      modalPricePerQuintal: topMandi.modalPricePerQuintal,
      priceDifferencePerQuintal: Math.round(priceDiff),
      priceDifferencePercent: Math.round(priceDiffPercent * 10) / 10,
      potentialGrossDifference: potentialGrossDiff,
      rankingRationale: topMandi.rankingRationale,
      isAlternativeToCurrent: !isCurrentMandi,
      note: 'Price comparison reflects mandi auction spreads. Does not deduct individual transport or logistics costs.',
    };

    // If alternative mandi offers >= 8% premium and >= ₹50/q difference
    if (bestMandiOption.isAlternativeToCurrent && priceDiffPercent >= 8.0 && priceDiff >= 50) {
      hasSignificantMandiArbitrage = true;
    }
  }

  // 4. Primary Action Determination
  const baseScore = priceRec.score ?? 0;
  let action = 'STABLE_EQUILIBRIUM';
  let actionLabel = 'Market in Equilibrium';
  let badgeColor = 'emerald';

  if (hasSignificantMandiArbitrage && baseScore > -15) {
    // If there is significant regional arbitrage and local prices aren't in a severe peak
    action = 'COMPARE_MANDIS';
    actionLabel = 'Compare Mandis for Higher Realization';
    badgeColor = 'purple';
  } else if (baseScore >= 20.0) {
    action = 'WAIT';
    actionLabel = 'Hold Produce (Wait for Upside)';
    badgeColor = 'blue';
  } else if (baseScore >= 8.0) {
    action = 'CONSIDER_WAITING';
    actionLabel = 'Consider Staggered Holding';
    badgeColor = 'cyan';
  } else if (baseScore <= -20.0) {
    action = 'SELL_NOW';
    actionLabel = 'Sell Produce Now';
    badgeColor = 'amber';
  } else if (baseScore <= -8.0) {
    action = 'CONSIDER_SELLING';
    actionLabel = 'Consider Selling / Stagger Lots';
    badgeColor = 'orange';
  } else {
    action = 'STABLE_EQUILIBRIUM';
    actionLabel = 'Market in Equilibrium';
    badgeColor = 'emerald';
  }

  // 5. Heuristic Signal Strength (0-100)
  const absScore = Math.abs(baseScore);
  const signalStrength = Math.min(100, Math.max(15, Math.round(absScore * 2.2 + 15)));

  // 6. Risk Assessment
  const riskAssessment = evaluateActionRisk(derived, priceRec.forecastSignal);

  // 7. Explanations & Reason Codes
  const explanations = buildActionExplanations({
    action,
    farmerContext,
    signals: priceRec.signalsSummary,
    riskAssessment,
    bestMandiOption,
  });

  // 8. Forward Action Timeline (Today -> 7d -> 15d -> 30d)
  const forecastTrend = priceRec.forecastSignal?.growthPercent ?? 0;
  const timeline = [
    {
      period: 'Today (Spot)',
      expectedStatus: 'Current Market Snapshot',
      modalPricePerQuintal: currentModalPrice,
      estimatedGrossValue,
      signal: priceRec.priceTrendLabel,
    },
    {
      period: 'In 7 Days',
      expectedStatus: forecastTrend >= 2.0 ? 'Projected Market Absorption Rising' : forecastTrend <= -2.0 ? 'Supply Influx Likely' : 'Stable Market Realization',
      projectedTrendPercent: forecastTrend,
      signal: forecastTrend >= 2.0 ? 'Bullish Holding Window' : forecastTrend <= -2.0 ? 'Soften Warning' : 'Equilibrium',
    },
    {
      period: 'In 15–30 Days',
      expectedStatus: 'Medium-Term Agricultural Cycle Horizon',
      signal: 'Monitor Regional Crop Arrivals & Weather Alerts',
    },
  ];

  return {
    action,
    actionLabel,
    badgeColor,
    signalStrength,
    signalStrengthLabel: signalStrength >= 75 ? 'HIGH_CONFIDENCE' : signalStrength >= 45 ? 'MODERATE_CONFIDENCE' : 'LOW_CONFIDENCE',
    riskLevel: riskAssessment.riskLevel,
    riskScore: riskAssessment.riskScore,
    riskSummary: riskAssessment.riskSummary,
    riskFactors: riskAssessment.riskFactors,

    // Farmer Context & Values
    commodity,
    mandi,
    district: observed.district,
    state: observed.state,
    quantity,
    unit,
    quantityInQuintals,
    expectedSellingDate,

    // Pricing & Value Estimation
    currentPrice: currentModalPrice,
    currentPricePerKg: observed.currentPricePerKg,
    priceUnit: '₹/Quintal',
    estimatedGrossValue,
    estimatedGrossValueFormatted: `₹${estimatedGrossValue.toLocaleString()}`,
    valueNote: 'Estimated gross market realization. Does not deduct individual farm-gate storage, packaging, or logistics expenses.',

    // Market Signals Context
    priceTrend: derived.priceTrendDirection,
    priceTrendLabel: derived.priceTrendLabel,
    priceDeviationFrom30dPercent: derived.priceDeviationFrom30dPercent,
    historicalAverage30d: derived.historicalAverage30d,
    arrivalPressure: derived.supplyPressure,
    arrivalPressureLabel: derived.supplyPressureLabel,
    arrivalChangePercent: derived.arrivalChangePercent,
    volatilityLevel: derived.volatilityLevel,
    volatilityCoeffPercent: derived.priceCoeffVariationPercent,

    // Data-Driven Reasons
    reasons: explanations.reasons,
    reasonCodes: explanations.reasonCodes,
    decisionSummary: explanations.decisionSummary,
    alternativeAction: explanations.alternativeAction,

    // Best Mandi Comparison for this Farmer
    bestMandi: bestMandiOption,

    // Action Timeline
    timeline,

    // Backtest Benchmark Performance (Zero-Leakage Historical)
    validationBenchmark: priceRec.validationBenchmark,

    // Provenance
    dataSource: observed.dataSource,
    historicalRecordsUsed: derived.totalHistoricalObservations,
    generatedAt: new Date().toISOString(),
    disclaimer:
      'Farmer Action Intelligence is an algorithmic decision-support tool. It does not provide guaranteed financial returns or legally binding price assurances.',
  };
}

module.exports = {
  determineFarmerAction,
};
