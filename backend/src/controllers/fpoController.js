/**
 * fpoController.js
 * Controller for Farmer Producer Organisation (FPO) discovery, farmer membership workflow,
 * and FPO Portal Farmers Management.
 */

const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const FPOProfile = require('../models/FPOProfile');
const ProduceListing = require('../models/ProduceListing');
const {
  calculateHaversineDistanceKm,
  resolveMandiCoordinates,
  ROAD_CIRCUITY_FACTOR,
} = require('../services/mandiOptimizer/distanceProvider');

// Helper: Calculate Road-Adjusted Distance between two coordinate sets or locations
function computeDistanceBetween(lat1, lng1, loc1District, loc1State, lat2, lng2, loc2District, loc2State) {
  let resolvedLat1 = lat1;
  let resolvedLng1 = lng1;
  if (resolvedLat1 === null || resolvedLng1 === null) {
    if (loc1District || loc1State) {
      const res1 = resolveMandiCoordinates(loc1District, loc1District, loc1State);
      if (res1 && res1.found) {
        resolvedLat1 = res1.lat;
        resolvedLng1 = res1.lng;
      }
    }
  }

  let resolvedLat2 = lat2;
  let resolvedLng2 = lng2;
  if (resolvedLat2 === null || resolvedLng2 === null) {
    if (loc2District || loc2State) {
      const res2 = resolveMandiCoordinates(loc2District, loc2District, loc2State);
      if (res2 && res2.found) {
        resolvedLat2 = res2.lat;
        resolvedLng2 = res2.lng;
      }
    }
  }

  if (resolvedLat1 !== null && resolvedLng1 !== null && resolvedLat2 !== null && resolvedLng2 !== null) {
    const haversineKm = calculateHaversineDistanceKm(resolvedLat1, resolvedLng1, resolvedLat2, resolvedLng2);
    const roadKm = Math.max(1, Math.round(haversineKm * (ROAD_CIRCUITY_FACTOR || 1.25) * 10) / 10);
    return roadKm;
  }

  return null;
}

