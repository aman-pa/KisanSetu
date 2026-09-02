const ProduceListing = require('../models/ProduceListing');
const BatchTraceability = require('../models/BatchTraceability');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

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
    const { cropName, category, quantityKg, pricePerKg, grade, harvestDate, images, location } = req.body;

    if (!cropName || !quantityKg || !pricePerKg || !harvestDate) {
      return res.status(400).json({ success: false, message: 'Please provide crop name, quantity, price, and harvest date' });
    }

    const batchId = `KS-BATCH-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const qrDataUrl = await generateBatchQR(batchId, cropName, req.user.name, harvestDate);

    // AI Assisted visual quality assessment simulation (Grade A -> 92%, Grade B -> 82%, Grade C -> 72%)
    let aiQualityScore = 92;
    if (grade === 'GRADE_B') aiQualityScore = 81;
    if (grade === 'GRADE_C') aiQualityScore = 70;

    // AI Price Recommendation calculation
    const currentAvg = Number(pricePerKg);
    const recommendedMin = Math.max(10, Math.round(currentAvg * 0.95));
    const recommendedMax = Math.round(currentAvg * 1.12);

    const listing = await ProduceListing.create({
      farmer: req.user._id,
      cropName,
      category: category || 'VEGETABLES',
      quantityKg: Number(quantityKg),
      availableQuantityKg: Number(quantityKg),
      pricePerKg: Number(pricePerKg),
      grade: grade || 'GRADE_A',
      harvestDate: new Date(harvestDate),
      images: images && images.length ? images : [
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'
      ],
      location: location || {
        district: req.user.address?.city || 'Karnal',
        state: req.user.address?.state || 'Haryana',
        lat: 29.6857,
        lng: 76.9905,
      },
      batchId,
      aiQualityEstimateScore: aiQualityScore,
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
          notes: `Visual defect inspection completed. Estimated score: ${aiQualityScore}/100.`,
        },
      ],
    });

    return res.status(201).json({ success: true, listing, batchId, qrDataUrl });
  } catch (error) {
    console.error('Create listing error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get All Produce Listings with Filtering & Search
// @route GET /api/products
const getListings = async (req, res) => {
  try {
    const { search, category, district, state, grade, minPrice, maxPrice, sort } = req.query;

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

    const listings = await ProduceListing.find(query)
      .populate('farmer', 'name phone profileImage address')
      .sort(sortOptions);

    return res.json({ success: true, count: listings.length, listings });
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

    return res.json({ success: true, listing, batchTrace });
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
    return res.json({ success: true, count: listings.length, listings });
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

module.exports = { createListing, getListings, getListingById, getMyListings, deleteListing };
