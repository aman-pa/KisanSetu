/**
 * optimizerValidator.js
 * Strict input validation and canonical parameter normalization for Mandi Optimizer.
 */

const SUPPORTED_COMMODITIES = [
  'Tomato',
  'Potato',
  'Onion',
  'Wheat',
  'Rice',
  'Apple',
  'Mustard',
  'Maize',
  'Soybean',
  'Cotton',
  'Sugarcane',
  'Banana',
  'Mango',
  'Green Chilli',
  'Garlic',
  'Ginger',
  'Turmeric',
  'Cauliflower',
  'Cabbage',
  'Brinjal',
  'Spinach',
  'Okra',
  'Carrot',
  'Capsicum',
  'Peas',
  'Cucumber',
  'Bitter Gourd',
  'Bottle Gourd',
  'Coriander',
  'Mint',
  'Groundnut',
  'Moong',
  'Urad',
  'Chana',
  'Arhar',
  'Masoor',
];

/**
 * Normalizes and validates the farmer context payload.
 * 
 * @param {Object} raw - Raw request body / query parameters
 * @returns {Object} Validated canonical parameters
 */
function validateOptimizerRequest(raw = {}) {
  const errors = [];

  // 1. Commodity Validation
  let commodity = (raw.commodity || raw.crop || '').trim();
  if (!commodity) {
    errors.push("Missing required field 'commodity' (or 'crop').");
  } else {
    // Canonical Title-Case
    commodity = commodity
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    const matched = SUPPORTED_COMMODITIES.find((c) => c.toLowerCase() === commodity.toLowerCase());
    if (!matched) {
      errors.push(`Unsupported commodity '${commodity}'. Supported commodities: ${SUPPORTED_COMMODITIES.join(', ')}.`);
    } else {
      commodity = matched;
    }
  }

  // 2. Quantity Normalization & Validation (Canonical Unit: KG)
  let quantityKg = null;
  const rawQuantity = raw.quantityKg !== undefined ? raw.quantityKg : (raw.quantity !== undefined ? raw.quantity : (raw.qty !== undefined ? raw.qty : null));
  const unit = (raw.unit || 'kg').trim().toLowerCase();

  if (rawQuantity === undefined || rawQuantity === null || rawQuantity === '') {
    // Sensible default of 1000 kg (10 quintals / 1 tonne) for exploratory queries if omitted
    quantityKg = 1000;
  } else {
    const numQty = Number(rawQuantity);
    if (isNaN(numQty) || !isFinite(numQty)) {
      errors.push("Quantity must be a valid numeric value.");
    } else if (numQty <= 0) {
      errors.push("Quantity must be greater than zero.");
    } else {
      // Unit conversion to canonical KG
      if (unit === 'quintal' || unit === 'quintals' || unit === 'q') {
        quantityKg = numQty * 100;
      } else if (unit === 'tonne' || unit === 'tonnes' || unit === 't' || unit === 'metric tonne') {
        quantityKg = numQty * 1000;
      } else if (unit === 'kg' || unit === 'kilogram' || unit === 'kilograms') {
        quantityKg = numQty;
      } else {
        errors.push(`Invalid unit '${unit}'. Supported units: 'kg', 'quintal', 'tonnes'.`);
      }
    }
  }

  // 3. Location Validation (Farmer Origin)
  let farmerLocation = null;
  const rawLoc = raw.farmerLocation || raw.location || {};
  const lat = rawLoc.lat !== undefined
    ? Number(rawLoc.lat)
    : (raw.lat !== undefined
        ? Number(raw.lat)
        : (raw.latitude !== undefined
            ? Number(raw.latitude)
            : (raw.originLat !== undefined ? Number(raw.originLat) : null)));
  const lng = rawLoc.lng !== undefined
    ? Number(rawLoc.lng)
    : (rawLoc.lon !== undefined
        ? Number(rawLoc.lon)
        : (raw.lng !== undefined
            ? Number(raw.lng)
            : (raw.lon !== undefined
                ? Number(raw.lon)
                : (raw.longitude !== undefined
                    ? Number(raw.longitude)
                    : (raw.originLng !== undefined ? Number(raw.originLng) : null)))));

  if (lat === null || lng === null) {
    // Sensible default location (Karnal, Haryana agricultural hub) for exploratory queries
    farmerLocation = {
      lat: 29.6857,
      lng: 76.9905,
      district: (rawLoc.district || raw.district || 'Karnal').trim(),
      state: (rawLoc.state || raw.state || 'Haryana').trim(),
    };
  } else if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
    errors.push("Latitude and Longitude coordinates must be valid numbers.");
  } else if (lat < -90 || lat > 90) {
    errors.push("Latitude must be between -90 and +90 degrees.");
  } else if (lng < -180 || lng > 180) {
    errors.push("Longitude must be between -180 and +180 degrees.");
  } else {
    farmerLocation = {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      district: (rawLoc.district || raw.district || '').trim() || null,
      state: (rawLoc.state || raw.state || '').trim() || null,
    };
  }

  // 4. Optional Max Distance Validation
  let maxDistanceKm = 300; // Default 300km search radius
  if (raw.maxDistanceKm !== undefined && raw.maxDistanceKm !== null && raw.maxDistanceKm !== '') {
    const numDist = Number(raw.maxDistanceKm);
    if (isNaN(numDist) || numDist <= 0) {
      errors.push("Field 'maxDistanceKm' must be a positive number.");
    } else {
      maxDistanceKm = Math.min(2000, Math.max(10, numDist));
    }
  }

  if (errors.length > 0) {
    const err = new Error(errors.join(' '));
    err.validationErrors = errors;
    err.statusCode = 400;
    throw err;
  }

  return {
    commodity,
    quantityKg: Number(quantityKg.toFixed(2)),
    quantityQuintals: Number((quantityKg / 100).toFixed(2)),
    quantityTonnes: Number((quantityKg / 1000).toFixed(3)),
    farmerLocation,
    maxDistanceKm,
    rawUnit: unit,
  };
}

module.exports = {
  validateOptimizerRequest,
  SUPPORTED_COMMODITIES,
};
