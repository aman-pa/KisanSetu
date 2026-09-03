/**
 * forecastingModel.js
 * Mathematical forecasting models and statistical uncertainty interval estimators.
 */

class HybridAdaptiveForecastingModel {
  /**
   * @param {Object} config
   * @param {number} [config.alpha=0.35] - Level smoothing parameter
   * @param {number} [config.beta=0.05]  - Trend smoothing parameter
   * @param {number} [config.phi=0.92]   - Damped trend autoregressive parameter
   */
  constructor(config = {}) {
    this.alpha = config.alpha ?? 0.35;
    this.beta = config.beta ?? 0.05;
    this.phi = config.phi ?? 0.92;

    this.level = 0.0;
    this.trend = 0.0;
    this.seasonalFactors = [0, 0, 0, 0, 0, 0, 0];
    this.residualStd = 1.0;
    this.inSampleMetrics = null;
  }

  /**
   * Fits model on historical observations.
   * @param {Array<Object>} history - Array of enriched daily objects with demandProxyTonnes and dayOfWeek
   */
  fit(history) {
    const n = history.length;
    if (n < 7) {
      throw new Error(`Insufficient historical data points (${n}). Minimum 7 required.`);
    }

    const y = history.map((h) => h.demandProxyTonnes);

    // 1. Damped Holt Exponential Smoothing
    let level = y[0];
    let trend = (y[Math.min(7, n - 1)] - y[0]) / 7.0;
    const levels = [level];

    for (let t = 1; t < n; t++) {
      const prevLevel = level;
      level = this.alpha * y[t] + (1 - this.alpha) * (level + this.phi * trend);
      trend = this.beta * (level - prevLevel) + (1 - this.beta) * this.phi * trend;
      levels.push(level);
    }

    this.level = level;
    this.trend = trend;

    // 2. Day-of-Week Seasonality Harmonics Decomposition
    const dayResiduals = [0, 0, 0, 0, 0, 0, 0];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];

    for (let t = 0; t < n; t++) {
      const dow = history[t].dayOfWeek ?? new Date(history[t].date).getDay();
      const res = y[t] - levels[t];
      dayResiduals[dow] += res;
      dayCounts[dow] += 1;
    }

    this.seasonalFactors = dayResiduals.map((sum, i) => (dayCounts[i] > 0 ? sum / dayCounts[i] : 0));

    // 3. In-Sample Residual Variance Calculation for Statistical Prediction Intervals
    const residuals = [];
    for (let t = 0; t < n; t++) {
      const dow = history[t].dayOfWeek ?? new Date(history[t].date).getDay();
      const fitted = levels[t] + this.seasonalFactors[dow];
      residuals.push(y[t] - fitted);
    }

    const mae = residuals.reduce((acc, r) => acc + Math.abs(r), 0) / n;
    const rmse = Math.sqrt(residuals.reduce((acc, r) => acc + r * r, 0) / n);
    const totalY = y.reduce((acc, v) => acc + v, 0);
    const wape = (residuals.reduce((acc, r) => acc + Math.abs(r), 0) / (totalY + 1e-6)) * 100;

    this.residualStd = Math.max(1.0, rmse);
    this.inSampleMetrics = {
      mae: Number(mae.toFixed(2)),
      rmse: Number(rmse.toFixed(2)),
      wape: Number(wape.toFixed(2)),
      residualStd: Number(this.residualStd.toFixed(2)),
    };

    return this;
  }

  /**
   * Generates point predictions and statistical uncertainty intervals.
   * @param {Date|string} lastDate - Starting point date
   * @param {number} horizon - Forecast horizon in days (e.g. 7, 15, 30)
   * @returns {Array<Object>} Daily forecast steps
   */
  predict(lastDate, horizon = 30) {
    const startDate = new Date(lastDate);
    const forecastSeries = [];

    for (let h = 1; h <= horizon; h++) {
      const targetDate = new Date(startDate);
      targetDate.setDate(startDate.getDate() + h);
      const targetDow = targetDate.getDay();

      // Damped trend accumulation
      const trendSum = Array.from({ length: h }, (_, j) => Math.pow(this.phi, j + 1)).reduce((a, b) => a + b, 0) * this.trend;
      const baseVal = Math.max(1.0, this.level + trendSum);
      const seasonalVal = this.seasonalFactors[targetDow] || 0;
      const pointVal = Math.max(1.0, Number((baseVal + seasonalVal).toFixed(2)));

      // Statistical uncertainty expansion with horizon scaling sqrt(h)
      const hScale = Math.sqrt(h);
      const margin80 = 1.28 * this.residualStd * hScale;
      const margin95 = 1.96 * this.residualStd * hScale;

      forecastSeries.push({
        step: h,
        date: targetDate.toISOString().slice(0, 10),
        predictedDemandTonnes: pointVal,
        lower80Tonnes: Math.max(0, Number((pointVal - margin80).toFixed(2))),
        upper80Tonnes: Number((pointVal + margin80).toFixed(2)),
        lower95Tonnes: Math.max(0, Number((pointVal - margin95).toFixed(2))),
        upper95Tonnes: Number((pointVal + margin95).toFixed(2)),
      });
    }

    return forecastSeries;
  }
}

module.exports = {
  HybridAdaptiveForecastingModel,
};
