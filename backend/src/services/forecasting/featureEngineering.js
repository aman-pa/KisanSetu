/**
 * featureEngineering.js
 * Feature extraction and Heuristic Market Absorption & Pressure Proxy derivation
 * for agricultural market time-series.
 */

// Explicit heuristic sensitivity parameter (buffers physical arrival volume against clearing price premiums)
const HEURISTIC_PRICE_SENSITIVITY_WEIGHT = 0.5;

/**
 * Derives the Realized Market Absorption & Pressure Proxy from physical arrivals and clearing prices.
 * Formula:
 *   M_t = Arrival_t * (1 + lambda_heuristic * (P_t - P_30d) / P_30d)
 * 
 * IMPORTANT SCIENTIFIC NOTE:
 * - This is NOT direct consumer retail checkout demand.
 * - This is an explicit heuristic proxy representing realized buying absorption pressure in APMC mandis.
 * - lambda_heuristic (0.5) is an explicit modeling assumption, NOT an econometrically estimated elasticity.
 * 
 * @param {Array<Object>} rawDailySeries - Sorted array of { date, modalPrice, arrivalQuantity, isSynthetic }
 * @returns {Array<Object>} Enriched series with demandProxyTonnes (Market Pressure Proxy) and demandIndex
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

    // Derived Market Pressure Proxy in Tonnes (bounded to >= 1.0)
    const marketPressureProxy = Math.max(
      1.0,
      Math.round(currentA * (1.0 + HEURISTIC_PRICE_SENSITIVITY_WEIGHT * priceRatio) * 10) / 10
    );

    // 0-100 Normalized Demand Pressure Index
    const demandIndex = Math.max(
      0,
      Math.min(100, Math.round(50.0 + 25.0 * priceRatio + 25.0 * arrivalRatio))
    );

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
      demandProxyTonnes: marketPressureProxy, // Maintained for API compatibility
      marketPressureProxyTonnes: marketPressureProxy,
      demandIndex,
      isSynthetic: rawDailySeries[i].isSynthetic ?? true,
    });
  }

  return enriched;
}

module.exports = {
  deriveDemandFeatures,
  HEURISTIC_PRICE_SENSITIVITY_WEIGHT,
};
