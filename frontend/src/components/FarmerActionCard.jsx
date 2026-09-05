import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  Sparkles,
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
  DollarSign,
  Truck,
  HelpCircle,
  Calendar,
  Zap,
  Compass,
} from 'lucide-react';

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
const UNIT_OPTIONS = [
  { label: 'Quintals (100 kg)', value: 'quintals' },
  { label: 'Tonnes (1,000 kg)', value: 'tonnes' },
  { label: 'Kilograms (kg)', value: 'kg' },
];

const FarmerActionCard = ({ defaultCommodity = 'Wheat', defaultMandi = 'Karnal' }) => {
  const [commodity, setCommodity] = useState(defaultCommodity);
  const [mandi, setMandi] = useState(defaultMandi);
  const [quantity, setQuantity] = useState(50);
  const [unit, setUnit] = useState('quintals');
  const [expectedDate, setExpectedDate] = useState('');

  const [activeTab, setActiveTab] = useState('decision'); // 'decision' | 'all-crops' | 'mandi-options'
  const [actionData, setActionData] = useState(null);
  const [mandiOptionsData, setMandiOptionsData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchActionIntelligence = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Personalized Recommendation
      const actionRes = await API.get('/farmer-action/recommendation', {
        params: {
          commodity,
          mandi,
          quantity: Number(quantity) || 10,
          unit,
          expectedSellingDate: expectedDate || undefined,
        },
      });

      if (actionRes.data.success) {
        setActionData(actionRes.data);
      }

      // 2. Fetch Multi-Mandi Options
      const mandiRes = await API.get('/farmer-action/mandi-options', {
        params: { commodity },
      });
      if (mandiRes.data.success) {
        setMandiOptionsData(mandiRes.data);
      }

      // 3. Fetch Multi-Commodity Summary
      const sumRes = await API.get('/farmer-action/summary', {
        params: { mandi },
      });
      if (sumRes.data.success) {
        setSummaryData(sumRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load Farmer Action Intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActionIntelligence();
  }, [commodity, mandi, quantity, unit, expectedDate]);

  // Color & Icon Helpers for Decisions
  const getDecisionTheme = (action) => {
    switch (action) {
      case 'SELL_NOW':
        return {
          bgGradient: 'from-amber-600 via-orange-600 to-amber-700',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          borderColor: 'border-amber-200',
          accentColor: 'text-amber-600',
          lightBg: 'bg-amber-50',
          icon: <AlertTriangle className="w-6 h-6 text-amber-100 animate-pulse" />,
          title: 'Sell Produce Now',
          subtitle: 'Spot prices are elevated above baseline or facing near-term supply surges.',
        };
      case 'CONSIDER_SELLING':
        return {
          bgGradient: 'from-amber-700 via-yellow-600 to-amber-800',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          borderColor: 'border-amber-200',
          accentColor: 'text-amber-700',
          lightBg: 'bg-amber-50',
          icon: <Clock className="w-6 h-6 text-amber-100" />,
          title: 'Consider Staggered Selling',
          subtitle: 'Mild downward pressure observed. Consider offloading partial lots.',
        };
      case 'WAIT':
        return {
          bgGradient: 'from-blue-600 via-indigo-600 to-blue-800',
          badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
          borderColor: 'border-blue-200',
          accentColor: 'text-blue-600',
          lightBg: 'bg-blue-50',
          icon: <TrendingUp className="w-6 h-6 text-blue-100 animate-bounce" />,
          title: 'Hold Produce (Wait for Upside)',
          subtitle: 'Strong upward price momentum and tightening regional arrivals favor holding.',
        };
      case 'CONSIDER_WAITING':
        return {
          bgGradient: 'from-cyan-600 via-teal-600 to-blue-700',
          badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300',
          borderColor: 'border-cyan-200',
          accentColor: 'text-cyan-700',
          lightBg: 'bg-cyan-50',
          icon: <Clock className="w-6 h-6 text-cyan-100" />,
          title: 'Consider Staggered Holding',
          subtitle: 'Mild positive signals detected. Consider holding if storage loss risk is minimal.',
        };
      case 'COMPARE_MANDIS':
        return {
          bgGradient: 'from-purple-600 via-indigo-700 to-purple-800',
          badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
          borderColor: 'border-purple-200',
          accentColor: 'text-purple-600',
          lightBg: 'bg-purple-50',
          icon: <Scale className="w-6 h-6 text-purple-100" />,
          title: 'Compare Regional Mandis',
          subtitle: 'Significant price premium detected in nearby terminal APMC markets.',
        };
      case 'INSUFFICIENT_DATA':
        return {
          bgGradient: 'from-slate-600 via-gray-700 to-slate-800',
          badgeBg: 'bg-slate-100 text-slate-900 border-slate-300',
          borderColor: 'border-slate-200',
          accentColor: 'text-slate-600',
          lightBg: 'bg-slate-50',
          icon: <HelpCircle className="w-6 h-6 text-slate-100" />,
          title: 'Insufficient Market Data',
          subtitle: 'Fewer than 3 historical daily observations available for this commodity/market.',
        };
      default:
        return {
          bgGradient: 'from-emerald-700 via-teal-700 to-slate-800',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          borderColor: 'border-emerald-200',
          accentColor: 'text-emerald-700',
          lightBg: 'bg-emerald-50',
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-100" />,
          title: 'Market in Equilibrium',
          subtitle: 'Stable baseline market conditions. Routine marketing recommended.',
        };
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'HIGH':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          label: 'High Market Risk',
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          label: 'Moderate Risk',
        };
      default:
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          label: 'Low Market Risk',
        };
    }
  };

  const theme = getDecisionTheme(actionData?.action);
  const riskBadge = getRiskBadge(actionData?.riskLevel);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-agri-sm overflow-hidden space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Phase 4: Farmer Action Intelligence & Decision Support
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            Personalized Crop Selling Advisor 🌾
          </h2>
          <p className="text-xs text-slate-300">
            Real data-driven decision recommendations synthesized from spot prices, arrival pressures, and multi-mandi spreads
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl backdrop-blur-sm self-start md:self-auto">
          <button
            onClick={() => setActiveTab('decision')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'decision'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            My Crop Action
          </button>
          <button
            onClick={() => setActiveTab('mandi-options')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'mandi-options'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Mandi Arbitrage
          </button>
          <button
            onClick={() => setActiveTab('all-crops')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'all-crops'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Regional Matrix
          </button>
        </div>
      </div>

      {/* 2. Interactive Farmer Inputs */}
      <div className="px-6 pt-2">
        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Select Commodity / Crop
            </label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {COMMODITY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Your Mandi / Location
            </label>
            <select
              value={mandi}
              onChange={(e) => setMandi(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {MANDI_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Harvest / Lot Quantity
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 50"
              className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Quantity Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={fetchActionIntelligence}
              disabled={loading}
              className="w-full py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Update Advisor
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">
            Evaluating market signals, arrival volumes, and price arbitrage for {quantity} {unit} of {commodity}...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mx-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Area */}
      {!loading && !error && actionData && (
        <div className="px-6 pb-6 space-y-6">
          {/* TAB 1: Main Decision View */}
          {activeTab === 'decision' && (
            <div className="space-y-6">
              {/* Hero Action Recommendation Card */}
              <div
                className={`p-6 rounded-3xl bg-gradient-to-r ${theme.bgGradient} text-white shadow-agri-md relative overflow-hidden`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-sm flex items-center gap-1.5">
                        {theme.icon}
                        RECOMMENDED ACTION: {actionData.action.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${riskBadge.bg}`}
                      >
                        {riskBadge.label}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-white">{theme.title}</h3>
                    <p className="text-xs text-slate-100 max-w-xl font-medium leading-relaxed">
                      {actionData.decisionSummary || theme.subtitle}
                    </p>
                  </div>

                  {/* Signal Strength & Value Callout */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                    <div className="space-y-1 text-center sm:text-left pr-4 sm:border-r border-white/20">
                      <span className="text-[10px] font-bold text-slate-300 block uppercase tracking-wider">
                        Estimated Gross Realization
                      </span>
                      <span className="text-2xl font-black text-amber-300">
                        {actionData.estimatedGrossValueFormatted}
                      </span>
                      <span className="text-[10px] text-slate-200 block">
                        (@ ₹{actionData.currentPrice}/q for {actionData.quantity} {actionData.unit})
                      </span>
                    </div>

                    <div className="space-y-1 min-w-[120px]">
                      <div className="flex justify-between text-[10px] font-bold text-slate-200">
                        <span>Signal Strength</span>
                        <span>{actionData.signalStrength}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-300 h-full rounded-full transition-all duration-500"
                          style={{ width: `${actionData.signalStrength}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-300 block text-right">
                        {actionData.signalStrengthLabel.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Metric Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Spot Price & Benchmark */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold">Current Spot Price</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-slate-900">
                      ₹{actionData.currentPrice}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">/ Quintal</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    30-Day Benchmark Avg: <b>₹{actionData.historicalAverage30d}/q</b>
                    <span
                      className={`ml-1 font-bold ${
                        actionData.priceDeviationFrom30dPercent >= 0
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      ({actionData.priceDeviationFrom30dPercent >= 0 ? '+' : ''}
                      {actionData.priceDeviationFrom30dPercent}%)
                    </span>
                  </div>
                </div>

                {/* Regional Supply Pressure */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold">Supply & Arrival Pressure</span>
                    <Activity className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {actionData.arrivalPressureLabel}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Arrival Velocity: <b>{actionData.arrivalChangePercent}%</b> vs 30d baseline
                  </div>
                </div>

                {/* Price Volatility */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold">Price Volatility & CV</span>
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {actionData.volatilityLevel} Volatility
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Coeff. of Variation: <b>{actionData.volatilityCoeffPercent}%</b>
                  </div>
                </div>
              </div>

              {/* Best Alternative Mandi Arbitrage Callout */}
              {actionData.bestMandi && actionData.bestMandi.isAlternativeToCurrent && (
                <div className="p-5 rounded-2xl bg-purple-50/80 border border-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-black uppercase">
                      <Scale className="w-3 h-3 text-purple-700" /> Multi-Mandi Price Difference
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Higher realization available at {actionData.bestMandi.market} ({actionData.bestMandi.district})
                    </h4>
                    <p className="text-xs text-slate-600">
                      Trading at <b>₹{actionData.bestMandi.modalPricePerQuintal}/q</b> (+₹{actionData.bestMandi.priceDifferencePerQuintal}/q or +{actionData.bestMandi.priceDifferencePercent}% premium).
                    </p>
                    <p className="text-[10px] text-purple-800 font-medium italic">
                      {actionData.bestMandi.note}
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-purple-200 text-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 block">
                      Potential Gross Realization Delta
                    </span>
                    <span className="text-lg font-black text-purple-700">
                      +₹{actionData.bestMandi.potentialGrossDifference.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      for {actionData.quantity} {actionData.unit}
                    </span>
                  </div>
                </div>
              )}

              {/* Data-Driven Decision Drivers & Reasons */}
              <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Info className="w-4 h-4 text-emerald-600" /> Why This Action? — Explainable Market Drivers
                </h4>

                <div className="space-y-2.5">
                  {actionData.reasons?.map((reason, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700 font-medium">{reason}</span>
                    </div>
                  ))}
                </div>

                {actionData.alternativeAction && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5">
                    <Compass className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-amber-900 block">
                        Alternative Strategy Recommendation:
                      </span>
                      <span className="text-xs text-amber-800">
                        {actionData.alternativeAction}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Decision Window & Action Timeline */}
              <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Calendar className="w-4 h-4 text-agri-primary" /> Decision Window & Action Horizon Timeline
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {actionData.timeline?.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{step.period}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {step.signal}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{step.expectedStatus}</p>
                      {step.estimatedGrossValue && (
                        <div className="text-xs font-black text-slate-900 pt-1 border-t border-slate-200">
                          Spot Value: ₹{step.estimatedGrossValue.toLocaleString()}
                        </div>
                      )}
                      {step.projectedTrendPercent !== undefined && (
                        <div className="text-xs font-bold text-slate-700 pt-1 border-t border-slate-200">
                          Projected Shift: {step.projectedTrendPercent >= 0 ? '+' : ''}
                          {step.projectedTrendPercent}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Mandi Options & Arbitrage Table */}
          {activeTab === 'mandi-options' && mandiOptionsData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" /> Regional Mandi Ranking for {mandiOptionsData.commodity}
                </h4>
                <span className="text-xs text-slate-500 font-bold">
                  {mandiOptionsData.totalMandis} Mandis Compared
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="pb-3">Mandi / Market</th>
                      <th className="pb-3">District, State</th>
                      <th className="pb-3">Modal Price (₹/q)</th>
                      <th className="pb-3">Price / kg</th>
                      <th className="pb-3">Arrivals (T)</th>
                      <th className="pb-3">Supply Pressure</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mandiOptionsData.options?.map((opt, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50 font-medium ${
                          opt.isTopPick ? 'bg-purple-50/50' : ''
                        }`}
                      >
                        <td className="py-3 font-extrabold text-slate-900 flex items-center gap-1.5">
                          {opt.market}
                          {opt.isTopPick && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800">
                              Top Pick
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-slate-600">
                          {opt.district}, {opt.state}
                        </td>
                        <td className="py-3 font-black text-slate-900">
                          ₹{opt.modalPricePerQuintal}
                        </td>
                        <td className="py-3 text-slate-700">₹{opt.pricePerKg}</td>
                        <td className="py-3 text-slate-600">{opt.currentArrivalTonnes}T</td>
                        <td className="py-3 text-slate-600">{opt.supplyPressure}</td>
                        <td className="py-3 text-right">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              opt.recommendation === 'TOP_PRICE_MANDI'
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {opt.recommendation.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 font-medium">
                💡 <b>Note on Mandi Comparison:</b> Price differences reflect wholesale APMC auction transactions. Logistics and local transit expenses vary by individual farm location.
              </div>
            </div>
          )}

          {/* TAB 3: Multi-Commodity Regional Action Matrix */}
          {activeTab === 'all-crops' && summaryData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" /> Regional Crop Action Matrix ({summaryData.mandi})
                </h4>
                <span className="text-xs text-slate-500 font-bold">
                  {summaryData.totalCropsSummarized} Commodities Analyzed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {summaryData.commoditySummaries?.map((cropSummary, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900">
                        {cropSummary.commodity}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          cropSummary.action === 'WAIT'
                            ? 'bg-blue-100 text-blue-800'
                            : cropSummary.action === 'CONSIDER_WAITING'
                            ? 'bg-cyan-100 text-cyan-800'
                            : cropSummary.action === 'SELL_NOW'
                            ? 'bg-amber-100 text-amber-800'
                            : cropSummary.action === 'CONSIDER_SELLING'
                            ? 'bg-orange-100 text-orange-800'
                            : cropSummary.action === 'COMPARE_MANDIS'
                            ? 'bg-purple-100 text-purple-800'
                            : cropSummary.action === 'INSUFFICIENT_DATA'
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {cropSummary.action.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-500 font-medium">Current Spot Price:</span>
                      <span className="font-black text-slate-900">
                        ₹{cropSummary.currentPrice}/q
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {cropSummary.decisionSummary}
                    </p>

                    <button
                      onClick={() => {
                        setCommodity(cropSummary.commodity);
                        setActiveTab('decision');
                      }}
                      className="w-full py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-all flex items-center justify-center gap-1"
                    >
                      Inspect Detailed Action <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Non-Financial Guarantee Regulatory Disclaimer & Provenance Footer */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-slate-700">
                Decision Support Provenance & Regulatory Notice:
              </p>
              <p className="leading-relaxed">
                {actionData.disclaimer} Calculations are derived from {actionData.historicalRecordsUsed} historical daily market observations via {actionData.dataSource}. Estimated realizations are gross values based on prevailing mandi auction prices and do not constitute guaranteed financial or contract pricing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerActionCard;
