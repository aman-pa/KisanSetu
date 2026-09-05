/**
 * marketDataValidator.js
 * Strict runtime validation for raw agricultural market records from external APIs.
 * Ensures data integrity before records enter the KisanSetu pipeline.
 */

class MarketDataValidator {
  /**
   * Validate raw Agmarknet / data.gov.in price record.
   * @param {Object} raw
   * @returns {{ isValid: boolean, sanitized: Object|null, errors: Array<string> }}
   */
  static validatePriceRecord(raw) {
    const errors = [];
    if (!raw || typeof raw !== 'object') {
      return { isValid: false, sanitized: null, errors: ['Record is null or not an object'] };
    }

    const commodity = String(raw.commodity || '').trim();
    if (!commodity) errors.push('Missing commodity name');

    const market = String(raw.market || '').trim();
    if (!market) errors.push('Missing market / mandi name');

    const district = String(raw.district || '').trim();
    const state = String(raw.state || '').trim();

    // Parse and validate prices
    const modalPrice = Number(raw.modal_price || raw.modalPrice || 0);
    const minPrice = Number(raw.min_price || raw.minPrice || 0);
    const maxPrice = Number(raw.max_price || raw.maxPrice || 0);

    if (isNaN(modalPrice) || modalPrice <= 0) {
      errors.push(`Invalid modalPrice: ${raw.modal_price || raw.modalPrice}`);
    }
    if (isNaN(minPrice) || minPrice < 0) {
      errors.push(`Invalid minPrice: ${raw.min_price || raw.minPrice}`);
    }
    if (isNaN(maxPrice) || maxPrice < 0) {
      errors.push(`Invalid maxPrice: ${raw.max_price || raw.maxPrice}`);
    }

    // Logic consistency: minPrice <= modalPrice <= maxPrice (auto-correct inverted spreads if close)
    let finalMin = minPrice > 0 ? minPrice : modalPrice;
    let finalMax = maxPrice > 0 ? maxPrice : modalPrice;
    let finalModal = modalPrice;

    if (finalMin > finalModal) finalMin = finalModal;
    if (finalMax < finalModal) finalMax = finalModal;

    // Parse arrival date
    let arrivalDate = new Date(raw.arrival_date || raw.arrivalDate || Date.now());
    if (isNaN(arrivalDate.getTime())) {
      arrivalDate = new Date();
    }

    if (errors.length > 0) {
      return { isValid: false, sanitized: null, errors };
    }

    return {
      isValid: true,
      sanitized: {
        commodity,
        variety: String(raw.variety || 'Standard').trim(),
        grade: String(raw.grade || 'GRADE_A').trim(),
        state: state || 'National',
        district: district || 'APMC Region',
        market,
        arrivalDate,
        minPrice: Math.round(finalMin),
        maxPrice: Math.round(finalMax),
        modalPrice: Math.round(finalModal),
        modalPricePerKg: Number((finalModal / 100).toFixed(2)),
        unit: 'Rs/Quintal',
      },
      errors: [],
    };
  }

  /**
   * Validate raw arrival record.
   * @param {Object} raw
   * @returns {{ isValid: boolean, sanitized: Object|null, errors: Array<string> }}
   */
  static validateArrivalRecord(raw) {
    const errors = [];
    if (!raw || typeof raw !== 'object') {
      return { isValid: false, sanitized: null, errors: ['Arrival record is null or not an object'] };
    }

    const commodity = String(raw.commodity || '').trim();
    if (!commodity) errors.push('Missing commodity name');

    const market = String(raw.market || '').trim();
    if (!market) errors.push('Missing market name');

    const arrivalQuantity = Number(raw.arrival_quantity || raw.arrivalQuantity || raw.arrivalsInTonnes || 0);
    if (isNaN(arrivalQuantity) || arrivalQuantity < 0) {
      errors.push(`Invalid arrivalQuantity: ${raw.arrival_quantity || raw.arrivalQuantity}`);
    }

    let arrivalDate = new Date(raw.arrival_date || raw.arrivalDate || Date.now());
    if (isNaN(arrivalDate.getTime())) {
      arrivalDate = new Date();
    }

    if (errors.length > 0) {
      return { isValid: false, sanitized: null, errors };
    }

    return {
      isValid: true,
      sanitized: {
        commodity,
        market,
        district: String(raw.district || '').trim() || 'APMC Region',
        state: String(raw.state || '').trim() || 'National',
        arrivalDate,
        arrivalQuantity: Number(arrivalQuantity.toFixed(1)),
        unit: 'Tonnes',
      },
      errors: [],
    };
  }
}

module.exports = MarketDataValidator;
