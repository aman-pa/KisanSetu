const QRCode = require('qrcode');
const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const FPOProfile = require('../models/FPOProfile');
const BuyerProfile = require('../models/BuyerProfile');
const LogisticsProfile = require('../models/LogisticsProfile');
const ProduceListing = require('../models/ProduceListing');
const ProcurementRequest = require('../models/ProcurementRequest');
const Order = require('../models/Order');
const BatchTraceability = require('../models/BatchTraceability');
const SystemConfig = require('../models/SystemConfig');
const DemandForecast = require('../models/DemandForecast');
const TrustScore = require('../models/TrustScore');
const MarketPrice = require('../models/MarketPrice');
const seedMarketData = require('./seedMarketData');

const autoSeedIfEmpty = async () => {
  try {
    // 0. Ensure Agricultural Market Data is seeded idempotently
    const marketPricesCount = await MarketPrice.countDocuments();
    if (marketPricesCount === 0) {
      await seedMarketData(false);
    }

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      // Ensure amanpandey10a3@gmail.com exists as Farmer
      const userAman = await User.findOne({ email: 'amanpandey10a3@gmail.com' });
      if (!userAman) {
        const farmerAman = await User.create({
          name: 'Aman Pandey (Farmer Partner)',
          email: 'amanpandey10a3@gmail.com',
          phone: '9876543219',
          password: 'Farmer@123',
          role: 'FARMER',
          address: { street: 'Pandey Farm House', city: 'Karnal', state: 'Haryana', pincode: '132001' },
        });

        await FarmerProfile.create({
          user: farmerAman._id,
          farmSizeAcres: 12.0,
          location: { village: 'Kheri', district: 'Karnal', state: 'Haryana', coordinates: { lat: 29.6857, lng: 76.9905 } },
          cropsGrown: ['Tomato', 'Wheat', 'Potato'],
          trustScore: 98,
          qualityScore: 97,
          totalEarnings: 250000,
        });

        await TrustScore.create({ user: farmerAman._id, overallScore: 98 });
        console.log('[AutoSeed] Added Farmer user account for amanpandey10a3@gmail.com');
      }

      // Ensure all standard produce listings and batch traceability exist idempotently
      const farmerRamesh = await User.findOne({ email: 'farmer.ramesh@kisansetu.in' });
      const farmerSuresh = await User.findOne({ email: 'farmer.suresh@kisansetu.in' });
      const fpoPunjab = await User.findOne({ email: 'fpo.punjab@kisansetu.in' });
      const currentAman = await User.findOne({ email: 'amanpandey10a3@gmail.com' });

      const defaultFarmer = farmerRamesh || currentAman;
      const defaultFarmer2 = farmerSuresh || currentAman;
      const defaultFpo = fpoPunjab || currentAman;

      if (defaultFarmer) {
        const standardListings = [
          {
            farmer: defaultFarmer._id,
            cropName: 'Tomato',
            category: 'VEGETABLES',
            quantityKg: 2000,
            availableQuantityKg: 2000,
            pricePerKg: 28,
            grade: 'GRADE_A',
            harvestDate: new Date(Date.now() + 5 * 86400000),
            images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'],
            location: { district: 'Karnal', state: 'Haryana', lat: 29.6857, lng: 76.9905 },
            batchId: 'KS-BATCH-994821',
            aiQualityEstimateScore: 94,
            aiPriceRecommendation: { min: 27, max: 29, reasoning: 'High demand in Delhi NCR mandi forecast.' },
          },
          {
            farmer: defaultFarmer2 ? defaultFarmer2._id : defaultFarmer._id,
            cropName: 'Tomato',
            category: 'VEGETABLES',
            quantityKg: 1500,
            availableQuantityKg: 1500,
            pricePerKg: 27,
            grade: 'GRADE_A',
            harvestDate: new Date(Date.now() + 4 * 86400000),
            images: ['https://images.unsplash.com/photo-1546470427-0d4db154ceb7?auto=format&fit=crop&w=600&q=80'],
            location: { district: 'Panipat', state: 'Haryana', lat: 29.3909, lng: 76.9635 },
            batchId: 'KS-BATCH-994822',
            aiQualityEstimateScore: 89,
            aiPriceRecommendation: { min: 26, max: 28, reasoning: 'Optimal harvest freshness index.' },
          },
          {
            farmer: defaultFpo ? defaultFpo._id : defaultFarmer._id,
            cropName: 'Tomato',
            category: 'VEGETABLES',
            quantityKg: 2500,
            availableQuantityKg: 2500,
            pricePerKg: 26,
            grade: 'GRADE_A',
            harvestDate: new Date(Date.now() + 3 * 86400000),
            images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'],
            location: { district: 'Ambala', state: 'Punjab', lat: 30.3782, lng: 76.7767 },
            batchId: 'KS-BATCH-994823',
            aiQualityEstimateScore: 92,
            aiPriceRecommendation: { min: 25, max: 28, reasoning: 'Bulk volume pricing efficiency.' },
          },
          {
            farmer: defaultFarmer._id,
            cropName: 'Potato',
            category: 'VEGETABLES',
            quantityKg: 5000,
            availableQuantityKg: 5000,
            pricePerKg: 18,
            grade: 'GRADE_A',
            harvestDate: new Date(Date.now() + 10 * 86400000),
            images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'],
            location: { district: 'Karnal', state: 'Haryana', lat: 29.6857, lng: 76.9905 },
            batchId: 'KS-BATCH-994824',
            aiQualityEstimateScore: 95,
            aiPriceRecommendation: { min: 17, max: 19, reasoning: 'Steady winter storage demand.' },
          },
          {
            farmer: defaultFarmer2 ? defaultFarmer2._id : defaultFarmer._id,
            cropName: 'Onion',
            category: 'VEGETABLES',
            quantityKg: 3500,
            availableQuantityKg: 3500,
            pricePerKg: 34,
            grade: 'GRADE_A',
            harvestDate: new Date(Date.now() + 7 * 86400000),
            images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80'],
            location: { district: 'Panipat', state: 'Haryana', lat: 29.3909, lng: 76.9635 },
            batchId: 'KS-BATCH-994825',
            aiQualityEstimateScore: 91,
            aiPriceRecommendation: { min: 33, max: 36, reasoning: 'Regional supply shortage spike.' },
          },
        ];

        for (const item of standardListings) {
          const existing = await ProduceListing.findOne({ batchId: item.batchId });
          if (!existing) {
            const listing = await ProduceListing.create(item);
            const qrPayload = await QRCode.toDataURL(
              JSON.stringify({ batchId: item.batchId, crop: item.cropName, verifyUrl: `http://localhost:5173/trace/${item.batchId}` })
            );

            await BatchTraceability.create({
              batchId: item.batchId,
              produceListing: listing._id,
              farmer: item.farmer,
              cropName: item.cropName,
              quantityKg: item.quantityKg,
              harvestDate: item.harvestDate,
              qrDataUrl: qrPayload,
              timeline: [
                {
                  stage: 'LISTED',
                  timestamp: new Date(),
                  actor: 'Farmer Partner',
                  location: `${item.location.district}, ${item.location.state}`,
                  notes: `Produce listed on KisanSetu AI. Grade: ${item.grade}.`,
                },
                {
                  stage: 'AI_ASSESSED',
                  timestamp: new Date(),
                  actor: 'KisanSetu AI Vision Engine',
                  location: 'Cloud Machine Learning Engine',
                  notes: `Visual quality score confirmed: ${item.aiQualityEstimateScore}/100.`,
                },
              ],
            });
          }
        }
      }
      return;
    }

    console.log('[AutoSeed] Empty database detected. Populated initial SIH seed dataset...');

    // 1. Seed System Config
    await SystemConfig.create({
      key: 'CONSUMER_MAX_PURCHASE_LIMIT_KG',
      value: 10,
      description: 'Maximum produce quantity allowed per consumer purchase order',
    });

    // 2. Create Users
    const admin = await User.create({
      name: 'Dr. V. K. Sharma (Ministry of Agriculture)',
      email: 'admin@kisansetu.in',
      phone: '9810011223',
      password: 'Admin@123',
      role: 'ADMIN',
      address: { street: 'Krishi Bhawan', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
    });

    const farmerRamesh = await User.create({
      name: 'Ramesh Kumar',
      email: 'farmer.ramesh@kisansetu.in',
      phone: '9876543210',
      password: 'Farmer@123',
      role: 'FARMER',
      address: { street: 'Kheri Village', city: 'Karnal', state: 'Haryana', pincode: '132001' },
    });

    const farmerAman = await User.create({
      name: 'Aman Pandey (Farmer Partner)',
      email: 'amanpandey10a3@gmail.com',
      phone: '9876543219',
      password: 'Farmer@123',
      role: 'FARMER',
      address: { street: 'Pandey Farm House', city: 'Karnal', state: 'Haryana', pincode: '132001' },
    });

    const farmerSuresh = await User.create({
      name: 'Suresh Singh',
      email: 'farmer.suresh@kisansetu.in',
      phone: '9876543211',
      password: 'Farmer@123',
      role: 'FARMER',
      address: { street: 'Samalkha', city: 'Panipat', state: 'Haryana', pincode: '132103' },
    });

    const fpoPunjab = await User.create({
      name: 'Punjab Kisan Producer Co-op',
      email: 'fpo.punjab@kisansetu.in',
      phone: '9876543212',
      password: 'Fpo@123',
      role: 'FPO',
      address: { street: 'GT Road Hub', city: 'Ambala', state: 'Punjab', pincode: '134003' },
    });

    const bulkBuyer = await User.create({
      name: 'FreshMart Supermarkets Ltd',
      email: 'buyer.freshmart@kisansetu.in',
      phone: '9876543213',
      password: 'Buyer@123',
      role: 'BULK_BUYER',
      address: { street: 'Sector 62 DC', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
    });

    const consumerAnita = await User.create({
      name: 'Anita Verma',
      email: 'consumer.anita@kisansetu.in',
      phone: '9876543214',
      password: 'Consumer@123',
      role: 'CONSUMER',
      address: { street: 'Flat 402, Green Acres', city: 'Delhi', state: 'Delhi', pincode: '110016' },
    });

    const logisticsExpress = await User.create({
      name: 'ColdChain Express Logistics',
      email: 'logistics.express@kisansetu.in',
      phone: '9876543215',
      password: 'Logistics@123',
      role: 'LOGISTICS',
      address: { street: 'Transport Nagar', city: 'Delhi', state: 'Delhi', pincode: '110042' },
    });

    // 3. Create Profiles
    await FarmerProfile.create({
      user: farmerAman._id,
      farmSizeAcres: 12.0,
      location: { village: 'Kheri', district: 'Karnal', state: 'Haryana', coordinates: { lat: 29.6857, lng: 76.9905 } },
      cropsGrown: ['Tomato', 'Wheat', 'Potato'],
      trustScore: 98,
      qualityScore: 97,
      totalEarnings: 250000,
    });

    await FarmerProfile.create({
      user: farmerRamesh._id,
      farmSizeAcres: 8.5,
      location: { village: 'Kheri', district: 'Karnal', state: 'Haryana', coordinates: { lat: 29.6857, lng: 76.9905 } },
      cropsGrown: ['Tomato', 'Wheat'],
      trustScore: 94,
      qualityScore: 95,
      totalEarnings: 184000,
    });

    await FarmerProfile.create({
      user: farmerSuresh._id,
      farmSizeAcres: 6.0,
      location: { village: 'Samalkha', district: 'Panipat', state: 'Haryana', coordinates: { lat: 29.3909, lng: 76.9635 } },
      cropsGrown: ['Tomato', 'Onion'],
      trustScore: 88,
      qualityScore: 90,
      totalEarnings: 142000,
    });

    await FPOProfile.create({
      user: fpoPunjab._id,
      orgName: 'Punjab Kisan Producer Co-op',
      registrationNumber: 'FPO-PB-2023-991',
      representativeName: 'Gurpreet Singh',
      numberOfMemberFarmers: 240,
      cropsHandled: ['Tomato', 'Potato', 'Wheat', 'Rice'],
      operatingRegions: ['Punjab', 'Haryana'],
      totalRevenue: 890000,
    });

    await BuyerProfile.create({
      user: bulkBuyer._id,
      businessName: 'FreshMart Supermarkets Ltd',
      businessType: 'SUPERMARKET',
      gstNumber: '07AAAAA1234A1Z2',
      procurementCategory: ['VEGETABLES', 'FRUITS', 'GRAINS'],
    });

    await LogisticsProfile.create({
      user: logisticsExpress._id,
      companyName: 'ColdChain Express Logistics',
      vehicleType: 'REFRIGERATED_TRUCK',
      vehicleNumber: 'HR-05-CC-9988',
      vehicleCapacityKg: 8000,
      serviceAreas: ['Delhi NCR', 'Punjab', 'Haryana', 'UP'],
    });

    await TrustScore.create({ user: farmerAman._id, overallScore: 98 });
    await TrustScore.create({ user: farmerRamesh._id, overallScore: 94 });
    await TrustScore.create({ user: farmerSuresh._id, overallScore: 88 });

    // 4. Create Produce Listings
    const listingsData = [
      {
        farmer: farmerAman._id,
        cropName: 'Tomato',
        category: 'VEGETABLES',
        quantityKg: 3000,
        availableQuantityKg: 3000,
        pricePerKg: 28,
        grade: 'GRADE_A',
        harvestDate: new Date(Date.now() + 5 * 86400000),
        images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'],
        location: { district: 'Karnal', state: 'Haryana', lat: 29.6857, lng: 76.9905 },
        batchId: 'KS-BATCH-994821',
        aiQualityEstimateScore: 98,
        aiPriceRecommendation: { min: 27, max: 29, reasoning: 'High demand in Delhi NCR mandi forecast.' },
      },
    ];

    for (const item of listingsData) {
      const listing = await ProduceListing.create(item);

      const qrPayload = await QRCode.toDataURL(
        JSON.stringify({ batchId: item.batchId, crop: item.cropName, verifyUrl: `http://localhost:5173/trace/${item.batchId}` })
      );

      await BatchTraceability.create({
        batchId: item.batchId,
        produceListing: listing._id,
        farmer: item.farmer,
        cropName: item.cropName,
        quantityKg: item.quantityKg,
        harvestDate: item.harvestDate,
        qrDataUrl: qrPayload,
        timeline: [
          {
            stage: 'LISTED',
            timestamp: new Date(),
            actor: 'Farmer Partner',
            location: `${item.location.district}, ${item.location.state}`,
            notes: `Produce listed on KisanSetu AI. Grade: ${item.grade}.`,
          },
          {
            stage: 'AI_ASSESSED',
            timestamp: new Date(),
            actor: 'KisanSetu AI Vision Engine',
            location: 'Cloud Machine Learning Engine',
            notes: `Visual quality score confirmed: ${item.aiQualityEstimateScore}/100.`,
          },
        ],
      });
    }

    console.log('[AutoSeed] Successfully populated all 6 roles, listings, and demo data!');
  } catch (err) {
    console.error('[AutoSeed Error]', err.message);
  }
};

module.exports = autoSeedIfEmpty;
