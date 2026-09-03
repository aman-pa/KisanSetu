/**
 * seedMarketData.js
 * Generates realistic historical agricultural market datasets for SIH 2026.
 * Covers 6 key commodities across 8 major Indian trading districts/mandis over a 90-day time horizon.
 * 
 * Strict Integrity:
 * Clearly tags all generated records with isSynthetic: true and source: 'SEEDED_DEMO'.
 */

const MarketPrice = require('../models/MarketPrice');
const CommodityArrival = require('../models/CommodityArrival');
const { DATA_SOURCES } = require('../services/dataProvider/MarketDataProvider');

// Agricultural baseline profiles with seasonality and price parameters
const COMMODITY_PROFILES = {
  Tomato: {
    category: 'VEGETABLES',
    variety: 'Hybrid / Desi',
    basePriceQuintal: 2600, // ₹26/kg base
    priceVolatility: 0.22,
    seasonalityPeriodDays: 60,
    seasonalityPhase: 0.8,
    baseArrivalTonnes: 65,
    unit: 'Rs/Quintal',
    arrivalUnit: 'Tonnes',
  },
  Potato: {
    category: 'VEGETABLES',
    variety: 'Pukhraj / Jyoti',
    basePriceQuintal: 1650, // ₹16.50/kg base
    priceVolatility: 0.10,
    seasonalityPeriodDays: 90,
    seasonalityPhase: 1.5,
    baseArrivalTonnes: 120,
    unit: 'Rs/Quintal',
    arrivalUnit: 'Tonnes',
  },
  Onion: {
    category: 'VEGETABLES',
    variety: 'Nasik Red / Garwa',
    basePriceQuintal: 2850, // ₹28.50/kg base
    priceVolatility: 0.18,
    seasonalityPeriodDays: 75,
    seasonalityPhase: 2.2,
    baseArrivalTonnes: 180,
    unit: 'Rs/Quintal',
    arrivalUnit: 'Tonnes',
  },
  Wheat: {
    category: 'GRAINS',
    variety: 'HD-2967 / Sharbati',
    basePriceQuintal: 2420, // ₹24.20/kg base (near Govt MSP)
    priceVolatility: 0.05,
    seasonalityPeriodDays: 120,
    seasonalityPhase: 0.3,
    baseArrivalTonnes: 210,
    unit: 'Rs/Quintal',
    arrivalUnit: 'Tonnes',
  },
  Rice: {
    category: 'GRAINS',
    variety: 'PB-1121 Basmati / Sona Masoori',
    basePriceQuintal: 3450, // ₹34.50/kg base
    priceVolatility: 0.07,
    seasonalityPeriodDays: 120,
    seasonalityPhase: 3.1,
    baseArrivalTonnes: 150,
    unit: 'Rs/Quintal',
    arrivalUnit: 'Tonnes',
  },
  Apple: {
    category: 'FRUITS',
    variety: 'Royal Delicious / Shimla',
    basePriceQuintal: 8800, // ₹88/kg base
    priceVolatility: 0.14,
    seasonalityPeriodDays: 90,
    seasonalityPhase: 4.2,
    baseArrivalTonnes: 45,
    unit: 'Rs/Quintal',
    arrivalUnit: 'Tonnes',
  },
};

// Target markets and regional volume multipliers
const MANDI_LOCATIONS = [
  { market: 'Karnal Mandi', district: 'Karnal', state: 'Haryana', volumeFactor: 1.1, priceFactor: 0.98 },
  { market: 'Panipat Mandi', district: 'Panipat', state: 'Haryana', volumeFactor: 0.9, priceFactor: 0.99 },
  { market: 'Ambala City Mandi', district: 'Ambala', state: 'Haryana', volumeFactor: 1.0, priceFactor: 1.01 },
  { market: 'Jalandhar Cantt Mandi', district: 'Jalandhar', state: 'Punjab', volumeFactor: 1.3, priceFactor: 0.97 },
  { market: 'Azadpur APMC Mandi', district: 'Delhi NCR', state: 'Delhi', volumeFactor: 3.5, priceFactor: 1.12 },
  { market: 'Ghazipur Mandi', district: 'Delhi NCR', state: 'Delhi', volumeFactor: 2.2, priceFactor: 1.08 },
  { market: 'Lasalgaon Mandi', district: 'Nashik', state: 'Maharashtra', volumeFactor: 4.0, priceFactor: 0.92 }, // Onion hub
  { market: 'Agra Mandi', district: 'Agra', state: 'Uttar Pradesh', volumeFactor: 2.5, priceFactor: 0.94 }, // Potato hub
];

// Deterministic pseudo-random generator with seed to ensure reproducible variance
const createSeededRandom = (seedInit) => {
  let seed = seedInit;
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
};

/**
 * Seed historical market prices and arrival quantities.
 * @param {boolean} [forceRefresh=false] - If true, clears existing records first.
 * @returns {Promise<{ pricesCount: number, arrivalsCount: number }>}
 */
