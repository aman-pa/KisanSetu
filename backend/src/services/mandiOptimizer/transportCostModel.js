/**
 * transportCostModel.js
 * Configurable transportation and logistics cost model for KisanSetu Mandi Optimizer.
 * 
 * IMPORTANT INTEGRITY RULE:
 * This model produces algorithmic cost ESTIMATES based on vehicle freight baselines.
 * It is clearly labeled as an estimate and never claimed to be a live binding carrier quote.
 */

const VEHICLE_TIERS = {
  MINI_TRUCK: {
    name: 'Small Commercial Vehicle (e.g. Tata Ace / Bolero Pickup)',
    maxCapacityKg: 1500,
    baseRatePerKm: 12.0, // ₹ / km
    weightSurchargePerTonneKm: 1.5, // ₹ / tonne-km
    fixedLoadingUnloadingCost: 250, // ₹
  },
  LCV: {
    name: 'Light Commercial Vehicle (e.g. 14-ft Eicher / Canter)',
    maxCapacityKg: 5000,
    baseRatePerKm: 18.0,
    weightSurchargePerTonneKm: 1.2,
    fixedLoadingUnloadingCost: 500,
  },
  MEDIUM_TRUCK: {
    name: 'Medium Commercial Truck (e.g. 6-Wheeler 10-Tonne Truck)',
    maxCapacityKg: 10000,
    baseRatePerKm: 26.0,
    weightSurchargePerTonneKm: 0.9,
    fixedLoadingUnloadingCost: 800,
  },
  HEAVY_TRUCK: {
    name: 'Heavy Commercial Multi-Axle Truck (>10T)',
    maxCapacityKg: 25000,
    baseRatePerKm: 34.0,
    weightSurchargePerTonneKm: 0.75,
    fixedLoadingUnloadingCost: 1200,
  },
};

const DEFAULT_CONFIG = {
  defaultBaseRatePerKm: 14.0,
  defaultWeightSurchargePerTonneKm: 1.0,
  minimumLogisticsCharge: 300, // ₹ Minimum freight charge for short distances
  tollSurchargePerKm: 0.50, // ₹ / km estimated highway toll allowance
};

/**
 * Select recommended vehicle tier based on total cargo payload weight (in kg).
 */
function selectVehicleTier(quantityKg) {
  if (quantityKg <= VEHICLE_TIERS.MINI_TRUCK.maxCapacityKg) {
    return VEHICLE_TIERS.MINI_TRUCK;
  }
  if (quantityKg <= VEHICLE_TIERS.LCV.maxCapacityKg) {
    return VEHICLE_TIERS.LCV;
  }
  if (quantityKg <= VEHICLE_TIERS.MEDIUM_TRUCK.maxCapacityKg) {
    return VEHICLE_TIERS.MEDIUM_TRUCK;
  }
  return VEHICLE_TIERS.HEAVY_TRUCK;
}

/**
 * Calculate estimated transportation and logistics cost for a given distance and quantity.
 * 
 * @param {Object} params
 * @param {number} params.distanceKm - Estimated road distance in kilometers
 * @param {number} params.quantityKg - Quantity in kilograms
 * @param {Object} [params.customConfig] - Optional custom rates override
 * @returns {Object} Detailed cost breakdown and assumptions
 */
function calculateTransportCost({ distanceKm, quantityKg, customConfig = {} }) {
  if (typeof distanceKm !== 'number' || distanceKm <= 0 || isNaN(distanceKm)) {
    throw new Error('Valid positive distanceKm is required for transport cost calculation.');
  }
  if (typeof quantityKg !== 'number' || quantityKg <= 0 || isNaN(quantityKg)) {
    throw new Error('Valid positive quantityKg is required for transport cost calculation.');
  }

  const config = { ...DEFAULT_CONFIG, ...customConfig };
  const quantityTonnes = quantityKg / 1000;
  const vehicleTier = selectVehicleTier(quantityKg);

  const baseRatePerKm = customConfig.baseRatePerKm || vehicleTier.baseRatePerKm;
  const weightSurchargePerTonneKm =
    customConfig.weightSurchargePerTonneKm || vehicleTier.weightSurchargePerTonneKm;
  const fixedLoadingCost =
    customConfig.fixedLoadingCost !== undefined
      ? customConfig.fixedLoadingCost
      : vehicleTier.fixedLoadingUnloadingCost;

  // Formula:
  // Base Linehaul Cost = distanceKm * baseRatePerKm
  // Weight Variable Cost = distanceKm * quantityTonnes * weightSurchargePerTonneKm
  // Toll Allowance = distanceKm * tollSurchargePerKm
  const linehaulCost = distanceKm * baseRatePerKm;
  const weightVariableCost = distanceKm * quantityTonnes * weightSurchargePerTonneKm;
  const tollCost = distanceKm * (config.tollSurchargePerKm || 0);

  const rawTotalCost = linehaulCost + weightVariableCost + tollCost + fixedLoadingCost;
  const totalCost = Math.max(config.minimumLogisticsCharge, Math.round(rawTotalCost));
  const costPerKg = Number((totalCost / quantityKg).toFixed(2));
  const effectiveRatePerKm = Number((totalCost / distanceKm).toFixed(2));

  return {
    estimatedTotalCost: totalCost,
    costPerKg,
    effectiveRatePerKm,
    vehicleTier: vehicleTier.name,
    breakdown: {
      linehaulFreightCost: Math.round(linehaulCost),
      weightVariableSurcharge: Math.round(weightVariableCost),
      tollAllowance: Math.round(tollCost),
      loadingHandlingCost: Math.round(fixedLoadingCost),
    },
    assumptions: {
      distanceKm,
      quantityKg,
      quantityTonnes: Number(quantityTonnes.toFixed(2)),
      baseRatePerKm,
      weightSurchargePerTonneKm,
      logisticsPricingModel: 'VEHICLE_TIERED_DISTANCE_WEIGHT_MODEL',
      disclaimer: 'Logistics cost is an algorithmic estimate based on regional freight standards, not an active binding quote.',
    },
    logisticsSource: 'ESTIMATED',
    isEstimated: true,
  };
}

module.exports = {
  VEHICLE_TIERS,
  DEFAULT_CONFIG,
  selectVehicleTier,
  calculateTransportCost,
};
