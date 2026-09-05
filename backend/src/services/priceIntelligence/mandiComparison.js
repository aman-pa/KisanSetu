/**
 * mandiComparison.js
 * Multi-factor ranking and comparison engine across APMC Mandis for a given commodity.
 * 
 * IMPORTANT INTEGRITY RULE:
 * Does NOT simply rank by highest current price.
 * Integrates modal price realization, price momentum, supply saturation, and volatility risk.
 */

const { extractPriceSignals } = require('./priceSignals');
const { generateRecommendation } = require('./recommendationEngine');

/**
 * Compares and ranks all available mandis for a commodity.
 * 
 * @param {Object} mandiSeriesMap - Map of mandiName -> Array<RawDailyRecord>
 * @param {string} commodity - Commodity name (e.g. 'Tomato')
 * @returns {Array<Object>} Ranked array of mandis with scores and rationale
 */
function rankMandisForCommodity(mandiSeriesMap, commodity) {
  const mandiResults = [];

  const mandiNames = Object.keys(mandiSeriesMap);
  if (mandiNames.length === 0) {
    return [];
  }

  // 1. Calculate individual mandi signals and prices
  for (const mandiName of mandiNames) {
    const rawSeries = mandiSeriesMap[mandiName];
    if (!rawSeries || rawSeries.length < 3) continue;

    try {
      const signals = extractPriceSignals(rawSeries);
      const rec = generateRecommendation(signals, null, 7);

      mandiResults.push({
        market: mandiName,
        district: signals.observed.district,
        state: signals.observed.state,
        modalPricePerQuintal: signals.observed.currentModalPricePerQuintal,
        pricePerKg: signals.observed.currentPricePerKg,
        minPricePerQuintal: signals.observed.minPricePerQuintal,
        maxPricePerQuintal: signals.observed.maxPricePerQuintal,
        currentArrivalTonnes: signals.observed.currentArrivalTonnes,
        priceTrend: signals.derived.priceTrendDirection,
        priceTrendLabel: signals.derived.priceTrendLabel,
        priceDeviationFrom30dPercent: signals.derived.priceDeviationFrom30dPercent,
        volatilityLevel: signals.derived.volatilityLevel,
        volatilityCoeffPercent: signals.derived.priceCoeffVariationPercent,
        supplyPressure: signals.derived.supplyPressure,
        supplyPressureLabel: signals.derived.supplyPressureLabel,
        recommendation: rec.recommendation,
        score: rec.score,
        signals,
      });
    } catch (err) {
      console.warn(`[mandiComparison] Skipped ${mandiName}:`, err.message);
    }
  }

  if (mandiResults.length === 0) {
    return [];
  }

  // 2. Cross-Mandi Benchmark Statistics
  const avgCrossMandiPrice =
    mandiResults.reduce((s, m) => s + m.modalPricePerQuintal, 0) / mandiResults.length;

  // 3. Multi-Factor Composite Score Calculation
  const ranked = mandiResults.map((m) => {
    // Factor A: Price Premium vs Regional Cross-Mandi Average (40% weight)
    const pricePremiumPercent =
      ((m.modalPricePerQuintal - avgCrossMandiPrice) / (avgCrossMandiPrice + 1e-6)) * 100;
    const priceScore = Math.max(-30, Math.min(30, pricePremiumPercent * 1.5));

    // Factor B: Upward Price Momentum (25% weight)
    const momentumScore = Math.max(-20, Math.min(20, m.priceDeviationFrom30dPercent * 1.0));

    // Factor C: Supply Saturation / Glut Penalty (20% weight)
    let supplyScore = 5.0; // Normal supply
    if (m.supplyPressure === 'SUPPLY_SHORTAGE') {
      supplyScore = 15.0; // Supply scarcity pushes buyers to compete
    } else if (m.supplyPressure === 'SUPPLY_GLUT') {
      supplyScore = -15.0; // High risk of incoming auction price slide
    }

    // Factor D: Low Volatility Stability (15% weight)
    let stabilityScore = 5.0;
    if (m.volatilityLevel === 'LOW') stabilityScore = 10.0;
    else if (m.volatilityLevel === 'HIGH') stabilityScore = -5.0;

    const compositeScore = Math.round((50.0 + priceScore + momentumScore + supplyScore + stabilityScore) * 10) / 10;

    // 4. Generate Explainable Ranking Rationale
    const rationalePoints = [];
    if (pricePremiumPercent >= 2.0) {
      rationalePoints.push(`+${Math.round(pricePremiumPercent * 10) / 10}% price premium over regional average`);
    } else if (pricePremiumPercent <= -2.0) {
      rationalePoints.push(`${Math.round(pricePremiumPercent * 10) / 10}% price discount relative to regional mandis`);
    }

    if (m.supplyPressure === 'SUPPLY_SHORTAGE') {
      rationalePoints.push('tight incoming arrivals fostering strong buyer competition');
    } else if (m.supplyPressure === 'SUPPLY_GLUT') {
      rationalePoints.push('heavy arrival influx creating near-term supply overhang');
    }

    if (m.priceTrend === 'PRICE_TREND_UP') {
      rationalePoints.push('positive 7-day upward price momentum');
    }

    const rankingRationale = rationalePoints.length
      ? rationalePoints.join(' with ') + '.'
      : 'Steady price realizations near regional equilibrium.';

    return {
      market: m.market,
      district: m.district,
      state: m.state,
      modalPricePerQuintal: m.modalPricePerQuintal,
      pricePerKg: m.pricePerKg,
      pricePremiumVsRegionalAvgPercent: Math.round(pricePremiumPercent * 10) / 10,
      priceTrend: m.priceTrend,
      priceTrendLabel: m.priceTrendLabel,
      currentArrivalTonnes: m.currentArrivalTonnes,
      supplyPressure: m.supplyPressure,
      supplyPressureLabel: m.supplyPressureLabel,
      volatilityLevel: m.volatilityLevel,
      recommendation: m.recommendation,
      mandiRankScore: compositeScore,
      rankingRationale,
    };
  });

  // Sort descending by composite score
  ranked.sort((a, b) => b.mandiRankScore - a.mandiRankScore);

  // Assign 1-indexed rank
  return ranked.map((item, index) => ({
    rank: index + 1,
    isTopPick: index === 0,
    ...item,
  }));
}

module.exports = {
  rankMandisForCommodity,
};
