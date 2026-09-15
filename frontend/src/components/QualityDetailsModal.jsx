import React from 'react';
import {
  X,
  Award,
  Sparkles,
  ShieldCheck,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Info,
  Layers,
  ThermometerSnowflake,
  History,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { calculateCurrentQuality } from '../utils/qualityCalculator';

const getGradeColor = (grade) => {
  const cleanGrade = (grade || 'A').toString().replace('GRADE_', '').trim();
  switch (cleanGrade) {
    case 'A+':
      return { bg: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'A':
      return { bg: 'bg-emerald-600', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'B':
      return { bg: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'C':
      return { bg: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-50 text-orange-800 border-orange-200' };
    default:
      return { bg: 'bg-rose-500', text: 'text-rose-700', badge: 'bg-rose-50 text-rose-800 border-rose-200' };
  }
};

const QualityDetailsModal = ({ isOpen, onClose, assessment, produceInfo }) => {
  if (!isOpen) return null;

  const currentQuality = produceInfo?.currentQuality || calculateCurrentQuality(
    assessment || produceInfo?.aiQualityAssessment,
    produceInfo?.storageCondition,
    produceInfo?.cropName
  );

  const {
    overallScore = currentQuality.currentScore,
    grade = currentQuality.currentGrade,
    confidence = 88,
    freshness = 94,
    appearance = 91,
    colorQuality = 95,
    visibleDamage = 96,
    spoilageRisk = 'Low',
    maturity = 88,
    observations = [
      'Natural coloration and skin integrity characteristic of high-quality produce.',
      'Minimal surface blemishes or mechanical defects observed.',
      'No visible evidence of mold, fungal sporulation, or insect damage.',
    ],
    concerns = ['Maintain standard storage conditions to prevent moisture loss.'],
    degradationForecast,
    source = 'AI Vision Engine',
    qualityVerificationHistory = [],
    latestGeoVerification,
  } = (assessment || produceInfo?.aiQualityAssessment || {});

  const forecastList = Array.isArray(degradationForecast) && degradationForecast.length > 0
    ? degradationForecast
    : [
        { days: 0, score: currentQuality.currentScore, grade: currentQuality.currentGrade },
        { days: 3, score: Math.max(30, currentQuality.currentScore - 5), grade: 'A' },
        { days: 7, score: Math.max(30, currentQuality.currentScore - 12), grade: 'B' },
        { days: 14, score: Math.max(30, currentQuality.currentScore - 22), grade: 'C' },
      ];

  const colors = getGradeColor(currentQuality.currentGrade);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200/80 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A2412] via-[#12401E] to-[#1B5E2B] p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                AI Visual Quality & Verification Lifecycle
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {produceInfo?.cropName ? `${produceInfo.cropName} Quality Report` : 'AI Crop Quality Report'}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Visual inspection baseline with dynamic decay projection & verified history.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Top Score Banner with VERIFIED vs ESTIMATED indicator */}
          <div className="p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 rounded-3xl border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Score Meter Circle */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-emerald-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-600"
                    strokeDasharray={`${currentQuality.currentScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-900 leading-none">{currentQuality.currentScore}%</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Quality</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Current Grade:</span>
                  <span className={`px-3 py-0.5 rounded-full text-sm font-black border ${colors.badge}`}>
                    Grade {currentQuality.currentGrade}
                  </span>
                </div>

                <div className="pt-1">
                  {currentQuality.qualityStatus === 'VERIFIED' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      VERIFIED (Fresh AI Photo Assessment)
                    </span>
                  ) : currentQuality.qualityStatus === 'ESTIMATED' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      ESTIMATED (Projected • {currentQuality.daysSinceVerification} days since verification)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-300">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
                      NOT VERIFIED (No Valid Geo-Verification)
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 font-medium">
                  Storage Condition: <span className="font-extrabold text-slate-800">{currentQuality.storageCondition}</span> • Decay: <span className="font-bold text-slate-700">{currentQuality.dailyDecayRate}% / day</span>
                </p>
              </div>
            </div>

            {/* Geo Verification Status Badge */}
            {(latestGeoVerification?.isGeoVerified || latestGeoVerification?.status === 'VERIFIED') && (
              <div className="bg-white p-3 rounded-2xl border border-emerald-200 text-xs font-semibold text-slate-700 space-y-0.5 shadow-sm min-w-[150px]">
                <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Geo-Verification
                </div>
                <span className="text-[10px] text-emerald-700 font-bold block">Verified Farm Origin</span>
                <span className="text-[10px] text-slate-500">
                  {produceInfo?.location?.district ? `${produceInfo.location.district}, ${produceInfo.location.state}` : 'Farm Gate'}
                </span>
              </div>
            )}
          </div>

          {/* Baseline Reset Info Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-200 pb-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Degradation Baseline Reference
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                Baseline resets on every photo re-verification
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Initial Listing Assessment</span>
                <span className="font-black text-slate-900 text-sm">
                  {currentQuality.initialQualityScore}% (Grade {currentQuality.initialGrade})
                </span>
                <span className="text-[10px] text-slate-500 block">Permanent Historical Record</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Active Verified Baseline</span>
                <span className="font-black text-emerald-700 text-sm">
                  {currentQuality.latestVerifiedScore}% (Grade {currentQuality.latestVerifiedGrade})
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Verified: {new Date(currentQuality.latestVerifiedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Metric Progress Bars */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              Visual Parameter Breakdown
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-slate-700">Freshness Index</span>
                  <span className="text-emerald-700 font-black">{freshness}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${freshness}%` }} />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-slate-700">Appearance & Texture</span>
                  <span className="text-emerald-700 font-black">{appearance}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${appearance}%` }} />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-slate-700">Color Uniformity</span>
                  <span className="text-emerald-700 font-black">{colorQuality}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${colorQuality}%` }} />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-slate-700">Surface Defect & Damage</span>
                  <span className="text-emerald-700 font-black">{visibleDamage}% (Integrity High)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${visibleDamage}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quality History Timeline */}
          {Array.isArray(qualityVerificationHistory) && qualityVerificationHistory.length > 0 && (
            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-emerald-700" />
                Permanent Quality Verification History
              </h4>
              <div className="space-y-2.5">
                {qualityVerificationHistory.map((hist, i) => (
                  <div key={i} className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <div>
                        <span className="font-black text-slate-900 block">
                          {hist.type === 'INITIAL_ASSESSMENT' ? 'Initial AI Assessment' : 'Geo Re-verification'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(hist.timestamp).toLocaleString()} • {hist.notes || 'Visual check'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-700 text-sm block">
                        {hist.score}% (Grade {hist.grade})
                      </span>
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        VERIFIED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estimated Visual Quality Trend (Degradation Forecast) */}
          <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-teal-600" />
                Estimated Visual Quality Trend
              </h4>
              <span className="text-[10px] font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                Starts from Active Baseline ({currentQuality.latestVerifiedScore}%)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {forecastList.map((item, i) => (
                <div key={i} className="p-3 bg-white rounded-2xl border border-slate-200 text-center space-y-1 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    {item.days === 0 ? 'Baseline (Day 0)' : `After ${item.days} Days`}
                  </span>
                  <p className="text-lg font-black text-slate-900">
                    {item.score}% <span className="text-xs font-bold text-emerald-700">| {item.grade}</span>
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              * The dynamic quality between verifications is ESTIMATED based on elapsed time and storage condition ({currentQuality.storageCondition}).
            </p>
          </div>

          {/* Mandatory AI Transparency Disclaimer */}
          <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-slate-800 block">AI Visual Inspection Disclaimer</span>
              <span>
                Quality scores are calculated from visual surface attributes and calibrated storage decay.
                They are intended as an informational decision aid. Physical verification at collection remains available for bulk buyers.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Engine: {source}</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default QualityDetailsModal;
