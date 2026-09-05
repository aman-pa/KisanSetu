import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  MapPin,
  RefreshCw,
  Building2,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  BarChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const COMMODITY_OPTIONS = ['Tomato', 'Potato', 'Onion', 'Wheat', 'Rice', 'Apple'];
const MANDI_OPTIONS = [
  { label: 'All Regional Mandis', value: '' },
  { label: 'Karnal Mandi (Haryana)', value: 'Karnal Mandi' },
  { label: 'Azadpur APMC (Delhi)', value: 'Azadpur APMC Mandi' },
  { label: 'Ghazipur Mandi (Delhi)', value: 'Ghazipur Mandi' },
  { label: 'Agra Mandi (Uttar Pradesh)', value: 'Agra Mandi' },
  { label: 'Lasalgaon Mandi (Nashik)', value: 'Lasalgaon Mandi' },
  { label: 'Jalandhar Cantt Mandi (Punjab)', value: 'Jalandhar Cantt Mandi' },
  { label: 'Ambala City Mandi (Haryana)', value: 'Ambala City Mandi' },
  { label: 'Panipat Mandi (Haryana)', value: 'Panipat Mandi' },
];

const LIMIT_OPTIONS = [
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 15 Days', value: 15 },
  { label: 'Last 30 Days', value: 30 },
  { label: 'Last 60 Days', value: 60 },
];

