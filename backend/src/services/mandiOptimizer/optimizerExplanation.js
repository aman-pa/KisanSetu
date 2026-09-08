/**
 * optimizerExplanation.js
 * Explainability and Reason Code generation engine for Mandi Optimizer.
 * Produces transparent, evidence-based rationales for farmer decision support.
 */

const REASON_CODES = {
  HIGHEST_NET_REALIZATION: 'HIGHEST_NET_REALIZATION',
  LOWER_LOGISTICS_COST: 'LOWER_LOGISTICS_COST',
  PRICE_PREMIUM_OVERCOMES_DISTANCE: 'PRICE_PREMIUM_OVERCOMES_DISTANCE',
  HIGH_MARKET_ABSORPTION: 'HIGH_MARKET_ABSORPTION',
  UPWARD_PRICE_MOMENTUM: 'UPWARD_PRICE_MOMENTUM',
  LOW_VOLATILITY_STABILITY: 'LOW_VOLATILITY_STABILITY',
  LOCAL_PROXIMITY_ADVANTAGE: 'LOCAL_PROXIMITY_ADVANTAGE',
  SUPPLY_DEFICIT_OPPORTUNITY: 'SUPPLY_DEFICIT_OPPORTUNITY',
};

/**
 * Generates structured reason codes and actionable explanation for a candidate mandi.
 * 
 * @param {Object} candidate - Candidate mandi calculation object
 * @param {Object} baselineLocalMandi - Nearest or baseline local mandi for comparison
 * @param {Array<Object>} allCandidates - All evaluated mandis
 * @returns {Object} { reasonCodes, keyHighlights, explanation }
 */
function generateMandiExplanation(candidate, baselineLocalMandi, allCandidates = []) {
  const reasonCodes = [];
  const keyHighlights = [];

  const isTopPick = candidate.rank === 1;
  const isNearest = baselineLocalMandi && candidate.market === baselineLocalMandi.market;
  const netAdvantageTotal = candidate.netAdvantageOverLocal || 0;
  const netAdvantagePerKg = candidate.netAdvantagePerKg || 0;

  // 1. Primary Economic Reason
  if (isTopPick) {
    reasonCodes.push(REASON_CODES.HIGHEST_NET_REALIZATION);
    keyHighlights.push(
      `Delivers the highest expected net realization at ₹${candidate.netRealizationPerKg.toFixed(2)}/kg (Total ₹${candidate.netRealization.toLocaleString('en-IN')}).`
    );
  }

  // 2. Logistics & Proximity vs Distance Trade-off
  if (isNearest) {
    reasonCodes.push(REASON_CODES.LOCAL_PROXIMITY_ADVANTAGE);
    reasonCodes.push(REASON_CODES.LOWER_LOGISTICS_COST);
    keyHighlights.push(
      `Nearest terminal market (${candidate.distanceKm} km) with minimal estimated freight cost (₹${candidate.estimatedLogisticsCost.toLocaleString('en-IN')}).`
    );
  } else if (baselineLocalMandi && netAdvantageTotal > 0) {
    reasonCodes.push(REASON_CODES.PRICE_PREMIUM_OVERCOMES_DISTANCE);
    keyHighlights.push(
      `Price premium of ₹${(candidate.pricePerKg - baselineLocalMandi.pricePerKg).toFixed(2)}/kg outweighs the additional ₹${(candidate.estimatedLogisticsCost - baselineLocalMandi.estimatedLogisticsCost).toLocaleString('en-IN')} transport freight, netting +₹${netAdvantageTotal.toLocaleString('en-IN')} more overall.`
    );
  } else if (candidate.estimatedLogisticsCost < (baselineLocalMandi?.estimatedLogisticsCost || Infinity)) {
    reasonCodes.push(REASON_CODES.LOWER_LOGISTICS_COST);
    keyHighlights.push(`Lower logistics overhead saves freight expense.`);
  }

  // 3. Market Dynamics & Supply Absorption
  if (candidate.supplyPressure === 'SUPPLY_SHORTAGE' || candidate.supplyStatus === 'DEFICIT') {
    reasonCodes.push(REASON_CODES.SUPPLY_DEFICIT_OPPORTUNITY);
    keyHighlights.push('Tight incoming market arrivals foster aggressive buyer bids.');
  } else if (candidate.supplyPressure === 'BALANCED' || candidate.supplyStatus === 'BALANCED') {
    reasonCodes.push(REASON_CODES.HIGH_MARKET_ABSORPTION);
    keyHighlights.push('Healthy market intake volume absorbs produce without price discounting.');
  }

  // 4. Momentum & Stability
  if (candidate.priceTrend === 'PRICE_TREND_UP' || candidate.trend === 'RISING') {
    reasonCodes.push(REASON_CODES.UPWARD_PRICE_MOMENTUM);
    keyHighlights.push('Positive 7-day upward price momentum supporting auction realizations.');
  }

  if (candidate.volatilityLevel === 'LOW' || candidate.riskLevel === 'LOW') {
    reasonCodes.push(REASON_CODES.LOW_VOLATILITY_STABILITY);
    keyHighlights.push('Consistent and stable price realization bands.');
  }

  // Generate cohesive synthesized explanation text
  let explanation;
  if (isNearest && isTopPick) {
    explanation = `${candidate.market} is both your closest mandi (${candidate.distanceKm} km) and offers the best net return of ₹${candidate.netRealizationPerKg.toFixed(2)}/kg after ₹${candidate.estimatedLogisticsCost.toLocaleString('en-IN')} estimated transport cost. Selling locally minimizes transit time and logistics friction.`;
  } else if (isTopPick && baselineLocalMandi && netAdvantageTotal > 0) {
    explanation = `While ${candidate.market} is ${candidate.distanceKm} km away (${(candidate.distanceKm - baselineLocalMandi.distanceKm).toFixed(0)} km farther than local ${baselineLocalMandi.market}), its higher modal price of ₹${candidate.pricePerKg.toFixed(2)}/kg generates ₹${candidate.grossRevenue.toLocaleString('en-IN')} in gross revenue. After deducting ₹${candidate.estimatedLogisticsCost.toLocaleString('en-IN')} estimated transport, you net ₹${candidate.netRealization.toLocaleString('en-IN')}, earning ₹${netAdvantageTotal.toLocaleString('en-IN')} (+₹${netAdvantagePerKg.toFixed(2)}/kg) more than selling at ${baselineLocalMandi.market}.`;
  } else {
    explanation = `${candidate.market} yields an estimated net realization of ₹${candidate.netRealizationPerKg.toFixed(2)}/kg with ₹${candidate.estimatedLogisticsCost.toLocaleString('en-IN')} transport costs over ${candidate.distanceKm} km.`;
  }

  return {
    reasonCodes: Array.from(new Set(reasonCodes)),
    keyHighlights,
    explanation,
  };
}

module.exports = {
  REASON_CODES,
  generateMandiExplanation,
};
