/**
 * featureEngineering.js
 * Feature extraction and economic demand proxy derivation for agricultural market time-series.
 */

const BETA_PRICE_ELASTICITY = 0.5; // Empirical APMC elasticity coefficient

/**
 * Derives realized absorbed market demand proxy from physical arrivals and equilibrium clearing prices.
 * D_t = Arrival_t * (1 + beta * (P_t - P_30d) / P_30d)
 * 
 * @param {Array<Object>} rawDailySeries - Sorted array of { date, modalPrice, arrivalQuantity, isSynthetic }
 * @returns {Array<Object>} Enriched series with demandProxyTonnes and demandIndex
 */
function deriveDemandFeatures(rawDailySeries) {
  if (!rawDailySeries || rawDailySeries.length === 0) {
    return [];
  }

  const enriched = [];

  for (let i = 0; i < rawDailySeries.length; i++) {
    // 30-day backward-looking rolling average (strictly no future data)
    const windowStart = Math.max(0, i - 29);
    const subSlice = rawDailySeries.slice(windowStart, i + 1);

    const sumP = subSlice.reduce((acc, item) => acc + item.modalPrice, 0);
    const avgP30 = sumP / subSlice.length;

    const sumA = subSlice.reduce((acc, item) => acc + item.arrivalQuantity, 0);
    const avgA30 = sumA / subSlice.length;

    const currentP = rawDailySeries[i].modalPrice;
    const currentA = rawDailySeries[i].arrivalQuantity;

    const priceRatio = (currentP - avgP30) / (avgP30 + 1e-6);
    const arrivalRatio = (currentA - avgA30) / (avgA30 + 1e-6);

    // Demand Proxy in Tonnes (bounded to >= 1.0)
    const demandProxy = Math.max(1.0, Math.round(currentA * (1.0 + BETA_PRICE_ELASTICITY * priceRatio) * 10) / 10);

    // 0-100 Demand Pressure Index
    const demandIndex = Math.max(0, Math.min(100, Math.round(50.0 + 25.0 * priceRatio + 25.0 * arrivalRatio)));

    // Day of week
    const dateObj = new Date(rawDailySeries[i].date);
    const dow = dateObj.getDay();

    enriched.push({
      date: rawDailySeries[i].date,
      dayOfWeek: dow,
      modalPricePerQuintal: currentP,
      arrivalQuantityTonnes: currentA,
      rollingPrice30d: Math.round(avgP30),
      rollingArrival30d: Math.round(avgA30 * 10) / 10,
      priceVelocityPercent: Math.round(priceRatio * 1000) / 10,
      demandProxyTonnes: demandProxy,
      demandIndex,
      isSynthetic: rawDailySeries[i].isSynthetic ?? true,
    });
  }

  return enriched;
}

module.exports = {
  deriveDemandFeatures,
  BETA_PRICE_ELASTICITY,
};
