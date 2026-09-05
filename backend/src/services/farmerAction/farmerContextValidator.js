/**
 * farmerContextValidator.js
 * Input validation and normalization for Farmer Action Intelligence requests.
 */

const SUPPORTED_COMMODITIES = ['Tomato', 'Potato', 'Onion', 'Wheat', 'Rice', 'Apple'];
const SUPPORTED_UNITS = ['quintal', 'quintals', 'tonne', 'tonnes', 'ton', 'tons', 'kg', 'kgs', 'kilogram', 'kilograms'];

/**
 * Validates and normalizes farmer input parameters.
 * 
 * @param {Object} params
 * @param {string} params.commodity
 * @param {string} params.mandi
 * @param {number|string} params.quantity
 * @param {string} [params.unit='quintal']
 * @param {string} [params.expectedSellingDate]
 * @returns {Object} Normalized farmer context
 */
function validateFarmerContext(params = {}) {
  const { commodity, crop, mandi, market, district, quantity, qty, unit = 'quintal', expectedSellingDate, date } = params;

  const rawCommodity = commodity || crop || 'Tomato';
  const cleanCommodity = rawCommodity.charAt(0).toUpperCase() + rawCommodity.slice(1).toLowerCase();

  if (!SUPPORTED_COMMODITIES.includes(cleanCommodity)) {
    const error = new Error(`Unsupported commodity '${rawCommodity}'. Supported commodities: ${SUPPORTED_COMMODITIES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const cleanMandi = (mandi || market || district || 'Karnal').trim();
  if (!cleanMandi || cleanMandi.length < 2) {
    const error = new Error('Invalid mandi/market name provided.');
    error.statusCode = 400;
    throw error;
  }

  // Quantity validation
  const rawQty = quantity ?? qty ?? 10;
  const numQty = parseFloat(rawQty);

  if (isNaN(numQty) || numQty <= 0) {
    const error = new Error(`Invalid quantity '${rawQty}'. Quantity must be a positive number greater than 0.`);
    error.statusCode = 400;
    throw error;
  }

  if (numQty > 100000) {
    const error = new Error('Quantity exceeds realistic single-farmer lot limit (100,000).');
    error.statusCode = 400;
    throw error;
  }

  // Unit normalization
  const cleanUnit = (unit || 'quintal').toLowerCase().trim();
  if (!SUPPORTED_UNITS.includes(cleanUnit)) {
    const error = new Error(`Unsupported unit '${unit}'. Supported units: quintal, tonne, kg.`);
    error.statusCode = 400;
    throw error;
  }

  // Convert quantity to standard quintals for internal value calculations (1 quintal = 100 kg, 1 tonne = 10 quintals)
  let quantityInQuintals = numQty;
  let standardUnitLabel = 'quintals';

  if (cleanUnit.startsWith('ton')) {
    quantityInQuintals = numQty * 10.0;
    standardUnitLabel = 'tonnes';
  } else if (cleanUnit.startsWith('kg') || cleanUnit.startsWith('kilo')) {
    quantityInQuintals = numQty / 100.0;
    standardUnitLabel = 'kg';
  }

  // Optional date validation
  let cleanDate = null;
  const rawDate = expectedSellingDate || date;
  if (rawDate) {
    const parsedDate = new Date(rawDate);
    if (isNaN(parsedDate.getTime())) {
      const error = new Error(`Malformed expected selling date '${rawDate}'. Expected format: YYYY-MM-DD.`);
      error.statusCode = 400;
      throw error;
    }
    cleanDate = parsedDate.toISOString().slice(0, 10);
  }

  return {
    commodity: cleanCommodity,
    mandi: cleanMandi,
    quantity: numQty,
    unit: standardUnitLabel,
    quantityInQuintals: Math.round(quantityInQuintals * 100) / 100,
    expectedSellingDate: cleanDate,
  };
}

module.exports = {
  validateFarmerContext,
  SUPPORTED_COMMODITIES,
  SUPPORTED_UNITS,
};
