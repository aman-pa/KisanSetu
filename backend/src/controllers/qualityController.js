const QualityVerification = require('../models/QualityVerification');
const Order = require('../models/Order');
const ProduceListing = require('../models/ProduceListing');
const BatchTraceability = require('../models/BatchTraceability');
const Dispute = require('../models/Dispute');

// @desc Submit Stage 2 Pickup Quality Verification (Logistics)
// @route POST /api/quality/pickup
// @access Private (LOGISTICS, ADMIN)
const submitPickupVerification = async (req, res) => {
  try {
    const { batchId, orderId, weightKgMeasured, gradeVerified, photos, colorScore, defectPercentage, packagingCondition, comments } = req.body;

    if (!batchId || !weightKgMeasured) {
      return res.status(400).json({ success: false, message: 'Batch ID and measured weight are required.' });
    }

    const listing = await ProduceListing.findOne({ batchId });

    let mismatch = false;
    if (listing && gradeVerified && listing.grade !== gradeVerified) {
      mismatch = true;
    }

    const verification = await QualityVerification.create({
      batchId,
      order: orderId || null,
      produceListing: listing ? listing._id : null,
      stage: 'PICKUP',
      verifier: req.user._id,
      verifierRole: 'LOGISTICS',
      gradeVerified: gradeVerified || (listing ? listing.grade : 'GRADE_A'),
      weightKgMeasured: Number(weightKgMeasured),
      photos: photos || ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'],
      metrics: {
        colorScore: Number(colorScore || 90),
        defectPercentage: Number(defectPercentage || 3),
        sizeUniformityScore: 88,
        packagingCondition: packagingCondition || 'Intact & Ventilated Crate',
      },
      mismatchDetected: mismatch,
      comments: comments || 'Pickup quality verified at farm gate by logistics agent.',
    });

    // Update batch traceability timeline
    await BatchTraceability.findOneAndUpdate(
      { batchId },
      {
        $push: {
          timeline: {
            stage: 'PICKUP_VERIFIED',
            timestamp: new Date(),
            actor: `Logistics (${req.user.name})`,
            location: listing ? `${listing.location.district}, ${listing.location.state}` : 'Farm Collection Point',
            notes: `Pickup verified. Measured Weight: ${weightKgMeasured} kg. Grade: ${gradeVerified || 'A'}. Mismatch: ${mismatch ? 'YES' : 'NO'}.`,
            verificationData: { weightKgMeasured, gradeVerified },
          },
        },
      }
    );

    // Update order status if orderId provided
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { status: 'PICKUP_VERIFIED' });
    }

    return res.status(201).json({ success: true, verification, mismatchDetected: mismatch });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Submit Stage 3 Delivery Quality Verification (Buyer) & Compare
// @route POST /api/quality/delivery
// @access Private (BULK_BUYER, CONSUMER, ADMIN)
const submitDeliveryVerification = async (req, res) => {
  try {
    const { batchId, orderId, weightKgMeasured, gradeVerified, photos, comments } = req.body;

    const listing = await ProduceListing.findOne({ batchId });
    const pickupRecord = await QualityVerification.findOne({ batchId, stage: 'PICKUP' });

    let mismatch = false;
    let mismatchReasons = [];

    // Compare Listed vs Pickup vs Delivered
    if (listing && gradeVerified && listing.grade !== gradeVerified) {
      mismatch = true;
      mismatchReasons.push(`Grade mismatch: Listed as ${listing.grade}, but delivered as ${gradeVerified}`);
    }

    if (pickupRecord && weightKgMeasured) {
      const weightDiff = Math.abs(pickupRecord.weightKgMeasured - Number(weightKgMeasured));
      if (weightDiff > pickupRecord.weightKgMeasured * 0.05) {
        mismatch = true;
        mismatchReasons.push(`Weight discrepancy detected: Pickup was ${pickupRecord.weightKgMeasured} kg, Delivered: ${weightKgMeasured} kg`);
      }
    }

    let disputeDoc = null;
    if (mismatch && orderId) {
      disputeDoc = await Dispute.create({
        order: orderId,
        raisedBy: req.user._id,
        reason: `AUTOMATIC QUALITY MISMATCH DETECTED: ${mismatchReasons.join(' | ')}`,
        evidencePhotos: photos || [],
        stage: 'DELIVERY',
        status: 'OPEN',
      });
    }

    const verification = await QualityVerification.create({
      batchId,
      order: orderId || null,
      produceListing: listing ? listing._id : null,
      stage: 'DELIVERY',
      verifier: req.user._id,
      verifierRole: 'BUYER',
      gradeVerified: gradeVerified || 'GRADE_A',
      weightKgMeasured: Number(weightKgMeasured || 0),
      photos: photos || [],
      mismatchDetected: mismatch,
      disputeRef: disputeDoc ? disputeDoc._id : null,
      comments: comments || (mismatch ? 'Quality mismatch flagged during delivery inspection.' : 'Delivery inspection verified clean.'),
    });

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        status: mismatch ? 'DISPUTED' : 'DELIVERED',
      });
    }

    // Update batch timeline
    await BatchTraceability.findOneAndUpdate(
      { batchId },
      {
        $push: {
          timeline: {
            stage: 'BUYER_VERIFIED',
            timestamp: new Date(),
            actor: `Buyer (${req.user.name})`,
            location: 'Destination Delivery Hub',
            notes: mismatch ? `QUALITY MISMATCH DETECTED! Dispute #${disputeDoc?._id} raised.` : 'Delivery quality verified successfully by buyer.',
          },
        },
      }
    );

    return res.status(201).json({
      success: true,
      verification,
      mismatchDetected: mismatch,
      mismatchReasons,
      dispute: disputeDoc,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Quality Verifications by Batch ID
// @route GET /api/quality/batch/:batchId
const getQualityByBatch = async (req, res) => {
  try {
    const verifications = await QualityVerification.find({ batchId: req.params.batchId }).populate('verifier', 'name role');
    return res.json({ success: true, verifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitPickupVerification, submitDeliveryVerification, getQualityByBatch };
