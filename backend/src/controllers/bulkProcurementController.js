const ProcurementRequest = require('../models/ProcurementRequest');
const ProduceListing = require('../models/ProduceListing');
const FarmerProfile = require('../models/FarmerProfile');
const User = require('../models/User');
const { calculateMatchScore } = require('../services/matchingService');
const { aggregateListingsForRequest } = require('../services/aggregationService');

// @desc Create Bulk Procurement Request
// @route POST /api/bulk/requests
// @access Private (BULK_BUYER, FPO)
const createProcurementRequest = async (req, res) => {
  try {
    const { cropName, quantityRequiredKg, qualityGrade, maxBudgetPerKg, deliveryLocation, requiredDeliveryDate, additionalRequirements } = req.body;

    if (!cropName || !quantityRequiredKg || !maxBudgetPerKg || !requiredDeliveryDate) {
      return res.status(400).json({ success: false, message: 'Please provide crop, required quantity, max budget, and target delivery date.' });
    }

    const request = await ProcurementRequest.create({
      buyer: req.user._id,
      cropName,
      quantityRequiredKg: Number(quantityRequiredKg),
      qualityGrade: qualityGrade || 'GRADE_A',
      maxBudgetPerKg: Number(maxBudgetPerKg),
      deliveryLocation: deliveryLocation || {
        city: req.user.address?.city || 'Delhi',
        district: 'Delhi NCR',
        state: 'Delhi',
        lat: 28.6139,
        lng: 77.2090,
      },
      requiredDeliveryDate: new Date(requiredDeliveryDate),
      additionalRequirements: additionalRequirements || '',
    });

    return res.status(201).json({ success: true, request });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Procurement Requests
// @route GET /api/bulk/requests
const getProcurementRequests = async (req, res) => {
  try {
    const requests = await ProcurementRequest.find()
      .populate('buyer', 'name email phone companyName')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Run Smart Matching Algorithm for Procurement Request
// @route GET /api/bulk/requests/:id/match
const getSmartMatches = async (req, res) => {
  try {
    const request = await ProcurementRequest.findById(req.params.id).populate('buyer', 'name address');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Procurement request not found' });
    }

    const crop = request.cropName.toLowerCase();

    // Fetch all available listings matching crop
    const listings = await ProduceListing.find({
      status: 'AVAILABLE',
      availableQuantityKg: { $gt: 0 },
    }).populate('farmer', 'name phone address profileImage');

    const farmerIds = listings.map((l) => l.farmer._id);
    const farmerProfiles = await FarmerProfile.find({ user: { $in: farmerIds } });
    const farmerProfilesMap = {};
    farmerProfiles.forEach((fp) => {
      farmerProfilesMap[fp.user.toString()] = fp;
    });

    // Score each listing
    const scoredMatches = listings
      .filter((l) => l.cropName.toLowerCase() === crop)
      .map((listing) => {
        const fp = farmerProfilesMap[listing.farmer._id.toString()] || {};
        const scoreData = calculateMatchScore(request, listing, fp);

        return {
          listingId: listing._id,
          batchId: listing.batchId,
          farmer: {
            _id: listing.farmer._id,
            name: listing.farmer.name,
            phone: listing.farmer.phone,
            trustScore: fp.trustScore || 90,
          },
          cropName: listing.cropName,
          grade: listing.grade,
          pricePerKg: listing.pricePerKg,
          availableQuantityKg: listing.availableQuantityKg,
          harvestDate: listing.harvestDate,
          location: listing.location,
          matchScore: scoreData.matchScore,
          estimatedDistanceKm: scoreData.estimatedDistanceKm,
          breakdown: scoreData.breakdown,
          reasons: scoreData.reasons,
        };
      });

    // Sort by Match Score descending
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    // Generate Order Aggregation Package option
    const aggregationPackage = aggregateListingsForRequest(request, listings, farmerProfilesMap);

    return res.json({
      success: true,
      procurementRequest: request,
      matchCount: scoredMatches.length,
      matches: scoredMatches,
      aggregationPackage,
    });
  } catch (error) {
    console.error('Smart match error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createProcurementRequest, getProcurementRequests, getSmartMatches };
