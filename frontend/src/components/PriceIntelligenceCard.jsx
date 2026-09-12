import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Building2,
  RefreshCw,
  Activity,
  Layers,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Sparkles,
  Search,
  Sprout,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const COMMODITY_OPTIONS = ['Tomato', 'Potato', 'Onion', 'Wheat', 'Rice', 'Apple'];
const MANDI_OPTIONS = [
  'Karnal',
  'Azadpur APMC',
  'Ghazipur',
  'Agra',
  'Nashik',
  'Jalandhar Cantt',
  'Ambala City',
  'Panipat',
  'Delhi NCR',
];
const HORIZON_OPTIONS = [
  { label: '7 Days', value: 7 },
  { label: '15 Days', value: 15 },
  { label: '30 Days', value: 30 },
];

const PriceIntelligenceCard = ({ defaultCommodity = 'Tomato', defaultMandi = 'Karnal' }) => {
  const [commodity, setCommodity] = useState(defaultCommodity);
  const [mandi, setMandi] = useState(defaultMandi);
  const [horizon, setHorizon] = useState(7);

  const [recommendationData, setRecommendationData] = useState(null);
  const [bestMandiData, setBestMandiData] = useState(null);
  const [signalsData, setSignalsData] = useState(null);
  const [activeTab, setActiveTab] = useState('recommendation'); // 'recommendation' | 'mandis'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPriceIntelligence = async () => {
    setLoading(true);
    setError('');
    try {
      const [recRes, mandisRes, sigRes] = await Promise.allSettled([
        API.get('/price-intelligence/recommendation', {
          params: { commodity, mandi, horizonDays: horizon },
        }),
        API.get('/price-intelligence/best-mandi', {
          params: { commodity, localMandi: mandi, horizonDays: horizon },
        }),
        API.get('/price-intelligence/signals', {
          params: { commodity, mandi },
        }),
      ]);

      if (recRes.status === 'fulfilled' && recRes.value.data.success) {
        setRecommendationData(recRes.value.data.data);
      } else {
        setError('Price recommendation data is currently unavailable.');
      }

      if (mandisRes.status === 'fulfilled' && mandisRes.value.data.success) {
        setBestMandiData(mandisRes.value.data.data);
      }

      if (sigRes.status === 'fulfilled' && sigRes.value.data.success) {
        setSignalsData(sigRes.value.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to price intelligence engine.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceIntelligence();
  }, [commodity, mandi, horizon]);

  const getActionBadge = (action) => {
    switch (action) {
      case 'SELL_NOW':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-300',
          text: 'text-emerald-900',
          pill: 'bg-emerald-700 text-white',
          icon: <TrendingUp className="w-5 h-5 text-emerald-700" />,
        };
      case 'CONSIDER_SELLING':
        return {
          bg: 'bg-teal-50',
          border: 'border-teal-300',
          text: 'text-teal-900',
          pill: 'bg-teal-700 text-white',
          icon: <TrendingUp className="w-5 h-5 text-teal-700" />,
        };
      case 'HOLD':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          text: 'text-amber-900',
          pill: 'bg-amber-600 text-white',
          icon: <Clock className="w-5 h-5 text-amber-700" />,
        };
      case 'STRONG_HOLD':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-300',
          text: 'text-rose-900',
          pill: 'bg-rose-600 text-white',
          icon: <AlertTriangle className="w-5 h-5 text-rose-700" />,
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-900',
          pill: 'bg-slate-700 text-white',
          icon: <Scale className="w-5 h-5 text-slate-700" />,
        };
    }
  };

  const actionStyle = recommendationData ? getActionBadge(recommendationData.recommendation?.action) : null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-7">
      {/* 1. Header (Matching User Mock Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-2xs flex-shrink-0">
            <IndianRupee className="w-6 h-6 text-amber-800" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Price Recommendation
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Get an AI-backed price range to help you decide when and at what price to sell.
            </p>
          </div>
        </div>

        <div className="self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Active Tool
          </span>
        </div>
      </div>

      {/* 2. Form Inputs */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Produce Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-700" />
              Select Your Produce
            </label>
            <div className="relative">
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                className="w-full bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer appearance-none"
              >
                {COMMODITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Benchmark Mandi Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              Benchmark Mandi
            </label>
            <div className="relative">
              <select
                value={mandi}
                onChange={(e) => setMandi(e.target.value)}
                className="w-full bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer appearance-none"
              >
                {MANDI_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Button (Full-width Deep Green) */}
        <button
          type="button"
          onClick={fetchPriceIntelligence}
          disabled={loading}
          className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Price Signals...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Get Price Recommendation</span>
            </>
          )}
        </button>
      </div>

      {/* 3. "How It Works?" Guide Banner */}
      <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-sm">
          <TrendingUp className="w-4 h-4 text-emerald-700" />
          <span>How It Works?</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-900">Select produce & mandi</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Choose crop and your nearest reference market
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-900">Analyze price momentum</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                We combine price spreads, arrivals & volatility
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-900">Get price band & timing</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Receive target rate recommendation and selling alert
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Results Section */}
      {!loading && recommendationData && (
        <div className="space-y-6 pt-2 border-t border-slate-100">
          {/* Main Recommendation Highlight Box */}
          <div className={`p-6 sm:p-7 rounded-3xl border ${actionStyle?.border} ${actionStyle?.bg} space-y-5 shadow-2xs`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-2xl shadow-2xs">
                  {actionStyle?.icon}
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    AI Selling Action Recommendation
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">
                    {recommendationData.recommendation?.actionLabel}
                  </h3>
                </div>
              </div>

              <span className={`px-3.5 py-1.5 rounded-full text-xs font-black self-start sm:self-auto ${actionStyle?.pill}`}>
                {recommendationData.recommendation?.action?.replace('_', ' ')}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {recommendationData.recommendation?.reasoning}
            </p>

            {/* Price Range Target & Confidence */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Target Price Range
                </span>
                <p className="text-xl font-black text-slate-900">
                  ₹{recommendationData.recommendation?.targetPriceMin} - ₹{recommendationData.recommendation?.targetPriceMax}
                  <span className="text-xs font-normal text-slate-500"> / kg</span>
                </p>
                <span className="text-[10px] text-slate-400 block">
                  ₹{recommendationData.recommendation?.targetPriceMin * 100} - ₹{recommendationData.recommendation?.targetPriceMax * 100} / q
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Spot Benchmark
                </span>
                <p className="text-xl font-black text-emerald-700">
                  ₹{recommendationData.signals?.currentPricePerKg}
                  <span className="text-xs font-normal text-slate-500"> / kg</span>
                </p>
                <span className="text-[10px] text-emerald-700 font-bold block">
                  {mandi} APMC Modal Rate
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  AI Confidence Level
                </span>
                <p className="text-xl font-black text-slate-900">
                  {recommendationData.recommendation?.confidence || 'High'}
                </p>
                <span className="text-[10px] text-slate-400 block">
                  Multi-signal statistical validation
                </span>
              </div>
            </div>
          </div>

          {/* 3 Core Signal Indicator Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Arrival Pressure
              </span>
              <p className="text-sm font-black text-slate-900">
                {recommendationData.signals?.arrivalPressureLabel || 'Normal Supply'}
              </p>
              <p className="text-[11px] text-slate-500">
                Mandi intake volume is manageable.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Price Trend Momentum
              </span>
              <p className="text-sm font-black text-emerald-700">
                {recommendationData.signals?.priceTrendLabel || 'Favorable Trend'}
              </p>
              <p className="text-[11px] text-slate-500">
                Spot prices are firm across regional mandis.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Market Volatility
              </span>
              <p className="text-sm font-black text-slate-900">
                {recommendationData.signals?.volatilityLevel || 'Moderate'}
              </p>
              <p className="text-[11px] text-slate-500">
                Expected daily variance within normal limits.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceIntelligenceCard;
