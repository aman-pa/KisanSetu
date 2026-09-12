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
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Droplets,
  Wind,
  Thermometer,
  Umbrella,
  Radio,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  BarChart,
  LineChart,
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

const WeatherIcon = ({ iconName, className = 'w-6 h-6' }) => {
  switch (iconName) {
    case 'Sun':
      return <Sun className={`${className} text-amber-500`} />;
    case 'CloudSun':
      return <CloudSun className={`${className} text-amber-400`} />;
    case 'Cloud':
      return <Cloud className={`${className} text-slate-400`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={`${className} text-blue-400`} />;
    case 'CloudRain':
      return <CloudRain className={`${className} text-blue-600`} />;
    case 'CloudLightning':
      return <CloudLightning className={`${className} text-purple-600`} />;
    case 'CloudFog':
      return <CloudFog className={`${className} text-slate-400`} />;
    default:
      return <Sun className={`${className} text-amber-500`} />;
  }
};

const MarketDataCard = ({ defaultCommodity = 'Tomato', defaultMarket = '' }) => {
  const [commodity, setCommodity] = useState(defaultCommodity);
  const [market, setMarket] = useState(defaultMarket);
  const [limitDays, setLimitDays] = useState(30);

  const [activeTab, setActiveTab] = useState('snapshots'); // 'snapshots' | 'prices' | 'arrivals' | 'supply' | 'weather' | 'provider'
  const [snapshotsData, setSnapshotsData] = useState([]);
  const [pricesData, setPricesData] = useState({ records: [], statistics: {} });
  const [arrivalsData, setArrivalsData] = useState({ arrivals: [], statistics: {} });
  const [supplyData, setSupplyData] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [providerStatus, setProviderStatus] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMarketData = async () => {
    setLoading(true);
    setError('');

    try {
      // Execute all queries concurrently in parallel
      const [currentRes, pricesRes, arrivalsRes, supplyRes, weatherRes, statusRes] = await Promise.allSettled([
        API.get('/market-data/prices/current', {
          params: { commodity, market: market || undefined },
        }),
        API.get('/market-data/prices', {
          params: {
            commodity,
            market: market || undefined,
            limit: limitDays,
          },
        }),
        API.get('/market-data/arrivals', {
          params: {
            commodity,
            market: market || undefined,
            limit: limitDays,
          },
        }),
        API.get('/market-data/supply', {
          params: { commodity },
        }),
        API.get('/market-data/weather', {
          params: { market: market || 'Karnal Mandi' },
        }),
        API.get('/market-data/providers/status'),
      ]);

      let hasCoreData = false;

      // 1. Process Current Snapshots
      if (currentRes.status === 'fulfilled' && currentRes.value?.data?.success) {
        setSnapshotsData(currentRes.value.data.snapshots || []);
        hasCoreData = true;
      } else {
        console.warn('[MarketDataCard] Snapshots fetch failed:', currentRes.reason?.message);
      }

      // 2. Process Historical Prices
      if (pricesRes.status === 'fulfilled' && pricesRes.value?.data?.success) {
        setPricesData({
          records: pricesRes.value.data.records || [],
          statistics: pricesRes.value.data.statistics || {},
        });
        hasCoreData = true;
      } else {
        console.warn('[MarketDataCard] Prices fetch failed:', pricesRes.reason?.message);
      }

      // 3. Process Mandi Arrivals
      if (arrivalsRes.status === 'fulfilled' && arrivalsRes.value?.data?.success) {
        setArrivalsData({
          arrivals: arrivalsRes.value.data.arrivals || [],
          statistics: arrivalsRes.value.data.statistics || {},
        });
      } else {
        console.warn('[MarketDataCard] Arrivals fetch failed:', arrivalsRes.reason?.message);
      }

      // 4. Process Regional Supply Indicators
      if (supplyRes.status === 'fulfilled' && supplyRes.value?.data?.success) {
        setSupplyData(supplyRes.value.data.indicators || []);
      } else {
        console.warn('[MarketDataCard] Supply indicators fetch failed:', supplyRes.reason?.message);
      }

      // 5. Process Live Weather Data (Phase 5)
      if (weatherRes.status === 'fulfilled' && weatherRes.value?.data?.success) {
        setWeatherData(weatherRes.value.data.weather || null);
      } else {
        console.warn('[MarketDataCard] Weather fetch failed:', weatherRes.reason?.message);
      }

      // 6. Process Multi-Provider Diagnostics
      if (statusRes.status === 'fulfilled' && statusRes.value?.data?.success) {
        setProviderStatus(statusRes.value.data || null);
      } else {
        console.warn('[MarketDataCard] Provider status fetch failed:', statusRes.reason?.message);
      }

      // Only display global error if both core price endpoints failed
      if (!hasCoreData) {
        const errorMsg =
          currentRes.reason?.response?.data?.message ||
          pricesRes.reason?.response?.data?.message ||
          currentRes.reason?.message ||
          'Unable to connect to Agricultural Market Data Layer. Check server status on port 5000.';
        setError(`Agricultural Data Layer: ${errorMsg}`);
      }
    } catch (err) {
      console.error('[MarketDataCard Error]', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch market data from Agricultural Data Layer.');
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

  // Format weather forecast chart data
  const weatherChartData = (weatherData?.forecast || []).map((f) => ({
    date: new Date(f.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
    tempMax: f.tempMax,
    tempMin: f.tempMin,
    precipitationSum: f.precipitationSum,
    rainProb: f.precipitationProbabilityMax,
  }));

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-7">
      {/* 1. Header (Matching User Mock) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold shadow-2xs flex-shrink-0">
            <CloudSun className="w-6 h-6 text-teal-800" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Weather Forecast
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Check upcoming weather conditions that may affect your crop and selling plans.
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
              <Sun className="w-4 h-4 text-amber-500" />
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

          {/* Mandi / Region Location Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              Target Mandi / Route Location
            </label>
            <div className="relative">
              <select
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                className="w-full bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer appearance-none"
              >
                {MANDI_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
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
          onClick={fetchMarketData}
          disabled={loading}
          className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Checking Live Weather Feeds...</span>
            </>
          ) : (
            <>
              <CloudSun className="w-4 h-4" />
              <span>Check Weather & Route Transit</span>
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
              <h4 className="text-xs font-black text-slate-900">Select produce & route</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Choose crop and your transport destination
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-900">Check rain & temperature</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Live Open-Meteo 7-day temperature and precipitation
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-900">Protect crop in transit</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Prevent spoilage and plan optimal harvest departure
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs for In-Depth Data */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 pb-2">
        <button
          onClick={() => setActiveTab('weather')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'weather' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          🌦️ Live Weather & Agro-Advisories
        </button>
        <button
          onClick={() => setActiveTab('snapshots')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'snapshots' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          📊 Mandi Spot Prices
        </button>
        <button
          onClick={() => setActiveTab('prices')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'prices' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          📈 Price Trends
        </button>
        <button
          onClick={() => setActiveTab('arrivals')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'arrivals' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          📦 Arrival Volumes
        </button>
      </div>

      {/* 3. Transparent Multi-Source Provenance Banner */}
      <div className="mx-6 p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-2 text-emerald-900 font-extrabold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Active Data Streams:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Open-Meteo Agro-Climate Stream
          </span>
          {snapshotsData[0]?.source === 'LIVE_EXTERNAL' ? (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              🟢 Live Agmarknet Data (data.gov.in)
            </span>
          ) : providerStatus?.market?.status === 'DEGRADED_RATE_LIMITED' ? (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              🟡 Live Source Rate-Limited — Showing Fallback
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-300">
              🟡 Seeded Fallback Data (APMC Baseline Layer)
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-300">
            🟣 Phase 2–4 Predictive Intelligence Ready
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">
            Fetching APMC spot prices, arrival records, and live agro-climatic conditions for {commodity}...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mx-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchMarketData}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-all"
          >
            Retry
          </button>
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
                    <Building2 className="w-4 h-4 text-emerald-600" />{' '}
                    {snapshotsData[0]?.source === 'LIVE_EXTERNAL'
                      ? 'Current Live Mandi Price Snapshots'
                      : 'Fallback Baseline Observations'}{' '}
                    ({commodity})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {snapshotsData[0]?.source === 'LIVE_EXTERNAL'
                      ? 'Latest observed modal, minimum, and maximum prices with real-time auction feeds across regional APMCs'
                      : 'Historical APMC benchmark modal, minimum, and maximum prices with 7-day price momentum'}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {snapshotsData.length} Mandis Reporting ({snapshotsData[0]?.source === 'LIVE_EXTERNAL' ? 'Live External Data' : 'Fallback Baseline Data'})
                </span>
              </div>

              {/* Notice when serving fallback due to rate limit */}
              {snapshotsData[0]?.source !== 'LIVE_EXTERNAL' && (
                <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 font-medium">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Government live mandi source is temporarily rate-limited. Showing verified seeded APMC baseline data.</span>
                </div>
              )}

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
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                              snap.trend === 'RISING'
                                ? 'bg-emerald-100 text-emerald-800'
                                : snap.trend === 'FALLING'
                                ? 'bg-rose-100 text-rose-800'
                                : snap.trend === 'LIVE_AUCTION'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {snap.trend === 'RISING' && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                            {snap.trend === 'FALLING' && <TrendingDown className="w-3 h-3 text-rose-600" />}
                            {snap.trend === 'LIVE_AUCTION' && <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />}
                            {snap.trend}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                              snap.source === 'LIVE_EXTERNAL'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {snap.source === 'LIVE_EXTERNAL' ? 'LIVE DATA' : 'SEEDED FALLBACK'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">
                            {snap.source === 'LIVE_EXTERNAL' ? 'Live Modal Price' : 'Fallback Baseline Observation'}
                          </span>
                          <span className="text-xl font-black text-slate-900">₹{snap.currentModalPrice}</span>
                          <span className="text-[10px] text-slate-500 font-medium"> / Quintal</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">
                            {snap.source === 'LIVE_EXTERNAL' ? 'Per Kg Live Rate' : 'Per Kg Baseline'}
                          </span>
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
                              snap.changePercent === null
                                ? 'text-slate-500'
                                : snap.changePercent >= 0
                                ? 'text-emerald-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {snap.changePercent === null
                              ? 'Live Snapshot'
                              : `${snap.changePercent >= 0 ? '+' : ''}${snap.changePercent}% (${snap.change7d >= 0 ? '+' : ''}₹${snap.change7d}/q)`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>
                          Source:{' '}
                          <b className={snap.source === 'LIVE_EXTERNAL' ? 'text-emerald-700' : 'text-amber-700'}>
                            {snap.source === 'LIVE_EXTERNAL' ? 'Live Agmarknet (data.gov.in)' : 'Seeded Fallback (APMC Baseline)'}
                          </b>
                        </span>
                        <span>
                          Observed:{' '}
                          <b className="text-slate-700">
                            {new Date(snap.arrivalDate).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </b>
                        </span>
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

          {/* TAB 5: Live Weather & Agri Climate (Phase 5 Live Integration) */}
          {activeTab === 'weather' && weatherData && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <CloudSun className="w-4 h-4 text-amber-500" /> Live Agricultural Weather & Harvesting Advisories
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Real-time meteorological conditions and 7-day precipitation impact for <b>{weatherData.location?.district}, {weatherData.location?.state}</b>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Stream: Open-Meteo API
                </span>
              </div>

              {/* Current Weather Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100 flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Temperature</span>
                    <span className="text-xl font-black text-slate-900">
                      {weatherData.current?.temperature} {weatherData.current?.temperatureUnit}
                    </span>
                    <span className="text-[10px] text-amber-700 font-bold block">{weatherData.current?.weatherLabel}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50/50 border border-blue-100 flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Relative Humidity</span>
                    <span className="text-xl font-black text-slate-900">
                      {weatherData.current?.relativeHumidity} {weatherData.current?.humidityUnit}
                    </span>
                    <span className="text-[10px] text-blue-700 font-medium block">
                      {weatherData.current?.relativeHumidity > 80 ? 'High Moisture' : 'Comfortable'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50/50 border border-indigo-100 flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600">
                    <Umbrella className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Current Rain</span>
                    <span className="text-xl font-black text-slate-900">
                      {weatherData.current?.precipitation} {weatherData.current?.precipitationUnit}
                    </span>
                    <span className="text-[10px] text-indigo-700 font-medium block">
                      7d Total: {weatherData.advisories?.totalForecastRainMm || 0}mm
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50/50 border border-teal-100 flex items-center gap-3">
                  <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-600">
                    <Wind className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Wind Speed</span>
                    <span className="text-xl font-black text-slate-900">
                      {weatherData.current?.windSpeed} {weatherData.current?.windSpeedUnit}
                    </span>
                    <span className="text-[10px] text-teal-700 font-medium block">Surface Velocity</span>
                  </div>
                </div>
              </div>

              {/* Actionable Agricultural Advisories Banner */}
              <div
                className={`p-5 rounded-3xl border space-y-3 ${
                  weatherData.advisories?.riskLevel === 'HIGH'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                    : weatherData.advisories?.riskLevel === 'MODERATE'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Agronomic Decision & Transit Advisory</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      weatherData.advisories?.riskLevel === 'HIGH'
                        ? 'bg-rose-200 text-rose-900'
                        : weatherData.advisories?.riskLevel === 'MODERATE'
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    Climate Risk: {weatherData.advisories?.riskLevel}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="p-3 bg-white/80 rounded-2xl border border-white/60 space-y-1">
                    <span className="font-extrabold block text-[11px] text-slate-900">🚚 Mandi Transit & Road Connectivity:</span>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {weatherData.advisories?.mandiTransportImpact}
                    </p>
                  </div>

                  <div className="p-3 bg-white/80 rounded-2xl border border-white/60 space-y-1">
                    <span className="font-extrabold block text-[11px] text-slate-900">🌾 Harvesting Operations:</span>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {weatherData.advisories?.harvestAdvisory}
                    </p>
                  </div>

                  <div className="p-3 bg-white/80 rounded-2xl border border-white/60 space-y-1">
                    <span className="font-extrabold block text-[11px] text-slate-900">📦 Storage & Aeration:</span>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {weatherData.advisories?.storageAdvisory}
                    </p>
                  </div>
                </div>
              </div>

              {/* 7-Day Forecast Cards */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-900 block">7-Day Meteorological Outlook</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  {(weatherData.forecast || []).map((day, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center space-y-2 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all"
                    >
                      <span className="text-[11px] font-bold text-slate-700">
                        {idx === 0
                          ? 'Today'
                          : new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}
                      </span>
                      <WeatherIcon iconName={day.weatherIcon} className="w-7 h-7" />
                      <span className="text-[10px] text-slate-500 font-medium leading-tight line-clamp-1">
                        {day.weatherLabel}
                      </span>
                      <div className="pt-1 border-t border-slate-200 w-full flex justify-around text-[10px] font-black">
                        <span className="text-slate-900">{Math.round(day.tempMax)}°</span>
                        <span className="text-slate-400">{Math.round(day.tempMin)}°</span>
                      </div>
                      <div className="text-[9px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded-md w-full">
                        {day.precipitationSum > 0 ? `${day.precipitationSum}mm rain` : '0mm rain'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weather Forecast Trend Chart */}
              <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700">7-Day Temperature & Rain Probability Trend</span>
                  <span className="text-[10px] text-slate-400">Timezone: {weatherData.location?.timezone}</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={weatherChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                      <YAxis yAxisId="temp" stroke="#f59e0b" fontSize={11} unit="°C" domain={['auto', 'auto']} />
                      <YAxis yAxisId="rain" orientation="right" stroke="#3b82f6" fontSize={11} unit="%" domain={[0, 100]} />
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
                      <Bar yAxisId="rain" dataKey="rainProb" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Rain Probability (%)" />
                      <Line yAxisId="temp" type="monotone" dataKey="tempMax" stroke="#f59e0b" strokeWidth={2.5} name="Max Temp (°C)" />
                      <Line yAxisId="temp" type="monotone" dataKey="tempMin" stroke="#64748b" strokeWidth={2} strokeDasharray="3 3" name="Min Temp (°C)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Multi-Provider Diagnostics & Data Health */}
          {activeTab === 'provider' && providerStatus && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Multi-Source Telemetry & System Health
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Live telemetry for Agmarknet Mandi Provider and Open-Meteo Weather Integration
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  SYSTEM STATUS: OPERATIONAL
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Market Provider Diagnostics */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-emerald-600" /> Market Data Provider
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        providerStatus.market?.status === 'ACTIVE_LIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : providerStatus.market?.status === 'DEGRADED_RATE_LIMITED'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {providerStatus.market?.status || 'READY'}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Provider Name:</span>
                      <span className="font-bold text-slate-800">{providerStatus.market?.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Live API Configured:</span>
                      <span className="font-bold text-slate-800">{providerStatus.market?.providerConfigured ? 'Yes (data.gov.in key active)' : 'No (Standby)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Serving Source:</span>
                      <span className={`font-bold ${providerStatus.market?.currentDataSource === 'LIVE_EXTERNAL' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {providerStatus.market?.currentDataSource === 'LIVE_EXTERNAL' ? 'Live Agmarknet Stream' : 'Seeded Database Fallback'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Operational Mode:</span>
                      <span className="font-bold text-slate-700">{providerStatus.market?.details}</span>
                    </div>
                    {providerStatus.market?.rateLimitCooldownUntil && (
                      <div className="flex justify-between text-amber-700 font-bold pt-1 border-t border-slate-200">
                        <span>Cooldown Active Until:</span>
                        <span>{new Date(providerStatus.market.rateLimitCooldownUntil).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Weather Provider Diagnostics */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                      <CloudSun className="w-3.5 h-3.5 text-amber-500" /> Agro-Climate Weather Provider
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                      {providerStatus.weather?.status || 'ACTIVE_LIVE'}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Provider Name:</span>
                      <span className="font-bold text-slate-800">{providerStatus.weather?.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">API Endpoint:</span>
                      <span className="font-bold text-slate-700 font-mono text-[10px]">{providerStatus.weather?.apiUrl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cache TTL / Strategy:</span>
                      <span className="font-bold text-teal-700">30 Min In-Memory TTL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cache Hit Rate:</span>
                      <span className="font-bold text-slate-700">{providerStatus.weather?.cacheStats?.hitRatePercent || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-xs font-black text-slate-900 block">Architectural Integrity Guarantee</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  KisanSetu strictly separates raw physical records, live external meteorological data, and predictive models. Downstream decision engines (Phase 2 Forecasting, Phase 3 Price Intelligence, and Phase 4 Farmer Action) consume data seamlessly through the unified <code>MarketDataProvider</code> abstraction.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketDataCard;
