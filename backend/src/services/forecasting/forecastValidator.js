/**
 * forecastValidator.js
 * Chronological out-of-sample time-series validation and backtesting engine.
 */

const { HybridAdaptiveForecastingModel } = require('./forecastingModel');

/**
 * Performs out-of-sample backtesting on historical time-series data.
 * 
 * @param {Array<Object>} enrichedHistory - Sorted historical records
 * @param {number} [testHorizon=15] - Number of observations to withhold for validation
 * @returns {Object} Validation results with MAE, RMSE, WAPE, MAPE, and interval coverage
 */
function validateForecastingPerformance(enrichedHistory, testHorizon = 15) {
  const n = enrichedHistory.length;
  if (n < testHorizon + 14) {
    return {
      isValidated: false,
      reason: `Insufficient data points (${n}) for a ${testHorizon}-day backtest.`,
    };
  }

  const splitIdx = n - testHorizon;
  const trainSlice = enrichedHistory.slice(0, splitIdx);
  const testSlice = enrichedHistory.slice(splitIdx);

  // Fit strictly on training slice (zero future leakage)
  const model = new HybridAdaptiveForecastingModel();
  model.fit(trainSlice);

  const lastTrainDate = trainSlice[trainSlice.length - 1].date;
  const predictions = model.predict(lastTrainDate, testHorizon);

  let sumAbsErr = 0;
  let sumSqErr = 0;
  let sumActual = 0;
  let sumPctErr = 0;
  let count80Inside = 0;
  let count95Inside = 0;

  for (let i = 0; i < testHorizon; i++) {
    const actual = testSlice[i].demandProxyTonnes;
    const pred = predictions[i].predictedDemandTonnes;
    const absErr = Math.abs(actual - pred);

    sumAbsErr += absErr;
    sumSqErr += absErr * absErr;
    sumActual += actual;
    sumPctErr += absErr / (actual + 1e-6);

    if (actual >= predictions[i].lower80Tonnes && actual <= predictions[i].upper80Tonnes) {
      count80Inside++;
    }
    if (actual >= predictions[i].lower95Tonnes && actual <= predictions[i].upper95Tonnes) {
      count95Inside++;
    }
  }

  const mae = sumAbsErr / testHorizon;
  const rmse = Math.sqrt(sumSqErr / testHorizon);
  const wape = (sumAbsErr / (sumActual + 1e-6)) * 100;
  const mape = (sumPctErr / testHorizon) * 100;
  const coverage80 = (count80Inside / testHorizon) * 100;
  const coverage95 = (count95Inside / testHorizon) * 100;

  return {
    isValidated: true,
    trainingWindow: {
      observations: trainSlice.length,
      start: trainSlice[0].date,
      end: trainSlice[trainSlice.length - 1].date,
    },
    validationWindow: {
      observations: testSlice.length,
      start: testSlice[0].date,
      end: testSlice[testSlice.length - 1].date,
    },
    metrics: {
      mae: Number(mae.toFixed(2)),
      rmse: Number(rmse.toFixed(2)),
      wape: Number(wape.toFixed(2)),
      mape: Number(mape.toFixed(2)),
      empiricalCoverage80Percent: Number(coverage80.toFixed(1)),
      empiricalCoverage95Percent: Number(coverage95.toFixed(1)),
      unit: 'Tonnes',
    },
  };
}

module.exports = {
  validateForecastingPerformance,
};
