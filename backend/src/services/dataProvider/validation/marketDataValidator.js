/**
 * marketDataValidator.js
 * Strict runtime validation for raw agricultural market records from external APIs.
 * Ensures data integrity before records enter the KisanSetu pipeline.
 */

class MarketDataValidator {
  /**
   * Robust parser for dates formatted as DD/MM/YYYY (e.g. 05/09/2026), DD-MM-YYYY, or ISO formats.
   * @param {string|Date} dateInput
   * @returns {Date}
   */
  static parseArrivalDate(dateInput) {
    if (!dateInput) return new Date();
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) return dateInput;

    const str = String(dateInput).trim();
    // Match DD/MM/YYYY or DD-MM-YYYY (Agmarknet official date format)
    const ddmmyyyyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmyyyyMatch) {
      const day = parseInt(ddmmyyyyMatch[1], 10);
      const month = parseInt(ddmmyyyyMatch[2], 10) - 1; // 0-indexed in JS
      const year = parseInt(ddmmyyyyMatch[3], 10);
      const parsed = new Date(year, month, day);
      if (!isNaN(parsed.getTime())) return parsed;
    }

    // Match YYYY-MM-DD (ISO format)
    const yyyymmddMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (yyyymmddMatch) {
      const year = parseInt(yyyymmddMatch[1], 10);
      const month = parseInt(yyyymmddMatch[2], 10) - 1;
      const day = parseInt(yyyymmddMatch[3], 10);
      const parsed = new Date(year, month, day);
      if (!isNaN(parsed.getTime())) return parsed;
    }

    const fallback = new Date(str);
    return isNaN(fallback.getTime()) ? new Date() : fallback;
  }

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

    // Logic consistency: minPrice <= modalPrice <= maxPrice
    let finalMin = minPrice > 0 ? minPrice : modalPrice;
    let finalMax = maxPrice > 0 ? maxPrice : modalPrice;
    let finalModal = modalPrice;

    if (finalMin > finalModal) finalMin = finalModal;
    if (finalMax < finalModal) finalMax = finalModal;

    // Parse arrival date accurately (DD/MM/YYYY support)
    const arrivalDate = this.parseArrivalDate(raw.arrival_date || raw.arrivalDate);

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

    const arrivalDate = this.parseArrivalDate(raw.arrival_date || raw.arrivalDate);

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
