import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
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
      // 1. Fetch Selling Recommendation
      const recRes = await API.get('/price-intelligence/recommendation', {
        params: { commodity, mandi, days: horizon },
      });

      // 2. Fetch Best Mandi Comparison
      const mandiRes = await API.get('/price-intelligence/best-mandi', {
        params: { commodity },
      });

      // 3. Fetch Historical Signals for Charting
      const signalsRes = await API.get('/price-intelligence/signals', {
        params: { commodity, mandi },
      });

      if (recRes.data.success) {
        setRecommendationData(recRes.data);
      }
      if (mandiRes.data.success) {
        setBestMandiData(mandiRes.data);
      }
      if (signalsRes.data.success) {
        setSignalsData(signalsRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load price intelligence data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceIntelligence();
  }, [commodity, mandi, horizon]);

  // Chart Data Preparation
  const chartData = React.useMemo(() => {
    if (!signalsData?.historicalSeries) return [];

    return signalsData.historicalSeries.map((h) => ({
      date: h.date.slice(5),
      fullDate: h.date,
      modalPrice: h.modalPrice,
      minPrice: h.minPrice,
      maxPrice: h.maxPrice,
      arrivals: h.arrivalQuantity,
    }));
  }, [signalsData]);

  // Recommendation Badge Styling
  const getBadgeTheme = (rec) => {
    switch (rec) {
      case 'WAIT':
      case 'CONSIDER WAITING':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          pill: 'bg-blue-600 text-white',
          icon: <Clock className="w-5 h-5 text-blue-600" />,
        };
      case 'SELL NOW':
      case 'CONSIDER SELLING':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-900',
          pill: 'bg-amber-600 text-white',
          icon: <DollarSign className="w-5 h-5 text-amber-600" />,
        };
      default:
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-900',
          pill: 'bg-emerald-600 text-white',
          icon: <Scale className="w-5 h-5 text-emerald-600" />,
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-50 text-amber-700">
              <DollarSign className="w-5 h-5" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              Price Intelligence & Farmer Selling Recommendation
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-amber-100 text-amber-800 border border-amber-300">
              Phase 3 Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Multi-signal market decision support combining real prices, arrival momentum, volatility, and Phase 2 demand forecasts
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Commodity */}
          <select
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {COMMODITY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                🌾 {c}
              </option>
            ))}
          </select>

          {/* Mandi */}
          <select
            value={mandi}
            onChange={(e) => setMandi(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {MANDI_OPTIONS.map((m) => (
              <option key={m} value={m}>
                📍 {m}
              </option>
            ))}
          </select>

          {/* Horizon */}
          <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-200">
            {HORIZON_OPTIONS.map((h) => (
              <button
                key={h.value}
                onClick={() => setHorizon(h.value)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  horizon === h.value ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchPriceIntelligence}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            title="Refresh Price Intelligence"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <button
          onClick={() => setActiveTab('recommendation')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
            activeTab === 'recommendation'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          💡 Selling Recommendation & Signals
        </button>
        <button
          onClick={() => setActiveTab('mandis')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
            activeTab === 'mandis'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          🏢 Best Mandi Comparison ({bestMandiData?.totalMandisCompared || 0})
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
          <p className="text-xs font-bold text-slate-500">Analyzing price trends, arrival pressure & forecast signals...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : activeTab === 'recommendation' && recommendationData ? (
        <div className="space-y-6">
          {/* Recommendation Hero Box */}
          {(() => {
            const theme = getBadgeTheme(recommendationData.recommendation);
            return (
              <div className={`rounded-3xl p-6 border ${theme.border} ${theme.bg} space-y-4`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white shadow-sm border border-slate-100">
                      {theme.icon}
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        {commodity} • {recommendationData.market} ({recommendationData.evaluationHorizon})
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                          {recommendationData.recommendation}
                        </h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${theme.pill}`}>
                          {recommendationData.signalStrength} SIGNAL
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Composite Score Bar */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-end min-w-[200px]">
                    <div className="flex items-center justify-between w-full text-xs font-bold text-slate-600 mb-1">
                      <span>Price Intelligence Score</span>
                      <span className="font-black text-slate-900">{recommendationData.score > 0 ? `+${recommendationData.score}` : recommendationData.score} / 100</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-500 ${
                          recommendationData.score > 0 ? 'bg-blue-600' : recommendationData.score < 0 ? 'bg-amber-600' : 'bg-slate-400'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(10, Math.abs(recommendationData.score)))}%`,
                          marginLeft: recommendationData.score < 0 ? 'auto' : '0',
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">
                      {recommendationData.score > 0 ? 'Upside Momentum Bias' : recommendationData.score < 0 ? 'Peak / Glut Liquidation Bias' : 'Market Equilibrium'}
                    </span>
                  </div>
                </div>

                {/* Summary text */}
                <p className="text-sm font-semibold text-slate-800 leading-relaxed bg-white/70 p-3.5 rounded-2xl border border-slate-100">
                  {recommendationData.summaryText}
                </p>

                {/* Data-driven Explanation Points */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-600" /> Explainable Decision Drivers (Why?):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {recommendationData.explanation?.map((exp, idx) => (
                      <div
                        key={idx}
                        className="bg-white/90 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-start gap-2 shadow-2xs"
                      >
                        <span className="text-emerald-600 font-bold mt-0.5">•</span>
                        <span>{exp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Signal KPI Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Current Modal Price */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-500">Current Modal Price</span>
              <p className="text-xl font-black text-slate-900">
                ₹{recommendationData.currentPrice?.toLocaleString()} <span className="text-xs font-normal text-slate-500">/Q</span>
              </p>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>₹{recommendationData.currentPricePerKg}/kg</span>
                <span>Range: ₹{recommendationData.priceRange?.min} - ₹{recommendationData.priceRange?.max}</span>
              </div>
            </div>

            {/* Price Trend vs 30d Baseline */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-500">Historical 30d Baseline</span>
              <p className="text-xl font-black text-slate-900">
                ₹{recommendationData.historicalAverage30d?.toLocaleString()} <span className="text-xs font-normal text-slate-500">/Q</span>
              </p>
              <div className="flex items-center gap-1 text-[10px] font-bold">
                {recommendationData.signalsSummary?.derived?.priceDeviationFrom30dPercent >= 0 ? (
                  <span className="text-emerald-700 flex items-center">
                    <ArrowUpRight className="w-3 h-3" /> +{recommendationData.signalsSummary?.derived?.priceDeviationFrom30dPercent}% vs 30d
                  </span>
                ) : (
                  <span className="text-amber-700 flex items-center">
                    <ArrowDownRight className="w-3 h-3" /> {recommendationData.signalsSummary?.derived?.priceDeviationFrom30dPercent}% vs 30d
                  </span>
                )}
                <span className="text-slate-400">• 7d: ₹{recommendationData.historicalAverage7d}</span>
              </div>
            </div>

            {/* Arrival / Supply Pressure */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-500">Supply Pressure Indicator</span>
              <p className="text-sm font-black text-slate-900 flex items-center gap-1.5 pt-1">
                {recommendationData.arrivalPressure?.status === 'SUPPLY_SHORTAGE' ? (
                  <span className="text-blue-700 font-extrabold">Tight Supply (Falling)</span>
                ) : recommendationData.arrivalPressure?.status === 'SUPPLY_GLUT' ? (
                  <span className="text-amber-700 font-extrabold">Glut Risk (Surging)</span>
                ) : (
                  <span className="text-emerald-700 font-extrabold">Normal Equilibrium</span>
                )}
              </p>
              <span className="text-[10px] font-bold text-slate-500">
                Arrivals: {recommendationData.arrivalPressure?.currentArrivalTonnes}T (Δ {recommendationData.arrivalPressure?.changePercent}%)
              </span>
            </div>

            {/* Volatility & Phase 2 Forecast Signal */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-500">Forecast Momentum Signal</span>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {recommendationData.forecastSignal?.growthPercent >= 0 ? '+' : ''}
                  {recommendationData.forecastSignal?.growthPercent}% Demand
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  Vol: {recommendationData.volatility?.level} (CV {recommendationData.volatility?.coeffVariationPercent}%)
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                Backtest Hit Rate: {recommendationData.validationBenchmark?.metrics?.directionalAccuracyPercent}%
              </span>
            </div>
          </div>

          {/* Historical Price Trend Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Historical Modal Price vs Rolling Trends (₹/Quintal)</span>
              <div className="flex items-center gap-4 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-amber-600"></span> Modal Price
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-slate-400"></span> 30d Baseline (₹{recommendationData.historicalAverage30d})
                </span>
              </div>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} domain={['auto', 'auto']} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 text-xs space-y-1">
                          <p className="font-extrabold text-slate-900">{d.fullDate}</p>
                          <p className="text-amber-700 font-extrabold">Modal Price: ₹{d.modalPrice}/Q</p>
                          <p className="text-slate-500 text-[10px]">Range: ₹{d.minPrice} - ₹{d.maxPrice}/Q</p>
                          <p className="text-slate-500 text-[10px]">Mandi Arrival: {d.arrivals} Tonnes</p>
                        </div>
                      );
                    }}
                  />
                  <Line type="monotone" dataKey="modalPrice" stroke="#D97706" strokeWidth={2.5} dot={{ r: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : activeTab === 'mandis' && bestMandiData ? (
        /* Best Mandi Comparison Table */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Ranked Mandis for {commodity} ({bestMandiData.totalMandisCompared} Markets Evaluated)</span>
            <span className="text-[11px] text-slate-500">Multi-Factor Score (Price + Momentum + Supply Risk)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Mandi & District</th>
                  <th className="py-3 px-4">Modal Price</th>
                  <th className="py-3 px-4">Premium vs Avg</th>
                  <th className="py-3 px-4">Arrivals</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Ranking Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bestMandiData.rankedMandis?.map((m) => (
                  <tr key={m.market} className={`hover:bg-slate-50/80 transition-colors ${m.isTopPick ? 'bg-amber-50/40 font-semibold' : ''}`}>
                    <td className="py-3 px-4">
                      {m.isTopPick ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white">
                          #1 TOP
                        </span>
                      ) : (
                        <span className="text-slate-500 font-bold">#{m.rank}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{m.market}</div>
                      <div className="text-[10px] text-slate-400">{m.district}, {m.state}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900">₹{m.modalPricePerQuintal?.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 block">₹{m.pricePerKg}/kg</span>
                    </td>
                    <td className="py-3 px-4">
                      {m.pricePremiumVsRegionalAvgPercent >= 0 ? (
                        <span className="text-emerald-700 font-bold flex items-center">
                          +{m.pricePremiumVsRegionalAvgPercent}%
                        </span>
                      ) : (
                        <span className="text-amber-700 font-bold flex items-center">
                          {m.pricePremiumVsRegionalAvgPercent}%
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-700">{m.currentArrivalTonnes} T</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                          m.recommendation === 'WAIT'
                            ? 'bg-blue-100 text-blue-900'
                            : m.recommendation === 'SELL NOW'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {m.recommendation}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs">
                      {m.rankingRationale}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Footer: Provenance & Non-Guarantee Disclaimer */}
      <div className="border-t border-slate-100 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold border border-slate-200">
            Source: {recommendationData?.dataProvenance || 'SEEDED_DEMO_AGMARKNET'}
          </span>
          <span>• Last updated: {new Date(recommendationData?.generatedAt || Date.now()).toLocaleTimeString()}</span>
        </div>
        <p className="max-w-xl text-slate-400 italic">
          Disclaimer: Market recommendations are algorithmic decision-support tools derived from historical mandi signals. Not a financial guarantee.
        </p>
      </div>
    </div>
  );
};

export default PriceIntelligenceCard;
