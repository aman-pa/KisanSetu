/**
 * priceSignals.js
 * Signal extraction and quantitative metric derivation for Agricultural Price Intelligence.
 * 
 * Strictly distinguishes:
 * - OBSERVED: Ground-truth mandi modal/min/max prices and physical arrivals.
 * - DERIVED: Rolling averages (7d, 30d), momentum, price volatility (std dev & CV), and supply pressure.
 */

/**
 * Computes observed and derived price/arrival signals from daily time series.
 * 
 * @param {Array<Object>} rawDailySeries - Sorted array of { date, modalPrice, minPrice, maxPrice, arrivalQuantity, market, district, state, isSynthetic }
 * @returns {Object} Extracted signal packet
 */
function extractPriceSignals(rawDailySeries) {
  const n = rawDailySeries?.length || 0;
  if (n < 3) {
    throw new Error(`Insufficient historical market data (${n} records). Minimum 3 required.`);
  }

  const sorted = [...rawDailySeries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latest = sorted[n - 1];

  // 1. Observed Physical Data
  const currentModalPrice = latest.modalPrice;
  const currentMinPrice = latest.minPrice || Math.round(currentModalPrice * 0.92);
  const currentMaxPrice = latest.maxPrice || Math.round(currentModalPrice * 1.08);
  const currentArrival = latest.arrivalQuantity;
  const observationDate = latest.date;

  // 2. 7-day and 30-day Rolling Windows (Backward-looking only, zero future leakage)
  const window7 = sorted.slice(Math.max(0, n - 7));
  const window30 = sorted.slice(Math.max(0, n - 30));

  const avgPrice7d = window7.reduce((s, r) => s + r.modalPrice, 0) / window7.length;
  const avgPrice30d = window30.reduce((s, r) => s + r.modalPrice, 0) / window30.length;

  const avgArrival7d = window7.reduce((s, r) => s + r.arrivalQuantity, 0) / window7.length;
  const avgArrival30d = window30.reduce((s, r) => s + r.arrivalQuantity, 0) / window30.length;

  // 3. Derived Price Metrics
  const priceDev30dPercent = ((currentModalPrice - avgPrice30d) / (avgPrice30d + 1e-6)) * 100;
  const priceDev7dPercent = ((currentModalPrice - avgPrice7d) / (avgPrice7d + 1e-6)) * 100;

  // Price Trend Momentum
  let priceTrendDirection = 'STABLE';
  if (priceDev7dPercent >= 1.5) {
    priceTrendDirection = 'PRICE_TREND_UP';
  } else if (priceDev7dPercent <= -1.5) {
    priceTrendDirection = 'PRICE_TREND_DOWN';
  }

  // 4. Volatility Metrics (Standard Deviation & Coefficient of Variation over 30d window)
  const priceVariance = window30.reduce((s, r) => s + Math.pow(r.modalPrice - avgPrice30d, 2), 0) / window30.length;
  const priceStdDev = Math.sqrt(priceVariance);
  const priceCoeffVariation = (priceStdDev / (avgPrice30d + 1e-6)) * 100;

  let volatilityLevel = 'MODERATE';
  if (priceCoeffVariation < 5.0) {
    volatilityLevel = 'LOW';
  } else if (priceCoeffVariation > 12.0) {
    volatilityLevel = 'HIGH';
  }

  // 5. Supply & Arrival Pressure Metrics
  const arrivalChangePercent = ((avgArrival7d - avgArrival30d) / (avgArrival30d + 1e-6)) * 100;

  let supplyPressure = 'NORMAL_SUPPLY';
  let supplyPressureLabel = 'Normal Supply Equilibrium';
  if (arrivalChangePercent > 15.0) {
    supplyPressure = 'SUPPLY_GLUT';
    supplyPressureLabel = 'Supply Influx (Glut Risk)';
  } else if (arrivalChangePercent < -15.0) {
    supplyPressure = 'SUPPLY_SHORTAGE';
    supplyPressureLabel = 'Tight Supply (Arrivals Falling)';
  }

  return {
    observed: {
      currentModalPricePerQuintal: Math.round(currentModalPrice),
      currentPricePerKg: Math.round((currentModalPrice / 100) * 10) / 10,
      minPricePerQuintal: Math.round(currentMinPrice),
      maxPricePerQuintal: Math.round(currentMaxPrice),
      currentArrivalTonnes: Math.round(currentArrival * 10) / 10,
      observationDate,
      market: latest.market || latest.district || 'APMC Mandi',
      district: latest.district || 'Delhi NCR',
      state: latest.state || 'Delhi',
      isSynthetic: latest.isSynthetic ?? true,
      dataSource: latest.isSynthetic ? 'SEEDED_DEMO_AGMARKNET' : 'OBSERVED_APMC_FEED',
    },
    derived: {
      historicalAverage7d: Math.round(avgPrice7d),
      historicalAverage30d: Math.round(avgPrice30d),
      priceDeviationFrom30dPercent: Math.round(priceDev30dPercent * 10) / 10,
      priceDeviationFrom7dPercent: Math.round(priceDev7dPercent * 10) / 10,
      priceTrendDirection,
      priceTrendLabel: priceTrendDirection === 'PRICE_TREND_UP' ? 'Bullish (Rising)' : priceTrendDirection === 'PRICE_TREND_DOWN' ? 'Bearish (Falling)' : 'Stable / Rangebound',
      priceStdDev: Math.round(priceStdDev),
      priceCoeffVariationPercent: Math.round(priceCoeffVariation * 10) / 10,
      volatilityLevel,
      historicalArrivalAvg7dTonnes: Math.round(avgArrival7d * 10) / 10,
      historicalArrivalAvg30dTonnes: Math.round(avgArrival30d * 10) / 10,
      arrivalChangePercent: Math.round(arrivalChangePercent * 10) / 10,
      supplyPressure,
      supplyPressureLabel,
      totalHistoricalObservations: n,
    },
  };
}

module.exports = {
  extractPriceSignals,
};
