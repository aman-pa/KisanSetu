/**
 * recommendationEngine.js
 * Transparent, explainable decision-support engine for Farmer Selling Recommendations.
 * 
 * IMPORTANT METHODOLOGICAL NOTE:
 * - Scoring weights are explicit heuristic sensitivity parameters designed to balance
 *   price deviations, supply arrivals, and forecast momentum.
 * - They are NOT presented as learned neural weights.
 * - Every recommendation is explainable with dynamic reason codes and metric citations.
 */

// Explicit Heuristic Weights (Documented & Exposed in Metadata)
const HEURISTIC_WEIGHTS = {
  priceDeviation30dWeight: -1.2,  // Below baseline (+score, wait for recovery); Above baseline (-score, sell at peak)
  priceMomentum7dWeight: 1.5,     // Upward momentum (+score, wait to capture continuation)
  supplyPressureWeight: -0.8,     // Falling arrivals (+score, supply scarcity); Rising arrivals (-score, glut risk)
  forecastDemandWeight: 1.2,      // Bullish forecast (+score, positive market absorption)
  volatilityRiskPenaltyWeight: 0.5, // High volatility penalty for downside risk mitigation
};

/**
 * Generates an explainable Sell/Wait recommendation from extracted price signals and Phase 2 forecast.
 * 
 * @param {Object} signals - Observed and derived signals from priceSignals.js
 * @param {Object} forecastSignal - Output from Phase 2 forecasting service
 * @param {number} [horizonDays=7] - Evaluation horizon (7, 15, or 30 days)
 * @returns {Object} Comprehensive recommendation payload
 */
