/**
 * Order Aggregation Engine
 * Automatically pools multiple smaller farmer produce listings to fulfill a single large bulk requirement.
 */

const aggregateListingsForRequest = (procurementRequest, availableListings, farmerProfilesMap) => {
  const targetQuantity = procurementRequest.quantityRequiredKg;
  const crop = procurementRequest.cropName.toLowerCase();

  // Filter listings matching crop name and available status
  const matchedCropListings = availableListings.filter(
    (l) => l.cropName.toLowerCase() === crop && l.availableQuantityKg > 0 && l.status === 'AVAILABLE'
  );

  // Sort by combination of price, proximity, and trust score
  matchedCropListings.sort((a, b) => {
    const scoreA = (a.pricePerKg * 0.4) - ((farmerProfilesMap[a.farmer]?.trustScore || 90) * 0.6);
    const scoreB = (b.pricePerKg * 0.4) - ((farmerProfilesMap[b.farmer]?.trustScore || 90) * 0.6);
    return scoreA - scoreB;
  });

  let currentAccumulatedKg = 0;
  const selectedSuppliers = [];
  let totalProduceCost = 0;

  for (const listing of matchedCropListings) {
    if (currentAccumulatedKg >= targetQuantity) break;

    const remainingNeeded = targetQuantity - currentAccumulatedKg;
    const allocatedKg = Math.min(listing.availableQuantityKg, remainingNeeded);
    const subtotal = allocatedKg * listing.pricePerKg;

    const farmerProfile = farmerProfilesMap[listing.farmer] || {};

    selectedSuppliers.push({
      listingId: listing._id,
      batchId: listing.batchId,
      farmerId: listing.farmer,
      farmerName: listing.farmerName || 'Farmer Partner',
      cropName: listing.cropName,
      grade: listing.grade,
      pricePerKg: listing.pricePerKg,
      allocatedQuantityKg: allocatedKg,
      subtotalCost: subtotal,
      location: `${listing.location.district}, ${listing.location.state}`,
      trustScore: farmerProfile.trustScore || 92,
    });

    currentAccumulatedKg += allocatedKg;
    totalProduceCost += subtotal;
  }

  const isFullyFulfilled = currentAccumulatedKg >= targetQuantity;
  const estimatedLogisticsCost = Math.round(selectedSuppliers.length * 1200 + (totalProduceCost * 0.04));

  return {
    procurementRequestId: procurementRequest._id,
    targetQuantityKg: targetQuantity,
    aggregatedQuantityKg: currentAccumulatedKg,
    isFullyFulfilled,
    totalProduceCost,
    estimatedLogisticsCost,
    totalGrandCost: totalProduceCost + estimatedLogisticsCost,
    suppliersCount: selectedSuppliers.length,
    suppliers: selectedSuppliers,
  };
};

module.exports = { aggregateListingsForRequest };
