/**
 * actionExplanation.js
 * Natural-language explanation and decision driver generator for Farmer Action Intelligence.
 * 
 * Strict Principle:
 * All generated bullets MUST reference actual computed metrics and values from the dataset.
 */

/**
 * Builds data-driven reasons and context summary for a farmer action recommendation.
 * 
 * @param {Object} params
 * @param {string} params.action
 * @param {Object} params.farmerContext
 * @param {Object} params.signals
 * @param {Object} params.riskAssessment
 * @param {Object} params.bestMandiOption
 * @returns {Object} Structured explanations, reason codes, and alternative actions
 */
function buildActionExplanations({
  action,
  farmerContext,
  signals,
  riskAssessment,
  bestMandiOption = null,
}) {
  const { commodity, mandi, quantity, unit, quantityInQuintals } = farmerContext;
  const { observed, derived } = signals;

  const reasons = [];
  const reasonCodes = [];

  // 1. Price vs Baseline Reason
  const pDev30 = derived.priceDeviationFrom30dPercent;
  if (pDev30 <= -3.0) {
    reasonCodes.push('PRICE_BELOW_BASELINE_UPSIDE');
    reasons.push(
      `Current modal price (₹${observed.currentModalPricePerQuintal}/q) is ${Math.abs(pDev30)}% below the 30-day average (₹${derived.historicalAverage30d}/q), providing potential room for mean-reverting price recovery.`
    );
  } else if (pDev30 >= 3.0) {
    reasonCodes.push('PRICE_ABOVE_BASELINE_PEAK');
    reasons.push(
      `Current modal price (₹${observed.currentModalPricePerQuintal}/q) is trading at a +${pDev30}% premium above the 30-day average (₹${derived.historicalAverage30d}/q), offering strong spot realization.`
    );
  } else {
    reasonCodes.push('PRICE_NEAR_EQUILIBRIUM');
    reasons.push(
      `Current modal price (₹${observed.currentModalPricePerQuintal}/q) is aligned near the 30-day historical average (₹${derived.historicalAverage30d}/q).`
    );
  }

  // 2. Supply / Arrival Velocity Reason
  const arrChg = derived.arrivalChangePercent;
  if (arrChg <= -10.0) {
    reasonCodes.push('ARRIVALS_FALLING_TIGHT_SUPPLY');
    reasons.push(
      `Recent 7-day mandi arrivals (${derived.historicalArrivalAvg7dTonnes} T/day) have dropped by ${Math.abs(arrChg)}% compared to 30-day levels (${derived.historicalArrivalAvg30dTonnes} T/day), indicating supply tightening.`
    );
  } else if (arrChg >= 10.0) {
    reasonCodes.push('ARRIVALS_SURGING_GLUT_RISK');
    reasons.push(
      `Recent 7-day mandi arrivals (${derived.historicalArrivalAvg7dTonnes} T/day) surged by +${arrChg}% over the 30-day baseline, indicating near-term local supply accumulation.`
    );
  }

  // 3. Volatility / Risk Reason
  if (riskAssessment.riskLevel === 'HIGH') {
    reasonCodes.push('ELEVATED_MARKET_VOLATILITY');
    reasons.push(
      `Price volatility is Elevated (CV = ${derived.priceCoeffVariationPercent}%), suggesting cautious lot management.`
    );
  } else if (riskAssessment.riskLevel === 'LOW') {
    reasonCodes.push('LOW_PRICE_VOLATILITY');
    reasons.push(
      `Price volatility is Low (CV = ${derived.priceCoeffVariationPercent}%), indicating steady baseline market stability.`
    );
  }

  // 4. Alternative Mandi Comparison Reason
  let alternativeAction = 'Monitor local mandi prices daily for supply shifts.';
  if (bestMandiOption && bestMandiOption.market !== mandi && bestMandiOption.priceDifferencePerQuintal > 30) {
    const grossDiff = Math.round(bestMandiOption.priceDifferencePerQuintal * quantityInQuintals);
    reasonCodes.push('REGIONAL_ARBITRAGE_OPPORTUNITY');
    reasons.push(
      `Alternative mandi (${bestMandiOption.market}) is trading at ₹${bestMandiOption.modalPricePerQuintal}/q (+₹${bestMandiOption.priceDifferencePerQuintal}/q higher), representing a potential gross price difference of ₹${grossDiff.toLocaleString()} for your ${quantity} ${unit} lot.`
    );
    alternativeAction = `Compare transportation cost to ${bestMandiOption.market} against the +₹${grossDiff.toLocaleString()} potential gross price advantage.`;
  }

  // Main Decision Summary Text
  let decisionSummary = '';
  switch (action) {
    case 'WAIT':
      decisionSummary = `Holding your ${quantity} ${unit} lot is favored. Below-average spot prices and tightening arrivals indicate upside potential over the coming 7–15 days.`;
      break;
    case 'CONSIDER_WAITING':
      decisionSummary = `Moderate upward market signals support holding. Stagger releases while monitoring daily mandi arrivals.`;
      break;
    case 'SELL_NOW':
      decisionSummary = `Selling your ${quantity} ${unit} lot now is favored to capture peak spot realization before potential supply gluts soft-land prices.`;
      break;
    case 'CONSIDER_SELLING':
      decisionSummary = `Mild downward market pressure observed. Consider offloading partial lots or staggering sales over the next few days.`;
      break;
    case 'COMPARE_MANDIS':
      decisionSummary = `Significant regional price premium detected at ${bestMandiOption?.market || 'nearby mandi'}. Evaluate transport logistics to capture higher net realization.`;
      break;
    case 'INSUFFICIENT_DATA':
      decisionSummary = `Historical market data is currently insufficient to compute a reliable decision recommendation.`;
      break;
    case 'STABLE_EQUILIBRIUM':
    default:
      decisionSummary = `Market signals are in equilibrium. Standard scheduled marketing recommended.`;
      break;
  }

  return {
    reasons,
    reasonCodes,
    decisionSummary,
    alternativeAction,
  };
}

module.exports = {
  buildActionExplanations,
};