function generateRecommendation(signals, forecastSignal = null, horizonDays = 7) {
  const { observed, derived } = signals;

  // 1. Extract Signal Values
  const priceDev30 = derived.priceDeviationFrom30dPercent;
  const priceDev7 = derived.priceDeviationFrom7dPercent;
  const arrivalChange = derived.arrivalChangePercent;
  const coeffVar = derived.priceCoeffVariationPercent;

  const forecastGrowth = forecastSignal?.demandTrendPercentage ?? 0;
  const forecastDemandStatus = forecastSignal?.demandStatus ?? 'BALANCED';

  // 2. Compute Individual Heuristic Component Scores
  const sPriceDev = HEURISTIC_WEIGHTS.priceDeviation30dWeight * priceDev30;
  const sMomentum = HEURISTIC_WEIGHTS.priceMomentum7dWeight * priceDev7;
  const sSupply = HEURISTIC_WEIGHTS.supplyPressureWeight * arrivalChange;
  const sForecast = HEURISTIC_WEIGHTS.forecastDemandWeight * forecastGrowth;

  // Volatility Penalty (Applied only when CV > 8%)
  const excessVolatility = Math.max(0, coeffVar - 8.0);
  const pVolatility = -1.0 * (HEURISTIC_WEIGHTS.volatilityRiskPenaltyWeight * excessVolatility);

  const rawScore = sPriceDev + sMomentum + sSupply + sForecast + pVolatility;
  const normalizedScore = Math.max(-100, Math.min(100, Math.round(rawScore * 10) / 10));

  // 3. Determine Actionable Recommendation Category
  let recommendation = 'STABLE / NEUTRAL';
  let recommendationCategory = 'NEUTRAL';
  let badgeColor = 'emerald';

  if (normalizedScore >= 20.0) {
    recommendation = 'WAIT';
    recommendationCategory = 'HOLD_FOR_UPSIDE';
    badgeColor = 'blue';
  } else if (normalizedScore >= 8.0) {
    recommendation = 'CONSIDER WAITING';
    recommendationCategory = 'MILD_BULLISH';
    badgeColor = 'cyan';
  } else if (normalizedScore <= -20.0) {
    recommendation = 'SELL NOW';
    recommendationCategory = 'LIQUIDATE_AT_PEAK_OR_GLUT';
    badgeColor = 'amber';
  } else if (normalizedScore <= -8.0) {
    recommendation = 'CONSIDER SELLING';
    recommendationCategory = 'MILD_BEARISH';
    badgeColor = 'orange';
  }

  // 4. Recommendation Strength / Signal Confidence
  const absScore = Math.abs(normalizedScore);
  let signalStrength = 'MODERATE';
  if (absScore >= 35.0) {
    signalStrength = 'VERY_STRONG';
  } else if (absScore >= 20.0) {
    signalStrength = 'STRONG';
  } else if (absScore < 10.0) {
    signalStrength = 'NEUTRAL / LOW';
  }

  // 5. Generate Dynamic, Data-Driven Reason Codes & Explanations
  const reasonCodes = [];
  const explanationPoints = [];

  // Price deviation explanation
  if (priceDev30 <= -3.0) {
    reasonCodes.push('PRICE_BELOW_30D_BASELINE');
    explanationPoints.push(
      `Current modal price (₹${observed.currentModalPricePerQuintal}/Q) is ${Math.abs(priceDev30)}% below the 30-day baseline (₹${derived.historicalAverage30d}/Q), creating mean-reversion upside potential.`
    );
  } else if (priceDev30 >= 3.0) {
    reasonCodes.push('PRICE_ABOVE_30D_BASELINE');
    explanationPoints.push(
      `Current modal price (₹${observed.currentModalPricePerQuintal}/Q) is trading at a +${priceDev30}% premium above the 30-day baseline (₹${derived.historicalAverage30d}/Q), offering attractive realization.`
    );
  }

  // Momentum explanation
  if (priceDev7 >= 1.5) {
    reasonCodes.push('SHORT_TERM_MOMENTUM_UP');
    explanationPoints.push(
      `Short-term 7-day price momentum is upward (+${priceDev7}%), suggesting near-term price strength.`
    );
  } else if (priceDev7 <= -1.5) {
    reasonCodes.push('SHORT_TERM_MOMENTUM_DOWN');
    explanationPoints.push(
      `Short-term 7-day price momentum is softening (${priceDev7}%), suggesting easing market prices.`
    );
  }

  // Supply/Arrival explanation
  if (arrivalChange <= -10.0) {
    reasonCodes.push('SUPPLY_SCARCITY_FALLING_ARRIVALS');
    explanationPoints.push(
      `Recent 7-day mandi arrivals (${derived.historicalArrivalAvg7dTonnes} T/day) have dropped by ${Math.abs(arrivalChange)}% compared to 30-day average (${derived.historicalArrivalAvg30dTonnes} T/day), indicating tightening supply.`
    );
  } else if (arrivalChange >= 10.0) {
    reasonCodes.push('SUPPLY_INFLUX_GLUT_RISK');
    explanationPoints.push(
      `Recent 7-day mandi arrivals (${derived.historicalArrivalAvg7dTonnes} T/day) surged by +${arrivalChange}% over the 30-day average (${derived.historicalArrivalAvg30dTonnes} T/day), posing local supply glut risk.`
    );
  }

  // Forecast demand explanation
  if (forecastGrowth >= 2.0 || forecastDemandStatus === 'HIGH') {
    reasonCodes.push('BULLISH_FORECAST_DEMAND');
    explanationPoints.push(
      `Phase 2 Demand Forecasting pipeline projects a +${forecastGrowth}% increase in market absorption pressure over the next ${horizonDays} days.`
    );
  } else if (forecastGrowth <= -2.0 || forecastDemandStatus === 'SURPLUS') {
    reasonCodes.push('BEARISH_FORECAST_DEMAND');
    explanationPoints.push(
      `Phase 2 Demand Forecasting pipeline projects surplus supply inventory (${forecastGrowth}%) over the next ${horizonDays} days.`
    );
  }

  // Volatility explanation
  if (derived.volatilityLevel === 'HIGH') {
    reasonCodes.push('HIGH_PRICE_VOLATILITY');
    explanationPoints.push(
      `Historical price volatility is High (CV = ${coeffVar}%), indicating elevated risk of sharp market swings.`
    );
  } else if (derived.volatilityLevel === 'LOW') {
    reasonCodes.push('LOW_PRICE_VOLATILITY');
    explanationPoints.push(
      `Historical price volatility is Low (CV = ${coeffVar}%), indicating stable pricing conditions.`
    );
  }

  if (explanationPoints.length === 0) {
    explanationPoints.push('Market price, supply arrivals, and forecast indicators are currently balanced near long-term equilibrium.');
  }

  // Summary headline text
  let summaryText = '';
  if (recommendation === 'WAIT') {
    summaryText = `Favorable conditions to WAIT. Current prices are below baseline while tightening arrivals and positive forecast momentum suggest potential price gains over next ${horizonDays} days.`;
  } else if (recommendation === 'CONSIDER WAITING') {
    summaryText = `Moderate upside signals support considering a short holding period. Monitor mandi arrivals closely.`;
  } else if (recommendation === 'SELL NOW') {
    summaryText = `Favorable conditions to SELL NOW. Produce is capturing peak pricing, and incoming supply surges increase the risk of near-term price softening.`;
  } else if (recommendation === 'CONSIDER SELLING') {
    summaryText = `Mild softening indicators suggest locking in current market realizations before further supply accumulation.`;
  } else {
    summaryText = `Market indicators are in steady equilibrium. Normal scheduled marketing is recommended.`;
  }

  return {
    recommendation,
    recommendationCategory,
    badgeColor,
    signalStrength,
    score: normalizedScore,
    scoreBreakdown: {
      priceDeviationComponent: Math.round(sPriceDev * 10) / 10,
      priceMomentumComponent: Math.round(sMomentum * 10) / 10,
      supplyPressureComponent: Math.round(sSupply * 10) / 10,
      forecastDemandComponent: Math.round(sForecast * 10) / 10,
      volatilityPenaltyComponent: Math.round(pVolatility * 10) / 10,
      methodology: 'Heuristic Multi-Signal Composite Index (Exposed Weights)',
    },
    heuristicWeightsUsed: HEURISTIC_WEIGHTS,
    reasonCodes,
    explanation: explanationPoints,
    summaryText,
    currentPrice: observed.currentModalPricePerQuintal,
    currentPricePerKg: observed.currentPricePerKg,
    priceRange: {
      min: observed.minPricePerQuintal,
      max: observed.maxPricePerQuintal,
      unit: '₹/Quintal',
    },
    historicalAverage7d: derived.historicalAverage7d,
    historicalAverage30d: derived.historicalAverage30d,
    priceTrend: derived.priceTrendDirection,
    priceTrendLabel: derived.priceTrendLabel,
    volatility: {
      level: derived.volatilityLevel,
      stdDev: derived.priceStdDev,
      coeffVariationPercent: derived.priceCoeffVariationPercent,
    },
    arrivalPressure: {
      status: derived.supplyPressure,
      label: derived.supplyPressureLabel,
      changePercent: derived.arrivalChangePercent,
      currentArrivalTonnes: observed.currentArrivalTonnes,
      historicalAvg7dTonnes: derived.historicalArrivalAvg7dTonnes,
      historicalAvg30dTonnes: derived.historicalArrivalAvg30dTonnes,
    },
    forecastSignal: {
      horizonDays,
      status: forecastDemandStatus,
      growthPercent: forecastGrowth,
      demandGapTonnes: forecastSignal?.demandGapTonnes ?? 0,
      source: 'Phase 2 Demand Forecasting Engine',
    },
    disclaimer:
      'Market recommendation is an algorithmic decision-support tool based on historical mandi signals and forecast indicators. Actual prices may fluctuate due to weather events, logistics, and government policies. Not a financial guarantee.',
  };
}

module.exports = {
  generateRecommendation,
  HEURISTIC_WEIGHTS,
};
