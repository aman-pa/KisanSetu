/**
 * Smart Farmer-Buyer Matching Algorithm
 * Calculates weighted compatibility score between a Bulk Procurement Request and Produce Listings.
 * 
 * Weights:
 * - Price Match: 30%
 * - Distance Proximity: 25%
 * - Quality Grade Alignment: 20%
 * - Quantity Match Capability: 15%
 * - Farmer Reliability / Trust Score: 10%
 */

const calculateMatchScore = (procurementRequest, listing, farmerProfile) => {
  // 1. Price Match (30%)
  // If price <= maxBudget, score 100%. If higher, score decays linearly.
  let priceScore = 100;
  if (listing.pricePerKg > procurementRequest.maxBudgetPerKg) {
    const diff = listing.pricePerKg - procurementRequest.maxBudgetPerKg;
    priceScore = Math.max(0, 100 - (diff / procurementRequest.maxBudgetPerKg) * 200);
  } else {
    // Bonus for lower prices
    const savings = procurementRequest.maxBudgetPerKg - listing.pricePerKg;
    priceScore = Math.min(100, 85 + (savings / procurementRequest.maxBudgetPerKg) * 50);
  }

  // 2. Distance Proximity (25%)
  // Estimate distance between farmer district/state and delivery location
  let distanceKm = 120; // Default estimate
  if (listing.location && procurementRequest.deliveryLocation) {
    if (listing.location.district === procurementRequest.deliveryLocation.district) {
      distanceKm = 25;
    } else if (listing.location.state === procurementRequest.deliveryLocation.state) {
      distanceKm = 110;
    } else {
      distanceKm = 350;
    }
  }
  let distanceScore = Math.max(10, 100 - (distanceKm / 500) * 90);

  // 3. Quality Grade Alignment (20%)
  const gradeRank = { GRADE_A: 3, GRADE_B: 2, GRADE_C: 1 };
  const requestedRank = gradeRank[procurementRequest.qualityGrade] || 3;
  const listingRank = gradeRank[listing.grade] || 2;
  let qualityScore = 100;
  if (listingRank < requestedRank) {
    qualityScore = 50;
  } else if (listingRank > requestedRank) {
    qualityScore = 95;
  }

  // 4. Quantity Match Capability (15%)
  const available = listing.availableQuantityKg || listing.quantityKg;
  let quantityScore = 100;
  if (available < procurementRequest.quantityRequiredKg) {
    // Fractional availability score
    quantityScore = Math.min(100, (available / procurementRequest.quantityRequiredKg) * 100);
  }

  // 5. Reliability / Trust Score (10%)
  const reliabilityScore = farmerProfile ? (farmerProfile.trustScore || 90) : 90;

  // Final Weighted Calculation
  const totalWeightedScore = Math.round(
    priceScore * 0.30 +
    distanceScore * 0.25 +
    qualityScore * 0.20 +
    quantityScore * 0.15 +
    reliabilityScore * 0.10
  );

  return {
    matchScore: totalWeightedScore,
    estimatedDistanceKm: distanceKm,
    breakdown: {
      priceScore: Math.round(priceScore),
      distanceScore: Math.round(distanceScore),
      qualityScore: Math.round(qualityScore),
      quantityScore: Math.round(quantityScore),
      reliabilityScore: Math.round(reliabilityScore),
    },
    reasons: [
      `Price: ₹${listing.pricePerKg}/kg vs budget max ₹${procurementRequest.maxBudgetPerKg}/kg (${Math.round(priceScore)}% match)`,
      `Proximity: ~${distanceKm} km away in ${listing.location.district}, ${listing.location.state} (${Math.round(distanceScore)}% match)`,
      `Quality: ${listing.grade} produce matches requested ${procurementRequest.qualityGrade}`,
      `Quantity: ${available.toLocaleString()} kg available of ${procurementRequest.quantityRequiredKg.toLocaleString()} kg needed`,
      `Farmer Trust Score: ${reliabilityScore}/100`,
    ],
  };
};

module.exports = { calculateMatchScore };
