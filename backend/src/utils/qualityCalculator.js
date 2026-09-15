/**
 * qualityCalculator.js
 * Single Source of Truth for Dynamic Agricultural Crop Quality Degradation
 * 
 * Implements physics/storage-calibrated decay curve:
 * - Cold Storage: 0.6% / day
 * - Refrigerated: 1.4% / day
 * - Warehouse: 2.6% / day
 * - Room Temperature: 3.2% / day
 * - Open Field: 4.8% / day
 * - Other: 3.0% / day
 * Stable grains/pulses (wheat, rice, chana, etc.) modifier: 0.35x
 * 
 * Quality States:
 * - VERIFIED: Fresh AI assessment from newly uploaded photo (< 24 hrs since verification).
 * - ESTIMATED: Dynamically projected quality based on latest verified baseline, elapsed time, and storage conditions.
 */

const STORAGE_DECAY_RATES = {
  'Cold Storage': 0.6,
  'Refrigerated': 1.4,
  'Warehouse': 2.6,
  'Room Temperature': 3.2,
  'Open Field': 4.8,
  'Other': 3.0,
};

const GRAIN_KEYWORDS = ['wheat', 'rice', 'chana', 'mustard', 'grain', 'pulse', 'gram', 'dal', 'barley', 'maize'];

/**
 * Computes current dynamic quality without altering permanent database records.
 * 
 * @param {Object} aiQualityAssessment Stored quality assessment object
 * @param {string} storageCondition Produce storage condition
 * @param {string} cropName Produce crop name
 * @param {Date|string|number} asOfDate Target evaluation timestamp (defaults to now)
 * @returns {Object} Dynamically evaluated quality object
 */
function calculateCurrentQuality(aiQualityAssessment, storageCondition, cropName = '', asOfDate = new Date(), harvestDate = null) {
  const targetDate = new Date(asOfDate);
  const condition = storageCondition || aiQualityAssessment?.storageCondition || 'Room Temperature';
  let dailyRate = STORAGE_DECAY_RATES[condition] !== undefined ? STORAGE_DECAY_RATES[condition] : 3.0;

  const cropLower = (cropName || '').toLowerCase();
  const isGrain = GRAIN_KEYWORDS.some((kw) => cropLower.includes(kw));
  if (isGrain) {
    dailyRate *= 0.35;
  }

  // Biological Harvest-Age Gate: AI visual quality MUST NOT override biological expiration
  const effectiveHarvestDate = harvestDate || aiQualityAssessment?.harvestDate;
  if (effectiveHarvestDate) {
    const hTime = new Date(effectiveHarvestDate).getTime();
    if (!isNaN(hTime)) {
      const harvestDiffDays = Math.floor((targetDate.getTime() - hTime) / (1000 * 60 * 60 * 24));
      const maxAllowedDays = isGrain ? 365 : 60;
      if (harvestDiffDays > maxAllowedDays) {
        return {
          currentScore: 20,
          currentGrade: 'D',
          qualityStatus: 'EXPIRED',
          spoilageRisk: 'CRITICAL',
          daysSinceVerification: Math.max(0, harvestDiffDays),
          elapsedDaysPrecise: Number(harvestDiffDays),
          latestVerifiedScore: 20,
          latestVerifiedGrade: 'D',
          latestVerifiedAt: new Date(effectiveHarvestDate).toISOString(),
          initialQualityScore: 20,
          initialGrade: 'D',
          storageCondition: condition,
          dailyDecayRate: Number(dailyRate.toFixed(2)),
          isFreshVerification: false,
          isExpired: true,
          harvestAgeDays: harvestDiffDays,
        };
      }
    }
  }

  if (!aiQualityAssessment) {
    return {
      currentScore: 92,
      currentGrade: 'A+',
      qualityStatus: 'NOT_VERIFIED',
      spoilageRisk: 'LOW',
      daysSinceVerification: 0,
      latestVerifiedScore: 92,
      latestVerifiedGrade: 'A+',
      latestVerifiedAt: new Date(),
      initialQualityScore: 92,
      initialGrade: 'A+',
      isFreshVerification: false,
    };
  }

  // 1. Establish Verified Baseline
  const initialScore = aiQualityAssessment.initialQualityScore || aiQualityAssessment.overallScore || 92;
  const initialGrade = (aiQualityAssessment.initialGrade || aiQualityAssessment.grade || 'A+').replace('GRADE_', '');

  const latestScore = aiQualityAssessment.latestVerifiedScore !== undefined
    ? aiQualityAssessment.latestVerifiedScore
    : (aiQualityAssessment.overallScore || 92);

  const latestGrade = (aiQualityAssessment.latestVerifiedGrade || aiQualityAssessment.grade || 'A+').replace('GRADE_', '');

  const latestDateRaw = aiQualityAssessment.latestVerifiedAt || aiQualityAssessment.analysisTimestamp || aiQualityAssessment.assessedAt || Date.now();
  const latestDate = new Date(latestDateRaw);

  // 2. Compute Elapsed Time
  const diffMs = targetDate.getTime() - latestDate.getTime();
  const elapsedDays = Math.max(0, diffMs / (1000 * 60 * 60 * 24));

  // 3. Project Current Estimated Score (bounded 30-100)
  const currentScore = Math.max(30, Math.min(100, Math.round(latestScore - (elapsedDays * dailyRate))));

  // 4. Automatic Grade Threshold Crossing
  let currentGrade = 'A';
  let spoilageRisk = 'LOW';
  if (currentScore >= 90) {
    currentGrade = 'A+';
    spoilageRisk = 'LOW';
  } else if (currentScore >= 80) {
    currentGrade = 'A';
    spoilageRisk = 'LOW';
  } else if (currentScore >= 70) {
    currentGrade = 'B';
    spoilageRisk = 'MODERATE';
  } else if (currentScore >= 60) {
    currentGrade = 'C';
    spoilageRisk = 'HIGH';
  } else {
    currentGrade = 'D';
    spoilageRisk = 'CRITICAL';
  }

  // 5. Explicit Quality Status: VERIFIED vs ESTIMATED vs NOT_VERIFIED
  // Rules:
  // - VERIFIED: Fresh photo (<24h) + valid current device GPS + successful verification.
  // - ESTIMATED: Quality is projected from previous verified assessment.
  // - NOT_VERIFIED: No valid geo-verification exists.
  // - A photo without GPS MUST NEVER become VERIFIED.
  const hasValidGeoVerification =
    aiQualityAssessment.latestGeoVerification?.status === 'VERIFIED' ||
    aiQualityAssessment.latestGeoVerification?.isGeoVerified === true;

  const isFresh = elapsedDays < 1.0;
  let qualityStatus = 'NOT_VERIFIED';
  if (hasValidGeoVerification) {
    qualityStatus = isFresh ? 'VERIFIED' : 'ESTIMATED';
  }

  return {
    currentScore,
    currentGrade,
    qualityStatus,
    spoilageRisk,
    daysSinceVerification: Math.floor(elapsedDays),
    elapsedDaysPrecise: Number(elapsedDays.toFixed(2)),
    latestVerifiedScore: latestScore,
    latestVerifiedGrade: latestGrade,
    latestVerifiedAt: latestDate.toISOString(),
    initialQualityScore: initialScore,
    initialGrade: initialGrade,
    storageCondition: condition,
    dailyDecayRate: Number(dailyRate.toFixed(2)),
    isFreshVerification: isFresh,
  };
}

module.exports = {
  STORAGE_DECAY_RATES,
  calculateCurrentQuality,
};