const MarketDataCard = ({ defaultCommodity = 'Tomato', defaultMarket = '' }) => {
  const [commodity, setCommodity] = useState(defaultCommodity);
  const [market, setMarket] = useState(defaultMarket);
  const [limitDays, setLimitDays] = useState(30);

  const [activeTab, setActiveTab] = useState('snapshots'); // 'snapshots' | 'prices' | 'arrivals' | 'supply' | 'provider'
  const [snapshotsData, setSnapshotsData] = useState([]);
  const [pricesData, setPricesData] = useState({ records: [], statistics: {} });
  const [arrivalsData, setArrivalsData] = useState({ arrivals: [], statistics: {} });
  const [supplyData, setSupplyData] = useState([]);
  const [providerStatus, setProviderStatus] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMarketData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Current Snapshots
      const currentRes = await API.get('/market-data/prices/current', {
        params: { commodity, market: market || undefined },
      });
      if (currentRes.data.success) {
        setSnapshotsData(currentRes.data.snapshots || []);
      }

      // 2. Fetch Historical Prices
      const pricesRes = await API.get('/market-data/prices', {
        params: {
          commodity,
          market: market || undefined,
          limit: limitDays,
        },
      });
      if (pricesRes.data.success) {
        setPricesData({
          records: pricesRes.data.records || [],
          statistics: pricesRes.data.statistics || {},
        });
      }

      // 3. Fetch Mandi Arrivals
      const arrivalsRes = await API.get('/market-data/arrivals', {
        params: {
          commodity,
          market: market || undefined,
          limit: limitDays,
        },
      });
      if (arrivalsRes.data.success) {
        setArrivalsData({
          arrivals: arrivalsRes.data.arrivals || [],
          statistics: arrivalsRes.data.statistics || {},
        });
      }

      // 4. Fetch Regional Supply Indicators
      const supplyRes = await API.get('/market-data/supply', {
        params: { commodity },
      });
      if (supplyRes.data.success) {
        setSupplyData(supplyRes.data.indicators || []);
      }

      // 5. Fetch Provider Status Diagnostics
      const statusRes = await API.get('/market-data/providers/status');
      if (statusRes.data.success) {
        setProviderStatus(statusRes.data.providerStatus);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch market data from Agricultural Data Layer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [commodity, market, limitDays]);

  // Format price chart time series (sorted chronologically)
  const priceChartData = [...(pricesData.records || [])]
    .sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate))
    .map((r) => ({
      date: new Date(r.arrivalDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      modalPrice: r.modalPrice,
      minPrice: r.minPrice,
      maxPrice: r.maxPrice,
      modalPricePerKg: r.modalPricePerKg,
      market: r.market,
    }));

  // Format arrival chart time series
  const arrivalChartData = [...(arrivalsData.arrivals || [])]
    .sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate))
    .map((a) => ({
      date: new Date(a.arrivalDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      arrivalTonnes: a.arrivalQuantity,
      market: a.market,
    }));

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-agri-sm overflow-hidden space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            Phase 1: Agricultural Market Data Layer
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            Agricultural Market Intelligence & Spot Mandi Data 🌾
          </h2>
          <p className="text-xs text-slate-300">
            Ground-truth daily mandi modal prices, arrival volumes, and regional supply indicators from verified APMCs
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl backdrop-blur-sm self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('snapshots')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === 'snapshots' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Mandi Snapshots
          </button>
          <button
            onClick={() => setActiveTab('prices')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === 'prices' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Price Trends
          </button>
          <button
            onClick={() => setActiveTab('arrivals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === 'arrivals' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Arrival Volumes
          </button>
          <button
            onClick={() => setActiveTab('supply')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === 'supply' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Supply Indicators
          </button>
          <button
            onClick={() => setActiveTab('provider')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === 'provider' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Provider Status
          </button>
        </div>
      </div>

      {/* 2. Interactive Filters */}
      <div className="px-6 pt-2">
        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Select Commodity / Crop</label>
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
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Mandi / Terminal Market Filter</label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {MANDI_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Historical Time Horizon</label>
            <select
              value={limitDays}
              onChange={(e) => setLimitDays(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {LIMIT_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={fetchMarketData}
              disabled={loading}
              className="w-full py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Market Layer
            </button>
          </div>
        </div>
      </div>

      {/* 3. Explicit 3-Tier Data Provenance Badge */}
      <div className="mx-6 p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-2 text-emerald-900 font-extrabold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Multi-Tier Data Provenance Layer:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
            🟢 1. Observed Market Data (Spot & Arrivals)
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
            🟡 2. Derived Indicators (7d/30d Volatility & Supply)
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-300">
            🟣 3. AI Forecast & Absorption Proxies
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">
            Fetching APMC spot prices, arrival records, and regional supply indicators for {commodity}...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mx-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content Area */}
      {!loading && !error && (
        <div className="px-6 pb-6 space-y-6">
          {/* TAB 1: Mandi Snapshots */}
          {activeTab === 'snapshots' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" /> Current Mandi Price Snapshots ({commodity})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Latest observed modal, minimum, and maximum prices with 7-day price momentum across regional APMCs
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">{snapshotsData.length} Mandis Reporting</span>
              </div>

              {snapshotsData.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  No active mandi snapshots found for the selected crop/market filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {snapshotsData.map((snap, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-snug">{snap.market}</h4>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {snap.district}, {snap.state}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                            snap.trend === 'RISING'
                              ? 'bg-emerald-100 text-emerald-800'
                              : snap.trend === 'FALLING'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {snap.trend === 'RISING' && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                          {snap.trend === 'FALLING' && <TrendingDown className="w-3 h-3 text-rose-600" />}
                          {snap.trend}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Modal Price</span>
                          <span className="text-xl font-black text-slate-900">₹{snap.currentModalPrice}</span>
                          <span className="text-[10px] text-slate-500 font-medium"> / Quintal</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Per Kg Rate</span>
                          <span className="text-sm font-black text-emerald-700">₹{snap.currentModalPricePerKg}/kg</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Min - Max Range</span>
                          <span className="font-bold text-slate-700">
                            ₹{snap.minPrice} – ₹{snap.maxPrice}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px]">7-Day Velocity</span>
                          <span
                            className={`font-extrabold ${
                              snap.changePercent >= 0 ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {snap.changePercent >= 0 ? '+' : ''}
                            {snap.changePercent}% ({snap.change7d >= 0 ? '+' : ''}₹{snap.change7d}/q)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Source: <b>{snap.source}</b></span>
                        <span>{new Date(snap.arrivalDate).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Historical Price Trends */}
          {activeTab === 'prices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" /> Historical Price Spread & Trend Analysis ({commodity})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Daily modal prices alongside minimum and maximum trading bands over the selected observation window
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">{pricesData.records.length} Observations</span>
              </div>

              {/* 3 Metric Summary Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Average Modal Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      ₹{pricesData.statistics?.avgModalPrice || 0}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">/ Quintal</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold">
                    ₹{pricesData.statistics?.avgModalPricePerKg || 0}/kg average
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Observed Price Range</span>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{pricesData.statistics?.minObservedPrice || 0} – ₹{pricesData.statistics?.maxObservedPrice || 0}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Spread: ₹{(pricesData.statistics?.maxObservedPrice || 0) - (pricesData.statistics?.minObservedPrice || 0)}/q
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Recorded Data Range</span>
                  <span className="text-base font-black text-slate-800">
                    {pricesData.statistics?.earliestDate
                      ? `${new Date(pricesData.statistics.earliestDate).toLocaleDateString('en-IN')} to ${new Date(pricesData.statistics.latestDate).toLocaleDateString('en-IN')}`
                      : 'N/A'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Total records: {pricesData.statistics?.totalRecords || 0}
                  </span>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={priceChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="priceSpreadColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} domain={['auto', 'auto']} unit="₹" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '12px',
                          color: '#0f172a',
                          fontSize: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Area
                        type="monotone"
                        dataKey="maxPrice"
                        stroke="#059669"
                        fill="url(#priceSpreadColor)"
                        name="Max Price Band (₹/q)"
                      />
                      <Line
                        type="monotone"
                        dataKey="modalPrice"
                        stroke="#047857"
                        strokeWidth={3}
                        dot={{ r: 3, fill: '#047857' }}
                        name="Modal Auction Price (₹/q)"
                      />
                      <Line
                        type="monotone"
                        dataKey="minPrice"
                        stroke="#9CA3AF"
                        strokeDasharray="4 4"
                        name="Min Price Band (₹/q)"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Mandi Arrival Volumes */}
          {activeTab === 'arrivals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" /> Physical Mandi Arrival Volumes ({commodity})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Daily physical produce intake arriving at regional mandis measured in metric tonnes
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">{arrivalsData.arrivals.length} Records</span>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Total Recorded Arrivals</span>
                  <span className="text-2xl font-black text-slate-900">
                    {arrivalsData.statistics?.totalArrivalTonnes?.toLocaleString() || 0} Tonnes
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Cumulative physical intake across tracked markets
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Average Daily Volume</span>
                  <span className="text-2xl font-black text-emerald-700">
                    {arrivalsData.statistics?.avgDailyArrivalTonnes || 0} Tonnes / Day
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Regional daily absorption baseline
                  </span>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={arrivalChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} unit=" T" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '12px',
                          color: '#0f172a',
                          fontSize: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Bar
                        dataKey="arrivalTonnes"
                        fill="#10B981"
                        radius={[6, 6, 0, 0]}
                        name="Daily Physical Arrivals (Tonnes)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Regional Supply Indicators */}
          {activeTab === 'supply' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" /> Regional Supply & Absorption Indicators ({commodity})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    District-level weekly arrival velocity compared against 30-day baseline to detect supply deficits or gluts
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">{supplyData.length} Districts Tracked</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {supplyData.map((ind, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{ind.district}</h4>
                        <span className="text-[11px] text-slate-500 font-medium">{ind.state}</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          ind.supplyStatus === 'SURPLUS'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : ind.supplyStatus === 'DEFICIT'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {ind.supplyStatus}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Supply Index Score:</span>
                        <span className="font-black text-slate-900">{ind.supplyIndexScore} / 100</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            ind.supplyIndexScore > 65
                              ? 'bg-amber-500'
                              : ind.supplyIndexScore < 40
                              ? 'bg-rose-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${ind.supplyIndexScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Weekly Arrival Volume:</span>
                        <span className="font-bold text-slate-800">{ind.weeklyArrivalTonnes} T</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Baseline Weekly Volume:</span>
                        <span className="font-bold text-slate-800">{ind.baselineWeeklyTonnes} T</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-100">
                        <span className="text-slate-500 font-bold">Arrival Ratio:</span>
                        <span
                          className={`font-black ${
                            ind.ratioToBaseline >= 1.15
                              ? 'text-amber-700'
                              : ind.ratioToBaseline <= 0.85
                              ? 'text-rose-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {Math.round(ind.ratioToBaseline * 100)}% of Baseline
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      Active Markets: <b>{ind.markets?.join(', ') || 'APMC Terminal'}</b>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Provider Status Diagnostics */}
          {activeTab === 'provider' && providerStatus && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Data Provider Health & Diagnostics
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Live telemetry and failover status for Agmarknet and Seeded agricultural data providers
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  STATUS: {providerStatus.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <span className="text-xs font-black text-slate-900 block">Active Data Provider</span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Provider Name:</span>
                      <span className="font-bold text-slate-800">{providerStatus.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Source Classification:</span>
                      <span className="font-bold text-emerald-700">{providerStatus.sourceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Live External Stream:</span>
                      <span className="font-bold text-slate-700">{providerStatus.isLive ? 'Active' : 'Standby / Seeded'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Operational Details:</span>
                      <span className="font-bold text-slate-700">{providerStatus.details}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <span className="text-xs font-black text-slate-900 block">Architectural Integrity Guarantee</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    KisanSetu enforces strict abstraction between physical market records, derived econometric proxies, and AI forecasting models. All downstream decision modules consume data through the unified <code>MarketDataProvider</code> interface.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketDataCard;