const seedMarketData = async (forceRefresh = false) => {
  try {
    const existingPrices = await MarketPrice.countDocuments();
    if (existingPrices > 0 && !forceRefresh) {
      console.log(`[MarketDataSeed] Existing market data found (${existingPrices} records). Skipping duplicate seed.`);
      const existingArrivals = await CommodityArrival.countDocuments();
      return { pricesCount: existingPrices, arrivalsCount: existingArrivals };
    }

    if (forceRefresh) {
      await Promise.all([MarketPrice.deleteMany({}), CommodityArrival.deleteMany({})]);
      console.log('[MarketDataSeed] Cleared existing market price & arrival records.');
    }

    console.log('[MarketDataSeed] Generating 90-day agricultural market time-series dataset...');

    const pricesToInsert = [];
    const arrivalsToInsert = [];
    const rng = createSeededRandom(20260903);

    const now = new Date();
    const DAYS_OF_HISTORY = 90;

    for (let dayOffset = DAYS_OF_HISTORY; dayOffset >= 0; dayOffset--) {
      const recordDate = new Date(now.getTime() - dayOffset * 86400000);
      recordDate.setHours(10, 30, 0, 0); // Standard mandi morning arrival auction time

      for (const [commodityName, profile] of Object.entries(COMMODITY_PROFILES)) {
        for (const loc of MANDI_LOCATIONS) {
          // Filter out hubs that don't trade certain crops
          if (loc.market === 'Lasalgaon Mandi' && !['Onion', 'Tomato', 'Wheat'].includes(commodityName)) continue;
          if (loc.market === 'Agra Mandi' && !['Potato', 'Tomato', 'Wheat', 'Rice'].includes(commodityName)) continue;

          // 1. Calculate price seasonality wave + noise
          const dayAngle = (dayOffset / profile.seasonalityPeriodDays) * 2 * Math.PI + profile.seasonalityPhase;
          const seasonalMultiplier = 1 + Math.sin(dayAngle) * profile.priceVolatility;
          const randomNoise = 1 + (rng() - 0.5) * 0.08; // +/- 4% daily trading noise

          const modalPrice = Math.round(
            profile.basePriceQuintal * loc.priceFactor * seasonalMultiplier * randomNoise
          );

          const minSpread = 0.92 + rng() * 0.04; // 92% - 96% of modal
          const maxSpread = 1.05 + rng() * 0.06; // 105% - 111% of modal

          const minPrice = Math.round(modalPrice * minSpread);
          const maxPrice = Math.round(modalPrice * maxSpread);

          // 2. Calculate arrival tonnage (inverse relationship to price surge)
          const arrivalNoise = 1 + (rng() - 0.5) * 0.25; // +/- 12.5% arrival volume variance
          const supplyElasticityFactor = 1 / Math.sqrt(seasonalMultiplier);
          const arrivalQuantity = Math.max(
            5,
            Math.round(profile.baseArrivalTonnes * loc.volumeFactor * supplyElasticityFactor * arrivalNoise * 10) / 10
          );

          // Market Price record
          pricesToInsert.push({
            commodity: commodityName,
            variety: profile.variety,
            grade: 'GRADE_A',
            state: loc.state,
            district: loc.district,
            market: loc.market,
            arrivalDate: recordDate,
            minPrice,
            maxPrice,
            modalPrice,
            unit: profile.unit,
            source: DATA_SOURCES.SEEDED_DEMO,
            sourceTimestamp: recordDate,
            isSynthetic: true,
          });

          // Commodity Arrival record
          arrivalsToInsert.push({
            commodity: commodityName,
            variety: profile.variety,
            state: loc.state,
            district: loc.district,
            market: loc.market,
            arrivalDate: recordDate,
            arrivalQuantity,
            unit: profile.arrivalUnit,
            source: DATA_SOURCES.SEEDED_DEMO,
            sourceTimestamp: recordDate,
            isSynthetic: true,
          });
        }
      }
    }

    // Insert in batches of 500 for optimal MongoDB throughput
    const BATCH_SIZE = 500;
    for (let i = 0; i < pricesToInsert.length; i += BATCH_SIZE) {
      await MarketPrice.insertMany(pricesToInsert.slice(i, i + BATCH_SIZE));
    }
    for (let i = 0; i < arrivalsToInsert.length; i += BATCH_SIZE) {
      await CommodityArrival.insertMany(arrivalsToInsert.slice(i, i + BATCH_SIZE));
    }

    console.log(
      `[MarketDataSeed] Successfully seeded ${pricesToInsert.length} MarketPrice records and ${arrivalsToInsert.length} CommodityArrival records!`
    );

    return {
      pricesCount: pricesToInsert.length,
      arrivalsCount: arrivalsToInsert.length,
    };
  } catch (err) {
    console.error('[MarketDataSeed Error]', err);
    throw err;
  }
};

module.exports = seedMarketData;