// @desc Get Nearby Eligible FPOs for Authenticated Farmer (10-20 km service radius)
// @route GET /api/fpo/nearby
// @access Private (FARMER, ADMIN)
const getNearbyFPOs = async (req, res) => {
  try {
    let farmerProfile = null;
    let farmerUser = req.user;

    if (farmerUser && farmerUser._id) {
      farmerProfile = await FarmerProfile.findOne({ user: farmerUser._id });
    }

    // 1. Determine Farmer Farm Location
    let farmerLat = null;
    let farmerLng = null;
    let farmerVillage = farmerProfile?.location?.village || '';
    let farmerDistrict = farmerProfile?.location?.district || farmerUser?.address?.city || '';
    let farmerState = farmerProfile?.location?.state || farmerUser?.address?.state || '';

    if (farmerProfile?.location?.coordinates?.lat && farmerProfile?.location?.coordinates?.lng) {
      farmerLat = farmerProfile.location.coordinates.lat;
      farmerLng = farmerProfile.location.coordinates.lng;
    } else if (farmerUser?.address?.lat && farmerUser?.address?.lng) {
      farmerLat = farmerUser.address.lat;
      farmerLng = farmerUser.address.lng;
    } else if (farmerDistrict || farmerState) {
      const resolved = resolveMandiCoordinates(farmerDistrict, farmerDistrict, farmerState);
      if (resolved && resolved.found) {
        farmerLat = resolved.lat;
        farmerLng = resolved.lng;
      }
    }

    // Check if farmer location is missing
    const hasFarmerLocation = (farmerLat !== null && farmerLng !== null) || Boolean(farmerDistrict || farmerState);
    if (!hasFarmerLocation) {
      return res.json({
        success: true,
        locationMissing: true,
        message: 'Add your farm location to find nearby FPOs.',
        count: 0,
        fpos: [],
      });
    }

    // 2. Fetch all registered FPOs
    let fpoDocs = await FPOProfile.find().populate('user', 'name email phone address');

    // Fallback seed FPOs if none exist in DB
    if (!fpoDocs || fpoDocs.length === 0) {
      const fpoUsers = await User.find({ role: 'FPO' });
      for (const u of fpoUsers) {
        let fProfile = await FPOProfile.findOne({ user: u._id });
        if (!fProfile) {
          fProfile = await FPOProfile.create({
            user: u._id,
            orgName: u.name.includes('Co-op') || u.name.includes('FPO') ? u.name : `${u.name} Farmer Producer Co-op`,
            registrationNumber: 'FPO-REG-2024-01',
            representativeName: u.name,
            numberOfMemberFarmers: 240,
            cropsHandled: ['Tomato', 'Potato', 'Wheat', 'Rice'],
            operatingRegions: [u.address?.state || 'Haryana'],
            serviceRadiusKm: 15,
            location: {
              district: u.address?.city || 'Karnal',
              state: u.address?.state || 'Haryana',
              coordinates: {
                lat: u.address?.lat || 29.6857,
                lng: u.address?.lng || 76.9905,
              },
            },
          });
        }
      }
      fpoDocs = await FPOProfile.find().populate('user', 'name email phone address');
    }

    // 3. Process, score, and filter FPOs by 10-20 km service radius
    const eligibleFPOs = [];

    for (const fpoDoc of fpoDocs) {
      const fpo = fpoDoc.toObject();
      const serviceRadiusKm = Math.min(20, Math.max(10, Number(fpo.serviceRadiusKm) || 15));

      let fpoLat = fpo.location?.coordinates?.lat ?? fpo.user?.address?.lat ?? null;
      let fpoLng = fpo.location?.coordinates?.lng ?? fpo.user?.address?.lng ?? null;
      let fpoDistrict = fpo.location?.district || fpo.user?.address?.city || '';
      let fpoState = fpo.location?.state || fpo.user?.address?.state || '';

      const distanceKm = computeDistanceBetween(
        farmerLat,
        farmerLng,
        farmerDistrict,
        farmerState,
        fpoLat,
        fpoLng,
        fpoDistrict,
        fpoState
      );

      // Check eligibility under 10-20 km rule
      const isWithinRadius = distanceKm !== null && distanceKm <= serviceRadiusKm;
      const isSameDistrict = farmerDistrict && fpoDistrict && farmerDistrict.trim().toLowerCase() === fpoDistrict.trim().toLowerCase();

      // Only include FPOs within the 10-20 km radius or same immediate district
      if (isWithinRadius || (distanceKm !== null && distanceKm <= 20) || (distanceKm === null && isSameDistrict)) {
        eligibleFPOs.push({
          _id: fpo._id,
          orgName: fpo.orgName || (fpo.user ? fpo.user.name : 'Farmer Producer Organisation'),
          registrationNumber: fpo.registrationNumber || null,
          representativeName: fpo.representativeName || null,
          location: {
            village: fpo.location?.village || '',
            district: fpoDistrict || 'Karnal',
            state: fpoState || 'Haryana',
          },
          distanceKm: distanceKm,
          serviceRadiusKm: serviceRadiusKm,
          numberOfMemberFarmers: fpo.numberOfMemberFarmers || null,
          cropsHandled: fpo.cropsHandled && fpo.cropsHandled.length ? fpo.cropsHandled : null,
          operatingRegions: fpo.operatingRegions || [],
        });
      }
    }

    // Sort nearest first
    eligibleFPOs.sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      return 0;
    });

    return res.json({
      success: true,
      locationMissing: false,
      count: eligibleFPOs.length,
      farmerLocation: {
        village: farmerVillage,
        district: farmerDistrict,
        state: farmerState,
        lat: farmerLat,
        lng: farmerLng,
      },
      fpos: eligibleFPOs,
    });
  } catch (error) {
    console.error('getNearbyFPOs error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Farmer's Current FPO Membership Status
// @route GET /api/fpo/my-membership
// @access Private (FARMER)
const getMyMembership = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id }).populate('fpo');

    const membershipStatus = farmerProfile?.fpoMembershipStatus || 'NOT_MEMBER';
    const fpo = farmerProfile?.fpo || null;
    const requestedAt = farmerProfile?.fpoRequestedAt || null;

    return res.json({
      success: true,
      membershipStatus,
      fpo: fpo
        ? {
            _id: fpo._id,
            orgName: fpo.orgName,
            registrationNumber: fpo.registrationNumber || null,
            numberOfMemberFarmers: fpo.numberOfMemberFarmers || null,
            cropsHandled: fpo.cropsHandled || [],
            location: fpo.location || null,
            serviceRadiusKm: fpo.serviceRadiusKm || 15,
          }
        : null,
      requestedAt,
    });
  } catch (error) {
    console.error('getMyMembership error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Request to Join an FPO
// @route POST /api/fpo/join-request
// @access Private (FARMER)
const requestJoinFPO = async (req, res) => {
  try {
    const { fpoId } = req.body;

    if (!fpoId) {
      return res.status(400).json({ success: false, message: 'FPO ID is required' });
    }

    if (req.user.role !== 'FARMER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only registered farmers can request FPO membership' });
    }

    let farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
    if (!farmerProfile) {
      farmerProfile = await FarmerProfile.create({
        user: req.user._id,
        farmSizeAcres: 5,
        location: {
          village: req.user.address?.street || 'Kheri',
          district: req.user.address?.city || 'Karnal',
          state: req.user.address?.state || 'Haryana',
        },
      });
    }

    // One Active FPO Rule: Check if farmer already has a pending or approved membership
    if (farmerProfile.fpoMembershipStatus === 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending FPO membership request under review.',
      });
    }

    if (farmerProfile.fpoMembershipStatus === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'You are already an approved member of an FPO. A farmer can belong to only one active FPO at a time.',
      });
    }

    // Verify FPO exists
    const fpo = await FPOProfile.findById(fpoId);
    if (!fpo) {
      return res.status(404).json({ success: false, message: 'Selected FPO does not exist' });
    }

    // Update Farmer Profile state
    farmerProfile.fpo = fpo._id;
    farmerProfile.fpoMembershipStatus = 'PENDING';
    farmerProfile.fpoRequestedAt = new Date();
    await farmerProfile.save();

    return res.json({
      success: true,
      message: `Membership request submitted successfully to ${fpo.orgName}!`,
      membershipStatus: 'PENDING',
      fpo: {
        _id: fpo._id,
        orgName: fpo.orgName,
        registrationNumber: fpo.registrationNumber,
        numberOfMemberFarmers: fpo.numberOfMemberFarmers,
        cropsHandled: fpo.cropsHandled,
        serviceRadiusKm: fpo.serviceRadiusKm || 15,
      },
    });
  } catch (error) {
    console.error('requestJoinFPO error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// FPO PORTAL → FARMERS MANAGEMENT CONTROLLERS
// =========================================================================

// @desc Get Incoming Pending Membership Requests for Authenticated FPO
// @route GET /api/fpo/farmers/pending-requests
// @access Private (FPO, ADMIN)
const getPendingRequests = async (req, res) => {
  try {
    // 1. Locate Authenticated FPO Profile
    let fpoProfile = await FPOProfile.findOne({ user: req.user._id });
    if (!fpoProfile && req.user.role === 'ADMIN') {
      fpoProfile = await FPOProfile.findOne();
    }

    if (!fpoProfile) {
      return res.json({
        success: true,
        count: 0,
        requests: [],
        fpo: null,
      });
    }

    // FPO Location & Configured Service Radius
    const serviceRadiusKm = Math.min(20, Math.max(10, Number(fpoProfile.serviceRadiusKm) || 15));
    const fpoLat = fpoProfile.location?.coordinates?.lat ?? req.user.address?.lat ?? null;
    const fpoLng = fpoProfile.location?.coordinates?.lng ?? req.user.address?.lng ?? null;
    const fpoDistrict = fpoProfile.location?.district || req.user.address?.city || '';
    const fpoState = fpoProfile.location?.state || req.user.address?.state || '';

    // 2. Query Pending Farmer Profiles
    const pendingProfiles = await FarmerProfile.find({
      fpo: fpoProfile._id,
      fpoMembershipStatus: 'PENDING',
    })
      .populate('user', 'name phone email address profileImage')
      .sort({ fpoRequestedAt: -1 });

    // 3. Enrich each request with distance & eligibility
    const enrichedRequests = pendingProfiles.map((p) => {
      const farmerDoc = p.toObject();
      const farmerUser = farmerDoc.user || {};
      const farmerLat = farmerDoc.location?.coordinates?.lat ?? farmerUser.address?.lat ?? null;
      const farmerLng = farmerDoc.location?.coordinates?.lng ?? farmerUser.address?.lng ?? null;
      const farmerDistrict = farmerDoc.location?.district || farmerUser.address?.city || '';
      const farmerState = farmerDoc.location?.state || farmerUser.address?.state || '';

      const distanceKm = computeDistanceBetween(
        fpoLat,
        fpoLng,
        fpoDistrict,
        fpoState,
        farmerLat,
        farmerLng,
        farmerDistrict,
        farmerState
      );

      const isWithinRadius = distanceKm !== null ? distanceKm <= serviceRadiusKm : true;

      return {
        _id: farmerDoc._id,
        farmerId: farmerUser._id,
        farmerName: farmerUser.name || 'Farmer Partner',
        phone: farmerUser.phone || '',
        email: farmerUser.email || '',
        profileImage: farmerUser.profileImage || null,
        farmSizeAcres: farmerDoc.farmSizeAcres || 5,
        cropsGrown: farmerDoc.cropsGrown || [],
        trustScore: farmerDoc.trustScore || 90,
        qualityScore: farmerDoc.qualityScore || 90,
        location: {
          village: farmerDoc.location?.village || farmerUser.address?.street || '',
          district: farmerDistrict,
          state: farmerState,
        },
        distanceKm,
        serviceRadiusKm,
        isWithinRadius,
        fpoRequestedAt: farmerDoc.fpoRequestedAt || farmerDoc.updatedAt || new Date(),
        status: farmerDoc.fpoMembershipStatus,
      };
    });

    return res.json({
      success: true,
      count: enrichedRequests.length,
      fpo: {
        _id: fpoProfile._id,
        orgName: fpoProfile.orgName,
        serviceRadiusKm,
      },
      requests: enrichedRequests,
    });
  } catch (error) {
    console.error('getPendingRequests error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Approved FPO Member Farmers
// @route GET /api/fpo/farmers/members
// @access Private (FPO, ADMIN)
const getFPOMembers = async (req, res) => {
  try {
    let fpoProfile = await FPOProfile.findOne({ user: req.user._id });
    if (!fpoProfile && req.user.role === 'ADMIN') {
      fpoProfile = await FPOProfile.findOne();
    }

    if (!fpoProfile) {
      return res.json({
        success: true,
        count: 0,
        members: [],
        fpo: null,
      });
    }

    const memberProfiles = await FarmerProfile.find({
      fpo: fpoProfile._id,
      fpoMembershipStatus: 'APPROVED',
    })
      .populate('user', 'name phone email address profileImage')
      .sort({ fpoApprovedAt: -1, updatedAt: -1 });

    const enrichedMembers = memberProfiles.map((p) => {
      const doc = p.toObject();
      const u = doc.user || {};
      return {
        _id: doc._id,
        farmerId: u._id,
        farmerName: u.name || 'Member Farmer',
        phone: u.phone || '',
        email: u.email || '',
        profileImage: u.profileImage || null,
        farmSizeAcres: doc.farmSizeAcres || 5,
        cropsGrown: doc.cropsGrown || [],
        trustScore: doc.trustScore || 92,
        qualityScore: doc.qualityScore || 90,
        location: {
          village: doc.location?.village || u.address?.street || '',
          district: doc.location?.district || u.address?.city || '',
          state: doc.location?.state || u.address?.state || '',
        },
        joinedDate: doc.fpoApprovedAt || doc.updatedAt || doc.createdAt,
        status: doc.fpoMembershipStatus,
      };
    });

    return res.json({
      success: true,
      count: enrichedMembers.length,
      fpo: {
        _id: fpoProfile._id,
        orgName: fpoProfile.orgName,
        numberOfMemberFarmers: fpoProfile.numberOfMemberFarmers || enrichedMembers.length,
      },
      members: enrichedMembers,
    });
  } catch (error) {
    console.error('getFPOMembers error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Accept Farmer Membership Request
// @route POST /api/fpo/farmers/accept
// @access Private (FPO, ADMIN)
const acceptFarmerRequest = async (req, res) => {
  try {
    const { farmerProfileId } = req.body;

    if (!farmerProfileId) {
      return res.status(400).json({ success: false, message: 'Farmer profile ID is required' });
    }

    // 1. Authorize FPO Ownership
    let fpoProfile = await FPOProfile.findOne({ user: req.user._id });
    if (!fpoProfile && req.user.role === 'ADMIN') {
      fpoProfile = await FPOProfile.findOne();
    }

    if (!fpoProfile) {
      return res.status(403).json({ success: false, message: 'FPO organization profile not found for this user.' });
    }

    // 2. Query target Farmer Profile
    const farmerProfile = await FarmerProfile.findById(farmerProfileId).populate('user', 'name phone email address');
    if (!farmerProfile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found.' });
    }

    // 3. Security Check: Verify request belongs to THIS FPO
    if (!farmerProfile.fpo || farmerProfile.fpo.toString() !== fpoProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to manage membership requests for another FPO.',
      });
    }

    // 4. One Active FPO Rule & Duplicate Acceptance Prevention
    if (farmerProfile.fpoMembershipStatus === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Farmer is already an active approved member of this FPO.',
      });
    }

    // 5. Service Radius Verification (10-20 km rule)
    const serviceRadiusKm = Math.min(20, Math.max(10, Number(fpoProfile.serviceRadiusKm) || 15));
    const fpoLat = fpoProfile.location?.coordinates?.lat ?? req.user.address?.lat ?? null;
    const fpoLng = fpoProfile.location?.coordinates?.lng ?? req.user.address?.lng ?? null;
    const fpoDistrict = fpoProfile.location?.district || req.user.address?.city || '';
    const fpoState = fpoProfile.location?.state || req.user.address?.state || '';

    const farmerLat = farmerProfile.location?.coordinates?.lat ?? farmerProfile.user?.address?.lat ?? null;
    const farmerLng = farmerProfile.location?.coordinates?.lng ?? farmerProfile.user?.address?.lng ?? null;
    const farmerDistrict = farmerProfile.location?.district || farmerProfile.user?.address?.city || '';
    const farmerState = farmerProfile.location?.state || farmerProfile.user?.address?.state || '';

    const distanceKm = computeDistanceBetween(
      fpoLat,
      fpoLng,
      fpoDistrict,
      fpoState,
      farmerLat,
      farmerLng,
      farmerDistrict,
      farmerState
    );

    if (distanceKm !== null && distanceKm > serviceRadiusKm) {
      return res.status(400).json({
        success: false,
        message: `Ineligible: Farmer location (${distanceKm} km away) exceeds the FPO's configured service radius of ${serviceRadiusKm} km.`,
      });
    }

    // 6. Update Farmer Profile to Active APPROVED Member
    farmerProfile.fpoMembershipStatus = 'APPROVED';
    farmerProfile.fpoApprovedAt = new Date();
    await farmerProfile.save();

    // 7. Update FPO Member Count in DB
    const activeCount = await FarmerProfile.countDocuments({
      fpo: fpoProfile._id,
      fpoMembershipStatus: 'APPROVED',
    });
    fpoProfile.numberOfMemberFarmers = Math.max(activeCount, fpoProfile.numberOfMemberFarmers || 0);
    await fpoProfile.save();

    return res.json({
      success: true,
      message: `Farmer ${farmerProfile.user?.name || ''} has been successfully approved as an active FPO member!`,
      farmer: {
        _id: farmerProfile._id,
        name: farmerProfile.user?.name,
        status: farmerProfile.fpoMembershipStatus,
        approvedAt: farmerProfile.fpoApprovedAt,
      },
    });
  } catch (error) {
    console.error('acceptFarmerRequest error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Reject Farmer Membership Request
// @route POST /api/fpo/farmers/reject
// @access Private (FPO, ADMIN)
const rejectFarmerRequest = async (req, res) => {
  try {
    const { farmerProfileId, reason } = req.body;

    if (!farmerProfileId) {
      return res.status(400).json({ success: false, message: 'Farmer profile ID is required' });
    }

    let fpoProfile = await FPOProfile.findOne({ user: req.user._id });
    if (!fpoProfile && req.user.role === 'ADMIN') {
      fpoProfile = await FPOProfile.findOne();
    }

    if (!fpoProfile) {
      return res.status(403).json({ success: false, message: 'FPO organization profile not found for this user.' });
    }

    const farmerProfile = await FarmerProfile.findById(farmerProfileId).populate('user', 'name');
    if (!farmerProfile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found.' });
    }

    // Security Check: Verify request belongs to THIS FPO
    if (!farmerProfile.fpo || farmerProfile.fpo.toString() !== fpoProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to manage membership requests for another FPO.',
      });
    }

    // Update to REJECTED
    farmerProfile.fpoMembershipStatus = 'REJECTED';
    farmerProfile.fpoRejectedAt = new Date();
    farmerProfile.fpoRejectionReason = reason || 'Application does not meet current FPO aggregation criteria.';
    await farmerProfile.save();

    return res.json({
      success: true,
      message: `Membership request for ${farmerProfile.user?.name || 'Farmer'} has been rejected.`,
      farmer: {
        _id: farmerProfile._id,
        name: farmerProfile.user?.name,
        status: farmerProfile.fpoMembershipStatus,
        rejectedAt: farmerProfile.fpoRejectedAt,
      },
    });
  } catch (error) {
    console.error('rejectFarmerRequest error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Farmer Profile Details for Modal
// @route GET /api/fpo/farmers/:id
// @access Private (FPO, ADMIN)
const getFarmerDetails = async (req, res) => {
  try {
    const farmerProfile = await FarmerProfile.findById(req.params.id).populate(
      'user',
      'name phone email address profileImage'
    );

    if (!farmerProfile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found.' });
    }

    return res.json({
      success: true,
      farmer: farmerProfile,
    });
  } catch (error) {
    console.error('getFarmerDetails error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// FPO PORTAL → PRODUCE / INVENTORY AGGREGATION CONTROLLERS
// =========================================================================

// @desc Get FPO Aggregated Produce Inventory pooled from active approved member farmers
// @route GET /api/fpo/inventory
// @access Private (FPO, ADMIN)
const getFPOAggregatedInventory = async (req, res) => {
  try {
    // 1. Identify Authenticated FPO
    let fpoProfile = await FPOProfile.findOne({ user: req.user._id });
    if (!fpoProfile && req.user.role === 'ADMIN') {
      fpoProfile = await FPOProfile.findOne();
    }

    if (!fpoProfile) {
      return res.json({
        success: true,
        fpo: null,
        summary: {
          totalAggregatedQuantityKg: 0,
          activeProduceTypesCount: 0,
          contributingFarmersCount: 0,
          totalEstimatedInventoryValue: 0,
        },
        inventory: [],
      });
    }

    // 2. Fetch All Active Approved Member Farmers for THIS FPO
    const approvedMembers = await FarmerProfile.find({
      fpo: fpoProfile._id,
      fpoMembershipStatus: 'APPROVED',
    }).populate('user', 'name phone email address profileImage');

    if (!approvedMembers || approvedMembers.length === 0) {
      return res.json({
        success: true,
        fpo: {
          _id: fpoProfile._id,
          orgName: fpoProfile.orgName,
          numberOfMemberFarmers: fpoProfile.numberOfMemberFarmers || 0,
          serviceRadiusKm: fpoProfile.serviceRadiusKm || 15,
        },
        summary: {
          totalAggregatedQuantityKg: 0,
          activeProduceTypesCount: 0,
          contributingFarmersCount: 0,
          totalEstimatedInventoryValue: 0,
        },
        inventory: [],
      });
    }

    // 3. Extract Approved Member User IDs & Build Metadata Map
    const memberUserIds = approvedMembers.map((m) => m.user?._id).filter(Boolean);
    const memberProfileMap = new Map();
    approvedMembers.forEach((m) => {
      if (m.user?._id) {
        memberProfileMap.set(m.user._id.toString(), {
          profileId: m._id,
          userId: m.user._id,
          name: m.user.name || 'Member Farmer',
          phone: m.user.phone || '',
          email: m.user.email || '',
          profileImage: m.user.profileImage || null,
          village: m.location?.village || m.user.address?.street || '',
          district: m.location?.district || m.user.address?.city || '',
          state: m.location?.state || m.user.address?.state || '',
          trustScore: m.trustScore || 90,
          qualityScore: m.qualityScore || 90,
          farmSizeAcres: m.farmSizeAcres || 5,
        });
      }
    });

    // 4. Query Available Produce Listings Belonging to Approved Members Only
    const activeListings = await ProduceListing.find({
      farmer: { $in: memberUserIds },
      status: 'AVAILABLE',
      availableQuantityKg: { $gt: 0 },
    }).sort({ cropName: 1, createdAt: -1 });

    // 5. Group & Aggregate by Crop Name
    const cropGroups = {};

    for (const listing of activeListings) {
      const cropKey = (listing.cropName || '').trim().toLowerCase();
      if (!cropKey) continue;

      const farmerMeta = memberProfileMap.get(listing.farmer.toString()) || {
        name: 'Member Farmer',
        phone: '',
        email: '',
        profileImage: null,
        village: listing.location?.district || '',
        district: listing.location?.district || '',
        state: listing.location?.state || '',
        trustScore: 90,
        qualityScore: 90,
      };

      if (!cropGroups[cropKey]) {
        cropGroups[cropKey] = {
          cropName: listing.cropName.trim(),
          category: listing.category || 'VEGETABLES',
          totalQuantityKg: 0,
          totalOriginalQuantityKg: 0,
          totalValue: 0,
          farmerUserIds: new Set(),
          prices: [],
          grades: new Set(),
          images: [],
          latestHarvestDate: null,
          lastUpdatedAt: listing.updatedAt || listing.createdAt,
          farmerContributions: [],
        };
      }

      const group = cropGroups[cropKey];
      const availKg = Number(listing.availableQuantityKg) || 0;
      const origKg = Number(listing.quantityKg) || availKg;
      const price = Number(listing.pricePerKg) || 0;

      group.totalQuantityKg += availKg;
      group.totalOriginalQuantityKg += origKg;
      group.totalValue += availKg * price;
      group.farmerUserIds.add(listing.farmer.toString());
      group.prices.push(price);
      if (listing.grade) group.grades.add(listing.grade);
      if (listing.images && listing.images.length) {
        group.images.push(...listing.images);
      }
      if (!group.latestHarvestDate || new Date(listing.harvestDate) > new Date(group.latestHarvestDate)) {
        group.latestHarvestDate = listing.harvestDate;
      }
      if (new Date(listing.updatedAt || listing.createdAt) > new Date(group.lastUpdatedAt)) {
        group.lastUpdatedAt = listing.updatedAt || listing.createdAt;
      }

      group.farmerContributions.push({
        listingId: listing._id,
        batchId: listing.batchId || null,
        farmerId: listing.farmer,
        farmerProfileId: farmerMeta.profileId || null,
        farmerName: farmerMeta.name,
        phone: farmerMeta.phone,
        email: farmerMeta.email,
        profileImage: farmerMeta.profileImage,
        village: farmerMeta.village,
        district: listing.location?.district || farmerMeta.district,
        state: listing.location?.state || farmerMeta.state,
        availableQuantityKg: availKg,
        totalQuantityKg: origKg,
        pricePerKg: price,
        lotValue: Math.round(availKg * price),
        grade: listing.grade || 'GRADE_A',
        aiQualityScore: listing.aiQualityEstimateScore || 90,
        harvestDate: listing.harvestDate,
        listedAt: listing.createdAt,
        trustScore: farmerMeta.trustScore,
        images: listing.images || [],
      });
    }

    // 6. Format Aggregated Crops Array
    const aggregatedInventory = Object.values(cropGroups).map((g) => {
      const priceMin = g.prices.length ? Math.min(...g.prices) : 0;
      const priceMax = g.prices.length ? Math.max(...g.prices) : 0;
      const weightedAvgPrice =
        g.totalQuantityKg > 0 ? Math.round((g.totalValue / g.totalQuantityKg) * 10) / 10 : priceMin;

      // Sort farmer contributions by quantity descending
      g.farmerContributions.sort((a, b) => b.availableQuantityKg - a.availableQuantityKg);

      const defaultImg =
        g.category === 'FRUITS'
          ? 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80'
          : g.category === 'GRAINS'
          ? 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80';

      return {
        cropName: g.cropName,
        category: g.category,
        totalQuantityKg: g.totalQuantityKg,
        totalOriginalQuantityKg: g.totalOriginalQuantityKg,
        contributingFarmersCount: g.farmerUserIds.size,
        pricePerKgMin: priceMin,
        pricePerKgMax: priceMax,
        weightedAvgPricePerKg: weightedAvgPrice,
        estimatedTotalValue: Math.round(g.totalValue),
        grades: Array.from(g.grades),
        representativeGrade: g.grades.has('GRADE_A') ? 'GRADE_A' : g.grades.values().next().value || 'GRADE_A',
        image: g.images[0] || defaultImg,
        latestHarvestDate: g.latestHarvestDate,
        lastUpdatedAt: g.lastUpdatedAt,
        status: 'AVAILABLE',
        farmerContributions: g.farmerContributions,
      };
    });

    // Sort by total quantity descending
    aggregatedInventory.sort((a, b) => b.totalQuantityKg - a.totalQuantityKg);

    // Summary Totals
    const totalAggregatedKg = aggregatedInventory.reduce((sum, item) => sum + item.totalQuantityKg, 0);
    const totalEstimatedValue = aggregatedInventory.reduce((sum, item) => sum + item.estimatedTotalValue, 0);
    const allUniqueFarmers = new Set();
    aggregatedInventory.forEach((item) => {
      item.farmerContributions.forEach((fc) => allUniqueFarmers.add(fc.farmerId.toString()));
    });

    return res.json({
      success: true,
      fpo: {
        _id: fpoProfile._id,
        orgName: fpoProfile.orgName,
        numberOfMemberFarmers: fpoProfile.numberOfMemberFarmers || approvedMembers.length,
        serviceRadiusKm: fpoProfile.serviceRadiusKm || 15,
      },
      summary: {
        totalAggregatedQuantityKg: totalAggregatedKg,
        activeProduceTypesCount: aggregatedInventory.length,
        contributingFarmersCount: allUniqueFarmers.size,
        totalEstimatedInventoryValue: totalEstimatedValue,
      },
      inventory: aggregatedInventory,
    });
  } catch (error) {
    console.error('getFPOAggregatedInventory error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNearbyFPOs,
  getMyMembership,
  requestJoinFPO,
  getPendingRequests,
  getFPOMembers,
  acceptFarmerRequest,
  rejectFarmerRequest,
  getFarmerDetails,
  getFPOAggregatedInventory,
};
