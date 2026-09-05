/**
 * weatherDataValidator.js
 * Validates external live weather responses (e.g. Open-Meteo) before normalization.
 */

class WeatherDataValidator {
  /**
   * Validate Open-Meteo API response structure.
   * @param {Object} data
   * @returns {{ isValid: boolean, errors: Array<string> }}
   */
  static validateOpenMeteoResponse(data) {
    const errors = [];
    if (!data || typeof data !== 'object') {
      return { isValid: false, errors: ['Weather payload is null or not an object'] };
    }

    if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
      errors.push('Missing or invalid latitude/longitude coordinates');
    }

    if (!data.current || typeof data.current !== 'object') {
      errors.push('Missing current weather object');
    } else {
      if (typeof data.current.temperature_2m !== 'number') {
        errors.push('Missing current temperature_2m');
      }
      if (typeof data.current.relative_humidity_2m !== 'number') {
        errors.push('Missing current relative_humidity_2m');
      }
    }

    if (!data.daily || typeof data.daily !== 'object') {
      errors.push('Missing daily forecast object');
    } else {
      if (!Array.isArray(data.daily.time) || data.daily.time.length === 0) {
        errors.push('daily.time must be a non-empty array of dates');
      }
      if (!Array.isArray(data.daily.precipitation_sum)) {
        errors.push('daily.precipitation_sum must be an array');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = WeatherDataValidator;
