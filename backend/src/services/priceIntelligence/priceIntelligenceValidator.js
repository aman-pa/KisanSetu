/**
 * priceIntelligenceValidator.js
 * Chronological out-of-sample backtesting simulation for Farmer Selling Recommendations.
 * 
 * METHODOLOGICAL RIGOR & HONESTY:
 * - Rolling windows are evaluated chronologically with zero future leakage.
 * - Distinguishes between Actionable Directional Signals (WAIT & SELL) vs Neutral Regime.
 * - Reports conditional gains/losses as well as full-cohort averages.
 * - Explicitly notes serial correlation across overlapping rolling windows.
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

  // Directional Recommendation Buckets
  let waitCount = 0;
  let waitSuccessCount = 0;
  let totalWaitAllDelta = 0;
  let totalWaitProfitDelta = 0;
  let totalWaitLossDelta = 0;

  let sellCount = 0;
  let sellSuccessCount = 0;
  let totalSellAllDelta = 0;
  let totalSellAvoidedDrop = 0;
  let totalSellMissedUpside = 0;

  let neutralCount = 0;
  let neutralStableCount = 0;

  // 3x3 Confusion Matrix: rows=recommendation, cols=actualMarketDelta
  // Categories: UP (> +1.5%), STABLE ([-1.5%, +1.5%]), DOWN (< -1.5%)
  const confusionMatrix = {
    WAIT: { UP: 0, STABLE: 0, DOWN: 0 },
    SELL: { UP: 0, STABLE: 0, DOWN: 0 },
    NEUTRAL: { UP: 0, STABLE: 0, DOWN: 0 },
  };

  const simulationRecords = [];

  // Iterate over all valid simulation start dates
  for (let t = minLookback; t < n - evaluationHorizonDays; t++) {
    // 1. History available strictly up to day t (strictly backward-looking)
    const subHistory = fullHistorySeries.slice(0, t + 1);
    const currentDate = subHistory[t].date;
    const currentPrice = subHistory[t].modalPrice;

    // 2. Future price observed strictly at t + horizon
    const futureDate = fullHistorySeries[t + evaluationHorizonDays].date;
    const futurePrice = fullHistorySeries[t + evaluationHorizonDays].modalPrice;
    const actualPriceChangePercent = ((futurePrice - currentPrice) / (currentPrice + 1e-6)) * 100;

    // Categorize actual market movement
    let marketMovement = 'STABLE';
    if (actualPriceChangePercent > 1.5) marketMovement = 'UP';
    else if (actualPriceChangePercent < -1.5) marketMovement = 'DOWN';

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
        totalWaitAllDelta += actualPriceChangePercent;
        confusionMatrix.WAIT[marketMovement]++;

        if (actualPriceChangePercent > 0) {
          isSuccess = true;
          waitSuccessCount++;
          outcomeLabel = 'PROFITABLE_HOLD';
          totalWaitProfitDelta += actualPriceChangePercent;
        } else {
          outcomeLabel = 'SUBOPTIMAL_HOLD';
          totalWaitLossDelta += actualPriceChangePercent;
        }
      } else if (decision === 'SELL NOW' || decision === 'CONSIDER SELLING') {
        sellCount++;
        totalSellAllDelta += actualPriceChangePercent;
        confusionMatrix.SELL[marketMovement]++;

        if (actualPriceChangePercent <= 0) {
          isSuccess = true;
          sellSuccessCount++;
          outcomeLabel = 'PROTECTED_PROFIT';
          totalSellAvoidedDrop += Math.abs(actualPriceChangePercent);
        } else {
          outcomeLabel = 'MISSED_UPSIDE';
          totalSellMissedUpside += actualPriceChangePercent;
        }
      } else {
        // STABLE / NEUTRAL
        neutralCount++;
        confusionMatrix.NEUTRAL[marketMovement]++;

        if (Math.abs(actualPriceChangePercent) <= 2.5) {
          isSuccess = true;
          neutralStableCount++;
          outcomeLabel = 'STABLE_PREDICTION';
        } else {
          outcomeLabel = 'MARKET_DRIFT';
        }
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

  const activeDecisionsCount = waitCount + sellCount;
  const activeSuccessCount = waitSuccessCount + sellSuccessCount;
  const activePrecision = activeDecisionsCount > 0 ? (activeSuccessCount / activeDecisionsCount) * 100 : 0;

  const waitPrecision = waitCount > 0 ? (waitSuccessCount / waitCount) * 100 : 0;
  const sellPrecision = sellCount > 0 ? (sellSuccessCount / sellCount) * 100 : 0;

  const avgWaitAllDelta = waitCount > 0 ? totalWaitAllDelta / waitCount : 0;
  const avgWaitProfitableGain = waitSuccessCount > 0 ? totalWaitProfitDelta / waitSuccessCount : 0;
  const avgWaitLoss = waitCount - waitSuccessCount > 0 ? totalWaitLossDelta / (waitCount - waitSuccessCount) : 0;

  const avgSellAllDelta = sellCount > 0 ? totalSellAllDelta / sellCount : 0;
  const avgSellAvoidedDrop = sellSuccessCount > 0 ? totalSellAvoidedDrop / sellSuccessCount : 0;

  return {
    isValidated: true,
    totalSimulations,
    evaluationHorizonDays,
    metrics: {
      activeDirectionalPrecisionPercent: Math.round(activePrecision * 10) / 10,
      waitRecommendationPrecisionPercent: Math.round(waitPrecision * 10) / 10,
      sellRecommendationPrecisionPercent: Math.round(sellPrecision * 10) / 10,
      averagePriceDeltaAcrossAllWaitsPercent: Math.round(avgWaitAllDelta * 10) / 10,
      averageGainOnProfitableWaitsPercent: Math.round(avgWaitProfitableGain * 10) / 10,
      averageLossOnSuboptimalWaitsPercent: Math.round(avgWaitLoss * 10) / 10,
      averagePriceDeltaAcrossAllSellsPercent: Math.round(avgSellAllDelta * 10) / 10,
      averageDropAvoidedOnProfitableSellsPercent: Math.round(avgSellAvoidedDrop * 10) / 10,
      falseWaitRatePercent: Math.round((100 - waitPrecision) * 10) / 10,
      falseSellRatePercent: Math.round((100 - sellPrecision) * 10) / 10,
    },
    decisionDistribution: {
      totalActiveDirectionalCalls: activeDecisionsCount,
      totalWaitDecisions: waitCount,
      totalSellDecisions: sellCount,
      totalNeutralDecisions: neutralCount,
      neutralRegimePercent: Math.round((neutralCount / totalSimulations) * 1000) / 10,
    },
    confusionMatrix,
    methodologyNote:
      'Evaluated via rolling-window out-of-sample chronological backtesting over 7-day forward evaluation horizons with zero future data leakage. Note that daily rolling windows overlap by 6 days and are serially correlated.',
  };
}

module.exports = {
  runRecommendationBacktest,
};
