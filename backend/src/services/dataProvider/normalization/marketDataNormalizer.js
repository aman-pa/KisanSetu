/**
 * marketDataNormalizer.js
 * Standardizes raw external market datasets into uniform KisanSetu entities.
 */

const { DATA_SOURCES } = require('../MarketDataProvider');
const MarketDataValidator = require('../validation/marketDataValidator');

class MarketDataNormalizer {
  /**
   * Normalize an array of raw price records from Agmarknet or external API.
   * @param {Array} rawRecords
   * @param {Object} context
   * @returns {{ records: Array, validCount: number, rejectedCount: number }}
   */
  static normalizePrices(rawRecords = [], context = {}) {
    const validRecords = [];
    let rejectedCount = 0;

    for (const raw of rawRecords) {
      const { isValid, sanitized, errors } = MarketDataValidator.validatePriceRecord(raw);
      if (isValid && sanitized) {
        validRecords.push({
          ...sanitized,
          source: context.source || DATA_SOURCES.LIVE_EXTERNAL,
          sourceTimestamp: context.sourceTimestamp || new Date().toISOString(),
          isSynthetic: false,
        });
      } else {
        rejectedCount++;
      }
    }

    return {
      records: validRecords,
      validCount: validRecords.length,
      rejectedCount,
    };
  }

  /**
   * Normalize an array of raw arrival records.
   * @param {Array} rawArrivals
   * @param {Object} context
   * @returns {{ arrivals: Array, validCount: number, rejectedCount: number }}
   */
  static normalizeArrivals(rawArrivals = [], context = {}) {
    const validArrivals = [];
    let rejectedCount = 0;

    for (const raw of rawArrivals) {
      const { isValid, sanitized } = MarketDataValidator.validateArrivalRecord(raw);
      if (isValid && sanitized) {
        validArrivals.push({
          ...sanitized,
          source: context.source || DATA_SOURCES.LIVE_EXTERNAL,
          sourceTimestamp: context.sourceTimestamp || new Date().toISOString(),
          isSynthetic: false,
        });
      } else {
        rejectedCount++;
      }
    }

    return {
      arrivals: validArrivals,
      validCount: validArrivals.length,
      rejectedCount,
    };
  }
}

module.exports = MarketDataNormalizer;
