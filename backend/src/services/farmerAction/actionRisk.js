/**
 * Explicit Heuristic Sensitivity Parameters for Risk Evaluation:
 * - Price Volatility CV%:
 *     Low: CV <= 7.0% (-10 score)
 *     Moderate: 7.0% < CV <= 12.0% (+15 score)
 *     High: CV > 12.0% (+35 score)
 * - Arrival Volume Velocity Delta%:
 *     Surge / Glut Risk: DeltaA > +15.0% (+25 score)
 *     Falling Supply: DeltaA < -15.0% (-10 score)
 *     Balanced: -15.0% <= DeltaA <= +15.0% (+0 score)
 * - Signal Divergence (Price momentum vs Forecast growth): +15 score
 * - Overall Composite Risk Level (Score in [10, 95], Baseline = 30):
 *     LOW: Score <= 35
 *     MODERATE: 35 < Score < 65
 *     HIGH: Score >= 65
 */
const HEURISTIC_RISK_THRESHOLDS = {
  volatilityLowMaxCV: 7.0,
  volatilityHighMinCV: 12.0,
  arrivalSurgeThresholdPercent: 15.0,
  arrivalDropThresholdPercent: -15.0,
  riskScoreLowMax: 35,
  riskScoreHighMin: 65,
};

/**
 * Computes transparent risk level and risk factors.
 * 
 * @param {Object} derivedSignals - Output from priceSignals derived metrics
 * @param {Object} forecastSignal - Output from Phase 2 forecasting service
 * @returns {Object} Evaluated risk assessment
 */
function evaluateActionRisk(derivedSignals = {}, forecastSignal = {}) {
  const coeffVar = derivedSignals.priceCoeffVariationPercent ?? 6.0;
  const arrivalChange = derivedSignals.arrivalChangePercent ?? 0.0;
  const priceTrend = derivedSignals.priceTrendDirection ?? 'STABLE';
  const forecastGrowth = forecastSignal?.demandTrendPercentage ?? 0.0;

  const riskFactors = [];
  let rawRiskScore = 30; // Baseline moderate risk for agricultural commodities

  // 1. Volatility Risk Factor (Heuristic CV Thresholds: <=7% Low, 7-12% Moderate, >12% High)
  if (coeffVar > HEURISTIC_RISK_THRESHOLDS.volatilityHighMinCV) {
    rawRiskScore += 35;
    riskFactors.push(`High historical price volatility (CV = ${coeffVar}%), indicating vulnerability to sharp price swings.`);
  } else if (coeffVar > HEURISTIC_RISK_THRESHOLDS.volatilityLowMaxCV) {
    rawRiskScore += 15;
    riskFactors.push(`Moderate historical price volatility (CV = ${coeffVar}%).`);
  } else {
    rawRiskScore -= 10;
    riskFactors.push(`Low historical price volatility (CV = ${coeffVar}%), indicating steady baseline price stability.`);
  }

  // 2. Supply Glut Shock Risk
  if (arrivalChange > 15.0) {
    rawRiskScore += 25;
    riskFactors.push(`Surging mandi arrivals (+${arrivalChange}% vs 30d baseline) risk local market saturation.`);
  } else if (arrivalChange < -15.0) {
    rawRiskScore -= 10;
    riskFactors.push(`Falling mandi arrivals (${arrivalChange}% vs 30d baseline) reduce near-term glut risk.`);
  }

  // 3. Signal Divergence Factor (e.g. Current price dropping while forecast predicts demand surge)
  const isDivergent = (priceTrend === 'PRICE_TREND_DOWN' && forecastGrowth > 3.0) ||
                      (priceTrend === 'PRICE_TREND_UP' && forecastGrowth < -3.0);
  if (isDivergent) {
    rawRiskScore += 15;
    riskFactors.push('Divergence between short-term price momentum and medium-term forecast direction suggests transitional market conditions.');
  }

  const normalizedRiskScore = Math.max(10, Math.min(95, rawRiskScore));

  let riskLevel = 'MODERATE';
  if (normalizedRiskScore <= 35) {
    riskLevel = 'LOW';
  } else if (normalizedRiskScore >= 65) {
    riskLevel = 'HIGH';
  }

  let riskSummary = '';
  if (riskLevel === 'HIGH') {
    riskSummary = 'High market uncertainty. Rapid price fluctuations or incoming supply gluts require cautious execution.';
  } else if (riskLevel === 'LOW') {
    riskSummary = 'Low market uncertainty. Price trends and supply volumes are currently stable.';
  } else {
    riskSummary = 'Moderate market uncertainty. Typical agricultural seasonal variability.';
  }

  return {
    riskLevel,
    riskScore: normalizedRiskScore,
    riskFactors,
    riskSummary,
    methodology: 'Heuristic Multi-Factor Uncertainty Assessment (Price Volatility CV + Supply Velocity + Signal Alignment)',
  };
}

module.exports = {
  evaluateActionRisk,
  HEURISTIC_RISK_THRESHOLDS,
};
