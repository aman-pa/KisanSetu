/**
 * priceIntelligenceValidator.js
 * Chronological out-of-sample backtesting simulation for Farmer Selling Recommendations.
 * 
 * Evaluates historical decision outcomes over 7-day forward horizons with zero future leakage.
 */

const { extractPriceSignals } = require('./priceSignals');
const { generateRecommendation } = require('./recommendationEngine');

/**
 * Runs a chronological simulation across historical observations to evaluate recommendation efficacy.
 * 
 * @param {Array<Object>} fullHistorySeries - Sorted array of daily historical records (minimum 40 records)
 * @param {number} [evaluationHorizonDays=7] - Forward evaluation horizon in days
 * @returns {Object} Backtest metrics and simulation summary
 */
function runRecommendationBacktest(fullHistorySeries, evaluationHorizonDays = 7) {
  const n = fullHistorySeries?.length || 0;
  const minLookback = 30;

  if (n < minLookback + evaluationHorizonDays + 5) {
    return {
      isValidated: false,
      reason: `Insufficient historical records (${n}) for a ${evaluationHorizonDays}-day forward backtest with 30-day lookback.`,
    };
  }

  let totalSimulations = 0;
  let correctDecisions = 0;
  let waitCount = 0;
  let waitSuccessCount = 0;
  let sellCount = 0;
  let sellSuccessCount = 0;
  let neutralCount = 0;
  let neutralSuccessCount = 0;

  let totalWaitGainPercent = 0;
  let totalSellAvoidedLossPercent = 0;

  const simulationRecords = [];

  // Iterate over all valid simulation start dates
  for (let t = minLookback; t < n - evaluationHorizonDays; t++) {
    // 1. History available strictly up to day t
    const subHistory = fullHistorySeries.slice(0, t + 1);
    const currentDate = subHistory[t].date;
    const currentPrice = subHistory[t].modalPrice;

    // 2. Future price observed strictly at t + horizon
    const futureDate = fullHistorySeries[t + evaluationHorizonDays].date;
    const futurePrice = fullHistorySeries[t + evaluationHorizonDays].modalPrice;
    const actualPriceChangePercent = ((futurePrice - currentPrice) / (currentPrice + 1e-6)) * 100;

    // 3. Generate recommendation with zero future information
    try {
      const signals = extractPriceSignals(subHistory);
      const rec = generateRecommendation(signals, null, evaluationHorizonDays);
      const decision = rec.recommendation;

      totalSimulations++;

      let isSuccess = false;
      let outcomeLabel = 'NEUTRAL';

      if (decision === 'WAIT' || decision === 'CONSIDER WAITING') {
        waitCount++;
        if (actualPriceChangePercent > 0) {
          isSuccess = true;
          waitSuccessCount++;
          outcomeLabel = 'PROFITABLE_HOLD';
          totalWaitGainPercent += actualPriceChangePercent;
        } else {
          outcomeLabel = 'SUBOPTIMAL_HOLD';
        }
      } else if (decision === 'SELL NOW' || decision === 'CONSIDER SELLING') {
        sellCount++;
        if (actualPriceChangePercent <= 0) {
          isSuccess = true;
          sellSuccessCount++;
          outcomeLabel = 'PROTECTED_PROFIT';
          totalSellAvoidedLossPercent += Math.abs(actualPriceChangePercent);
        } else {
          outcomeLabel = 'MISSED_UPSIDE';
        }
      } else {
        // STABLE / NEUTRAL
        neutralCount++;
        if (Math.abs(actualPriceChangePercent) <= 2.5) {
          isSuccess = true;
          neutralSuccessCount++;
          outcomeLabel = 'STABLE_PREDICTION';
        } else {
          outcomeLabel = 'UNEXPECTED_VOLATILITY';
        }
      }

      if (isSuccess) {
        correctDecisions++;
      }

      simulationRecords.push({
        simDate: currentDate,
        forwardDate: futureDate,
        decision,
        currentPrice,
        futurePrice,
        priceChangePercent: Math.round(actualPriceChangePercent * 10) / 10,
        outcomeLabel,
        isSuccess,
      });
    } catch (err) {
      console.warn(`[Backtest] Skip day ${t}:`, err.message);
    }
  }

  if (totalSimulations === 0) {
    return {
      isValidated: false,
      reason: 'No valid simulation windows could be computed.',
    };
  }

  const overallHitRate = (correctDecisions / totalSimulations) * 100;
  const waitAccuracy = waitCount > 0 ? (waitSuccessCount / waitCount) * 100 : 0;
  const sellAccuracy = sellCount > 0 ? (sellSuccessCount / sellCount) * 100 : 0;
  const avgWaitGain = waitSuccessCount > 0 ? totalWaitGainPercent / waitSuccessCount : 0;
  const avgAvoidedLoss = sellSuccessCount > 0 ? totalSellAvoidedLossPercent / sellSuccessCount : 0;

  return {
    isValidated: true,
    totalSimulations,
    evaluationHorizonDays,
    metrics: {
      overallHitRatePercent: Math.round(overallHitRate * 10) / 10,
      directionalAccuracyPercent: Math.round(overallHitRate * 10) / 10,
      waitRecommendationAccuracyPercent: Math.round(waitAccuracy * 10) / 10,
      sellRecommendationAccuracyPercent: Math.round(sellAccuracy * 10) / 10,
      averageRealizationGainOnWaitPercent: Math.round(avgWaitGain * 10) / 10,
      averageAvoidedLossOnSellPercent: Math.round(avgAvoidedLoss * 10) / 10,
      falseWaitRatePercent: Math.round((100 - waitAccuracy) * 10) / 10,
      falseSellRatePercent: Math.round((100 - sellAccuracy) * 10) / 10,
    },
    decisionDistribution: {
      totalWaitDecisions: waitCount,
      totalSellDecisions: sellCount,
      totalNeutralDecisions: neutralCount,
    },
    sampleRecentSimulations: simulationRecords.slice(-5),
    methodology:
      'Rolling-window out-of-sample chronological backtesting. Evaluates 7-day forward price realizations against historical recommendation decisions with zero future data leakage.',
  };
}

module.exports = {
  runRecommendationBacktest,
};
