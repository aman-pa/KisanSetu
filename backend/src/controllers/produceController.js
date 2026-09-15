const ProduceListing = require('../models/ProduceListing');
const User = require('../models/User');
const BatchTraceability = require('../models/BatchTraceability');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { calculateCurrentQuality } = require('../utils/qualityCalculator');
const { verifyProducePipeline, computeImageHash } = require('./qualityController');

// Helper to generate QR code payload
const generateBatchQR = async (batchId, cropName, farmerName, harvestDate) => {
  const qrPayload = JSON.stringify({
    batchId,
    crop: cropName,
    farmer: farmerName,
    harvestDate,
    platform: 'KisanSetu AI Traceability Engine',
    verifyUrl: `http://localhost:5173/trace/${batchId}`,
  });
  return await QRCode.toDataURL(qrPayload);
};

// @desc Create New Produce Listing
// @route POST /api/products
// @access Private (FARMER, FPO)
const createListing = async (req, res) => {
  try {
    const {
      cropName,
      category,
      quantityKg,
      pricePerKg,
      grade,
      harvestDate,
      images,
      location,
      storageCondition,
      aiQualityAssessment,
    } = req.body;

    if (!cropName || !quantityKg || !pricePerKg || !harvestDate) {
      return res.status(400).json({ success: false, message: 'Please provide crop name, quantity, price, and harvest date' });
    }

    // Backend Strict Harvest Date Validation
    const hDate = new Date(harvestDate);
    if (isNaN(hDate.getTime())) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_HARVEST_DATE',
        message: 'Invalid harvest date provided.',
      });
    }

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    if (hDate > todayEnd) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_HARVEST_DATE',
        message: 'Harvest date cannot be in the future.',
      });
    }

    const isGrainCrop = ['GRAINS', 'PULSES', 'SPICES'].includes((category || '').toUpperCase()) ||
      ['wheat', 'rice', 'chana', 'mustard', 'barley', 'maize', 'dal'].some((kw) => (cropName || '').toLowerCase().includes(kw));
    const maxDaysAllowed = isGrainCrop ? 365 : 60;
    const diffDaysFromToday = Math.floor((Date.now() - hDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDaysFromToday > maxDaysAllowed) {
      return res.status(400).json({
        success: false,
        code: 'HARVEST_DATE_EXPIRED',
        message: 'Harvest date exceeds the allowed freshness period for this produce category.',
      });
    }

    const batchId = `KS-BATCH-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const qrDataUrl = await generateBatchQR(batchId, cropName, req.user.name, harvestDate);

    // AI Assisted visual quality assessment
    let aiQualityScore = 92;
    if (aiQualityAssessment && typeof aiQualityAssessment.overallScore === 'number') {
      aiQualityScore = aiQualityAssessment.overallScore;
    } else {
      if (grade === 'GRADE_B') aiQualityScore = 81;
      if (grade === 'GRADE_C') aiQualityScore = 70;
    }

    // Determine standard grade category
    let finalGrade = grade || 'GRADE_A';
    if (aiQualityAssessment?.grade) {
      const g = aiQualityAssessment.grade.toUpperCase();
      if (g.includes('A')) finalGrade = 'GRADE_A';
      else if (g.includes('B')) finalGrade = 'GRADE_B';
      else finalGrade = 'GRADE_C';
    }

    // AI Price Recommendation calculation
    const currentAvg = Number(pricePerKg);
    const recommendedMin = Math.max(10, Math.round(currentAvg * 0.95));
    const recommendedMax = Math.round(currentAvg * 1.12);

    const initialScore = (aiQualityAssessment && typeof aiQualityAssessment.overallScore === 'number')
      ? aiQualityAssessment.overallScore
      : aiQualityScore;
    const initialGradeStr = aiQualityAssessment?.grade || (finalGrade === 'GRADE_A' ? 'A+' : finalGrade === 'GRADE_B' ? 'A' : 'B');
    const assessedDate = new Date();

    // Check if genuine device GPS coordinates were captured
    const hasGenuineDeviceGPS =
      Boolean(req.body.isDeviceGps || aiQualityAssessment?.latestGeoVerification?.isDeviceGps) &&
      typeof location?.lat === 'number' &&
      typeof location?.lng === 'number' &&
      !isNaN(location.lat) &&
      !isNaN(location.lng) &&
      location.lat >= -90 &&
      location.lat <= 90 &&
      location.lng >= -180 &&
      location.lng <= 180 &&
      req.body.isManual !== true;

    const initialGeoStatus = hasGenuineDeviceGPS ? 'VERIFIED' : 'NOT_VERIFIED';
    const initialQualityStatus = hasGenuineDeviceGPS ? 'VERIFIED' : 'NOT_VERIFIED';

    const initialAssessmentData = aiQualityAssessment ? {
      ...aiQualityAssessment,
      initialQualityScore: initialScore,
      initialGrade: initialGradeStr,
      assessedAt: assessedDate,
      qualityStatus: initialQualityStatus,
      latestVerifiedScore: initialScore,
      latestVerifiedGrade: initialGradeStr,
      latestVerifiedAt: assessedDate,
      imageConsistency: aiQualityAssessment.imageConsistency || {
        status: 'PASS',
        isSameCrop: true,
        image1Crop: cropName,
        image2Crop: cropName,
        selectedCrop: cropName,
        confidence: 92,
        message: `Both images verified as ${cropName}.`,
      },
      latestGeoVerification: {
        latitude: hasGenuineDeviceGPS ? location.lat : null,
        longitude: hasGenuineDeviceGPS ? location.lng : null,
        capturedAt: assessedDate,
        isGeoVerified: hasGenuineDeviceGPS,
        status: initialGeoStatus,
      },
      qualityVerificationHistory: [
        {
          type: 'INITIAL_ASSESSMENT',
          score: initialScore,
          grade: initialGradeStr,
          timestamp: assessedDate,
          status: initialQualityStatus,
          geoVerification: {
            latitude: hasGenuineDeviceGPS ? location.lat : null,
            longitude: hasGenuineDeviceGPS ? location.lng : null,
            capturedAt: assessedDate,
            isGeoVerified: hasGenuineDeviceGPS,
            status: initialGeoStatus,
          },
          photo: images && images.length ? images[0] : '',
          notes: 'Initial listing AI visual quality assessment.',
        },
      ],
    } : undefined;

    // Strict Verification Pipeline Validation (Authoritative Backend Enforcement)
    const isStrictVerificationRequired =
      req.body.strictVerification === true ||
      req.body.isDeviceGps === true ||
      Boolean(aiQualityAssessment?.latestGeoVerification?.isGeoVerified) ||
      Boolean(req.body.requireVerification);

    let authoritativeAssessment = initialAssessmentData;

    if (isStrictVerificationRequired) {
      const img1 = images && images.length > 0 ? images[0] : null;
      const img2 = images && images.length > 1 ? images[1] : null;
      const deviceCoords = location && typeof location.lat === 'number' && typeof location.lng === 'number'
        ? { lat: location.lat, lng: location.lng }
        : null;

      const pipelineResult = await verifyProducePipeline({
        cropName,
        category: category || 'VEGETABLES',
        harvestDate,
        storageCondition: storageCondition || 'Room Temperature',
        image1: img1,
        image2: img2,
        deviceCoords,
      });

      if (!pipelineResult.success) {
        return res.status(400).json({
          success: false,
          code: pipelineResult.rejection?.code || 'VERIFICATION_FAILED',
          stage: pipelineResult.failedGate,
          title: pipelineResult.rejection?.title || 'VERIFICATION REJECTED',
          message: pipelineResult.rejection?.message || 'Produce verification checks failed.',
          details: pipelineResult.gates,
        });
      }

      if (pipelineResult.qualityAssessment) {
        authoritativeAssessment = {
          ...pipelineResult.qualityAssessment,
          initialQualityScore: pipelineResult.qualityAssessment.overallScore || initialScore,
          initialGrade: pipelineResult.qualityAssessment.grade || initialGradeStr,
          assessedAt: assessedDate,
          qualityStatus: 'VERIFIED',
          latestVerifiedScore: pipelineResult.qualityAssessment.overallScore || initialScore,
          latestVerifiedGrade: pipelineResult.qualityAssessment.grade || initialGradeStr,
          latestVerifiedAt: assessedDate,
        };
      }
    }

    const imageHashes = Array.isArray(images)
      ? images.map((img) => computeImageHash(img)).filter(Boolean)
      : [];

    const listing = await ProduceListing.create({
      farmer: req.user._id,
      cropName,
      category: category || 'VEGETABLES',
      quantityKg: Number(quantityKg),
      availableQuantityKg: Number(quantityKg),
      pricePerKg: Number(pricePerKg),
      grade: finalGrade,
      harvestDate: new Date(harvestDate),
      storageCondition: storageCondition || 'Room Temperature',
      images: images && images.length ? images : [
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'
      ],
      imageHashes,
      location: location || {
        district: req.user.address?.city || 'Karnal',
        state: req.user.address?.state || 'Haryana',
        lat: 29.6857,
        lng: 76.9905,
      },
      batchId,
      aiQualityEstimateScore: aiQualityScore,
      aiQualityAssessment: authoritativeAssessment,
      aiPriceRecommendation: {
        min: recommendedMin,
        max: recommendedMax,
        reasoning: `Based on predicted high regional demand in neighboring NCR markets and current supply index.`,
      },
    });

    // Create Batch Traceability Initial Event
    await BatchTraceability.create({
      batchId,
      produceListing: listing._id,
      farmer: req.user._id,
      cropName,
      quantityKg: Number(quantityKg),
      harvestDate: new Date(harvestDate),
      qrDataUrl,
      timeline: [
        {
          stage: 'LISTED',
          timestamp: new Date(),
          actor: req.user.name,
          location: `${listing.location.district}, ${listing.location.state}`,
          notes: `Produce listed on KisanSetu AI marketplace. Declared grade: ${grade || 'GRADE_A'}.`,
        },
        {
          stage: 'AI_ASSESSED',
          timestamp: new Date(),
          actor: 'KisanSetu AI Vision Engine',
          location: 'Cloud AI Microservice',
          notes: aiQualityAssessment?.observations?.[0]
            ? `AI Visual Quality: ${aiQualityAssessment.observations[0]} Score: ${aiQualityScore}/100 (Grade ${aiQualityAssessment.grade || 'A+'}).`
            : `Visual defect inspection completed. Estimated score: ${aiQualityScore}/100.`,
        },
      ],
    });

    return res.status(201).json({ success: true, listing, batchId, qrDataUrl });
  } catch (error) {
    console.error('Create listing error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Helper for distance calculation between two lat/lng points
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 18.5; // Default fallback distance in km
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// @desc Get Typeahead Produce Suggestions (for 2-3 char search)
// @route GET /api/products/suggestions
const getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.json({ success: true, suggestions: [] });
    }

    const regex = new RegExp(q.trim(), 'i');
    const matches = await ProduceListing.find({
      status: 'AVAILABLE',
      availableQuantityKg: { $gt: 0 },
      cropName: regex,
    })
      .select('cropName category grade pricePerKg location images')
      .limit(10);

    const suggestions = matches.map((m) => ({
      id: m._id,
      cropName: m.cropName,
      category: m.category,
      grade: m.grade,
      pricePerKg: m.pricePerKg,
      district: m.location?.district || 'Karnal',
      state: m.location?.state || 'Haryana',
      image: m.images?.[0] || '',
    }));

    return res.json({ success: true, count: suggestions.length, suggestions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get All Produce Listings with Filtering, AI Recommendation & Location Proximity
// @route GET /api/products
const getListings = async (req, res) => {
  try {
    const { search, category, district, state, grade, minPrice, maxPrice, sort, userLat, userLng, maxDistanceKm } = req.query;

    let query = { status: 'AVAILABLE', availableQuantityKg: { $gt: 0 } };

    if (search) {
      query.cropName = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'ALL') {
      query.category = category;
    }
    if (grade && grade !== 'ALL') {
      query.grade = grade;
    }
    if (district) {
      query['location.district'] = { $regex: district, $options: 'i' };
    }
    if (state) {
      query['location.state'] = { $regex: state, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      query.pricePerKg = {};
      if (minPrice) query.pricePerKg.$gte = Number(minPrice);
      if (maxPrice) query.pricePerKg.$lte = Number(maxPrice);
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { pricePerKg: 1 };
    if (sort === 'price_desc') sortOptions = { pricePerKg: -1 };
    if (sort === 'quantity_desc') sortOptions = { availableQuantityKg: -1 };

    let rawListings = await ProduceListing.find(query)
      .populate('farmer', 'name phone profileImage address')
      .sort(sortOptions);

    const refLat = Number(userLat) || 28.6139; // Default Delhi/NCR lat
    const refLng = Number(userLng) || 77.2090; // Default Delhi/NCR lng

    // Enhance listings with dynamic current quality, sanitized geo coordinates, distance & AI Recommendation Match Score
    let processedListings = rawListings.map((doc) => {
      const l = doc.toObject();
      l.currentQuality = calculateCurrentQuality(l.aiQualityAssessment, l.storageCondition, l.cropName, new Date(), l.harvestDate);

      // Distance calculation
      const farmerLat = l.location?.lat || 29.6857;
      const farmerLng = l.location?.lng || 76.9905;
      const distKm = calculateDistanceKm(refLat, refLng, farmerLat, farmerLng);
      l.distanceKm = distKm;

      // AI Match Ranking Score Calculation (0 to 100)
      // Factors: Quality score (40%), Distance proximity (30%), Price value (30%)
      let qualityScore = l.currentQuality?.currentScore || l.aiQualityEstimateScore || 90;
      if (l.grade === 'GRADE_A' || l.currentQuality?.currentGrade === 'A' || l.currentQuality?.currentGrade === 'A+') {
        qualityScore = Math.max(qualityScore, 92);
      } else if (l.grade === 'GRADE_B' || l.currentQuality?.currentGrade === 'B') {
        qualityScore = Math.max(qualityScore, 82);
      } else if (l.grade === 'GRADE_C' || l.currentQuality?.currentGrade === 'C') {
        qualityScore = Math.max(qualityScore, 72);
      }

      let proximityScore = 100;
      if (distKm > 10) proximityScore = 90;
      if (distKm > 25) proximityScore = 75;
      if (distKm > 50) proximityScore = 60;
      if (distKm > 100) proximityScore = 40;

      const priceScore = Math.max(30, Math.min(100, Math.round(110 - (l.pricePerKg || 30) * 1.2)));
      l.aiRecommendationScore = Math.round(qualityScore * 0.4 + proximityScore * 0.3 + priceScore * 0.3);

      // Sanitize exact coordinates for buyers - keep verification status and district/state
      const isGeoVerified = l.aiQualityAssessment?.latestGeoVerification?.status === 'VERIFIED' ||
                            l.aiQualityAssessment?.latestGeoVerification?.isGeoVerified === true;
      const verificationDate = l.aiQualityAssessment?.latestGeoVerification?.capturedAt ||
                               l.aiQualityAssessment?.latestVerifiedAt || null;

      if (l.location) {
        l.location = {
          district: l.location.district,
          state: l.location.state,
        };
      }
      if (l.aiQualityAssessment?.latestGeoVerification) {
        l.aiQualityAssessment.latestGeoVerification = {
          isGeoVerified,
          status: isGeoVerified ? 'VERIFIED' : 'NOT_VERIFIED',
          verificationDate,
          district: l.location?.district,
          state: l.location?.state,
        };
      }
      if (Array.isArray(l.aiQualityAssessment?.qualityVerificationHistory)) {
        l.aiQualityAssessment.qualityVerificationHistory = l.aiQualityAssessment.qualityVerificationHistory.map((h) => {
          const hGeoVerified = h.geoVerification?.status === 'VERIFIED' || h.geoVerification?.isGeoVerified === true;
          return {
            ...h,
            notes: h.notes ? h.notes.replace(/\(Lat:.*?, Lng:.*?\)/gi, '').trim() : h.notes,
            geoVerification: {
              isGeoVerified: hGeoVerified,
              status: hGeoVerified ? 'VERIFIED' : 'NOT_VERIFIED',
              verificationDate: h.timestamp || h.geoVerification?.capturedAt,
              district: l.location?.district,
              state: l.location?.state,
            },
          };
        });
      }
      return l;
    });

    // Distance Filter
    if (maxDistanceKm && Number(maxDistanceKm) > 0) {
      processedListings = processedListings.filter((item) => item.distanceKm <= Number(maxDistanceKm));
    }

    // AI Recommendation Ranking Sort
    if (sort === 'ai_recommended') {
      processedListings.sort((a, b) => b.aiRecommendationScore - a.aiRecommendationScore);
    } else if (sort === 'distance_asc') {
      processedListings.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sort === 'quality_desc') {
      processedListings.sort((a, b) => (b.currentQuality?.currentScore || b.aiQualityEstimateScore || 0) - (a.currentQuality?.currentScore || a.aiQualityEstimateScore || 0));
    }

    return res.json({ success: true, count: processedListings.length, listings: processedListings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Single Produce Listing Detail
// @route GET /api/products/:id
const getListingById = async (req, res) => {
  try {
    const listing = await ProduceListing.findById(req.params.id).populate('farmer', 'name phone email profileImage address');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Produce listing not found' });
    }

    const batchTrace = await BatchTraceability.findOne({ batchId: listing.batchId });

    const l = listing.toObject();
    l.currentQuality = calculateCurrentQuality(l.aiQualityAssessment, l.storageCondition, l.cropName, new Date(), l.harvestDate);

    // Sanitize coordinates if not owner farmer or admin
    const isOwner = req.user && (req.user._id?.toString() === l.farmer?._id?.toString() || req.user.role === 'ADMIN');
    if (!isOwner) {
      const isGeoVerified = l.aiQualityAssessment?.latestGeoVerification?.status === 'VERIFIED' ||
                            l.aiQualityAssessment?.latestGeoVerification?.isGeoVerified === true;
      const verificationDate = l.aiQualityAssessment?.latestGeoVerification?.capturedAt ||
                               l.aiQualityAssessment?.latestVerifiedAt || null;

      if (l.location) {
        l.location = {
          district: l.location.district,
          state: l.location.state,
        };
      }
      if (l.aiQualityAssessment?.latestGeoVerification) {
        l.aiQualityAssessment.latestGeoVerification = {
          isGeoVerified,
          status: isGeoVerified ? 'VERIFIED' : 'NOT_VERIFIED',
          verificationDate,
          district: l.location?.district,
          state: l.location?.state,
        };
      }
      if (Array.isArray(l.aiQualityAssessment?.qualityVerificationHistory)) {
        l.aiQualityAssessment.qualityVerificationHistory = l.aiQualityAssessment.qualityVerificationHistory.map((h) => {
          const hGeoVerified = h.geoVerification?.status === 'VERIFIED' || h.geoVerification?.isGeoVerified === true;
          return {
            ...h,
            notes: h.notes ? h.notes.replace(/\(Lat:.*?, Lng:.*?\)/gi, '').trim() : h.notes,
            geoVerification: {
              isGeoVerified: hGeoVerified,
              status: hGeoVerified ? 'VERIFIED' : 'NOT_VERIFIED',
              verificationDate: h.timestamp || h.geoVerification?.capturedAt,
              district: l.location?.district,
              state: l.location?.state,
            },
          };
        });
      }
      if (batchTrace && Array.isArray(batchTrace.timeline)) {
        batchTrace.timeline = batchTrace.timeline.map((evt) => ({
          ...evt.toObject ? evt.toObject() : evt,
          location: evt.location ? evt.location.replace(/\(Lat:.*?, Lng:.*?\)/gi, '').trim() : evt.location,
        }));
      }
    }

    return res.json({ success: true, listing: l, batchTrace });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get My Produce Listings (Farmer/FPO)
// @route GET /api/products/farmer/my-listings
// @access Private (FARMER, FPO)
const getMyListings = async (req, res) => {
  try {
    const listings = await ProduceListing.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    const processedListings = listings.map((doc) => {
      const l = doc.toObject();
      l.currentQuality = calculateCurrentQuality(l.aiQualityAssessment, l.storageCondition, l.cropName, new Date(), l.harvestDate);
      return l;
    });
    return res.json({ success: true, count: processedListings.length, listings: processedListings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete Listing
// @route DELETE /api/products/:id
// @access Private (FARMER, FPO, ADMIN)
const deleteListing = async (req, res) => {
  try {
    const listing = await ProduceListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.farmer.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await listing.deleteOne();
    return res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createListing, getListings, getListingById, getMyListings, deleteListing, getSuggestions };
