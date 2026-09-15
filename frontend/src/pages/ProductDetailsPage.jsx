import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Calendar,
  MapPin,
  ShieldCheck,
  ShoppingCart,
  QrCode,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import QualityDetailsModal from '../components/QualityDetailsModal';
import { calculateCurrentQuality } from '../utils/qualityCalculator';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [batchTrace, setBatchTrace] = useState(null);
  const [quantityKg, setQuantityKg] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastSuccess, setToastSuccess] = useState('');
  const [showQualityModal, setShowQualityModal] = useState(false);

  const { addToCart, maxConsumerLimitKg } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        if (data.success) {
          setListing(data.listing);
          setBatchTrace(data.batchTrace);
        }
      } catch (err) {
        setError('Failed to load produce details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleAddToCart = () => {
    setError('');
    setToastSuccess('');
    try {
      addToCart(listing, Number(quantityKg));
      setToastSuccess(`Added ${quantityKg} kg of ${listing.cropName} to cart!`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-20 text-center text-xs font-bold text-slate-400">Loading produce specification...</div>
      </MainLayout>
    );
  }

  if (!listing) {
    return (
      <MainLayout>
        <div className="py-20 text-center text-xs font-bold text-rose-600">Listing not found</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-[#F8F9FA] min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-agri-primary">
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>

          {toastSuccess && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center justify-between shadow-agri-sm">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-700" /> {toastSuccess}</span>
              <button onClick={() => navigate('/cart')} className="underline font-extrabold text-agri-dark">
                Proceed to Checkout →
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-agri-sm">
              <AlertTriangle className="w-5 h-5 text-rose-700 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Image Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-agri-md h-96">
                <img
                  src={listing.images?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'}
                  alt={listing.cropName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Batch Traceability Quick Bar */}
              <div className="bg-gradient-to-r from-agri-dark to-emerald-950 p-6 rounded-3xl text-white space-y-4 shadow-agri-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-agri-gold" /> Batch QR Code Payload
                  </span>
                  <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white">{listing.batchId}</span>
                </div>
                <div className="flex items-center gap-4">
                  {batchTrace?.qrDataUrl && (
                    <img src={batchTrace.qrDataUrl} alt="Batch QR Code" className="w-20 h-20 rounded-xl bg-white p-1" />
                  )}
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-white">Full Supply Chain Traceability Enabled</p>
                    <p className="text-[11px] text-slate-300">Scan or click below to inspect stage-wise quality & harvest verification timeline.</p>
                    <Link
                      to={`/trace/${listing.batchId}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-agri-light hover:underline pt-1"
                    >
                      View Live Batch Traceability Timeline <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Produce Specifications & Order Box */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-agri-sm space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {listing.category}
                    </span>
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-agri-dark text-white">
                      {listing.grade.replace('GRADE_', 'Grade ')}
                    </span>
                  </div>
                  <h1 className="text-3xl font-extrabold text-slate-900">{listing.cropName}</h1>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> Harvested in {listing.location?.district}, {listing.location?.state}
                  </p>
                </div>

                {/* Price Display */}
                <div className="p-4 bg-[#F8F9FA] rounded-2xl flex items-center justify-between border border-slate-100">
                  <div>
                    <span className="text-3xl font-black text-agri-primary">₹{listing.pricePerKg}</span>
                    <span className="text-xs text-slate-500 font-bold ml-1">/ kg</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 block">Available Quantity</span>
                    <span className="text-sm font-extrabold text-emerald-800">{listing.availableQuantityKg.toLocaleString()} kg</span>
                  </div>
                </div>

                {/* AI Quality Rating Card */}
                {(() => {
                  const q = listing.currentQuality || calculateCurrentQuality(listing.aiQualityAssessment, listing.storageCondition, listing.cropName);
                  return (
                    <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 border border-emerald-200/80 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-600" /> AI Visual Crop Quality
                        </span>
                        <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                          q.qualityStatus === 'VERIFIED'
                            ? 'text-emerald-900 bg-emerald-200/90 border-emerald-300'
                            : q.qualityStatus === 'ESTIMATED'
                            ? 'text-amber-950 bg-amber-100 border-amber-300'
                            : 'text-slate-800 bg-slate-200 border-slate-300'
                        }`}>
                          {q.qualityStatus === 'VERIFIED'
                            ? '✓ VERIFIED'
                            : q.qualityStatus === 'ESTIMATED'
                            ? '⏱ ESTIMATED'
                            : '✕ NOT VERIFIED'}: Grade {q.currentGrade} ({q.currentScore}%)
                        </span>
                      </div>

                      {(listing.aiQualityAssessment?.latestGeoVerification?.isGeoVerified || listing.aiQualityAssessment?.latestGeoVerification?.status === 'VERIFIED') && (
                        <div className="flex items-center justify-between text-xs text-emerald-900 font-bold bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Geo-Verification: Verified Farm Origin
                          </span>
                          <span className="text-slate-500 font-medium">
                            {listing.location?.district}, {listing.location?.state}
                          </span>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-600">
                        {q.qualityStatus === 'VERIFIED'
                          ? 'Fresh visual inspection baseline verified from farm-gate photographs.'
                          : `Projected quality based on ${q.storageCondition} storage (${q.dailyDecayRate}%/day decay) over ${q.daysSinceVerification} elapsed days.`}
                      </p>

                      <button
                        type="button"
                        onClick={() => setShowQualityModal(true)}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Award className="w-4 h-4" /> View Full Quality Report & Degradation Trend
                      </button>
                    </div>
                  );
                })()}

                {/* Add to Cart Form */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="w-full sm:w-44">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Select Quantity (kg)</label>
                      <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setQuantityKg((prev) => Math.max(1, Number(prev || 1) - 1))}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm transition-colors cursor-pointer select-none"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          max={listing.availableQuantityKg}
                          value={quantityKg}
                          onChange={(e) => setQuantityKg(e.target.value)}
                          onBlur={() => {
                            if (!quantityKg || Number(quantityKg) < 1) setQuantityKg(1);
                          }}
                          className="w-full text-center py-2 text-xs font-extrabold text-slate-900 focus:outline-none bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantityKg((prev) => Math.min(listing.availableQuantityKg, Number(prev || 1) + 1))}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm transition-colors cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 sm:pt-5">
                      <button
                        onClick={handleAddToCart}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-bold text-xs shadow-agri-md hover:shadow-agri-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4 text-emerald-300" /> Add to Cart (Subtotal: ₹{(listing.pricePerKg * Number(quantityKg || 0)).toLocaleString()})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Details Modal */}
        <QualityDetailsModal
          isOpen={showQualityModal}
          onClose={() => setShowQualityModal(false)}
          assessment={
            listing.aiQualityAssessment || {
              overallScore: listing.aiQualityEstimateScore || 92,
              grade: listing.grade?.replace('GRADE_', '') || 'A+',
              confidence: 88,
              freshness: 94,
              appearance: 91,
              colorQuality: 95,
              visibleDamage: 96,
              spoilageRisk: 'Low',
              maturity: 88,
            }
          }
          produceInfo={listing}
        />
      </div>
    </MainLayout>
  );
};

export default ProductDetailsPage;
