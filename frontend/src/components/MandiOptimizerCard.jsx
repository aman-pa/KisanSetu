import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  Compass,
  TrendingUp,
  Truck,
  DollarSign,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Info,
  HelpCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Navigation,
  Sliders,
  Scale,
  Sparkles,
  Zap,
} from 'lucide-react';

const COMMODITY_OPTIONS = ['Tomato', 'Potato', 'Onion', 'Wheat', 'Rice', 'Apple'];

const PRESET_LOCATIONS = [
  { name: 'Karnal Farm, Haryana', lat: 29.6857, lng: 76.9905, district: 'Karnal', state: 'Haryana' },
  { name: 'Panipat Rural, Haryana', lat: 29.3909, lng: 76.9635, district: 'Panipat', state: 'Haryana' },
  { name: 'Ambala Rural, Haryana', lat: 30.3782, lng: 76.7767, district: 'Ambala', state: 'Haryana' },
  { name: 'Sonipat Village, Haryana', lat: 28.9931, lng: 77.0151, district: 'Sonipat', state: 'Haryana' },
  { name: 'Mathura Village, UP', lat: 27.4924, lng: 77.6737, district: 'Mathura', state: 'Uttar Pradesh' },
  { name: 'Agra Rural, UP', lat: 27.1767, lng: 78.0081, district: 'Agra', state: 'Uttar Pradesh' },
  { name: 'Nashik Orchard, MH', lat: 19.9975, lng: 73.7898, district: 'Nashik', state: 'Maharashtra' },
];

const REASON_LABELS = {
  HIGHEST_NET_REALIZATION: { label: 'Highest Net Profit', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  PRICE_PREMIUM_OVERCOMES_DISTANCE: { label: 'Price Premium > Freight', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  LOCAL_PROXIMITY_ADVANTAGE: { label: 'Local Mandi (Min Freight)', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  LOWER_LOGISTICS_COST: { label: 'Low Transport Overhead', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  HIGH_MARKET_ABSORPTION: { label: 'High Demand Absorption', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  UPWARD_PRICE_MOMENTUM: { label: 'Rising Price Trend', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  SUPPLY_DEFICIT_OPPORTUNITY: { label: 'Supply Shortage Premium', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  LOW_VOLATILITY_STABILITY: { label: 'Stable Realization Band', color: 'bg-slate-100 text-slate-800 border-slate-300' },
};

const MandiOptimizerCard = ({ defaultCommodity = 'Tomato', defaultLocationIndex = 0 }) => {
  const [commodity, setCommodity] = useState(defaultCommodity);
  const [quantity, setQuantity] = useState(25);
  const [unit, setUnit] = useState('quintal'); // 'kg' | 'quintal' | 'tonnes'
  const [selectedPreset, setSelectedPreset] = useState(defaultLocationIndex);
  const [customLat, setCustomLat] = useState(PRESET_LOCATIONS[0].lat);
  const [customLng, setCustomLng] = useState(PRESET_LOCATIONS[0].lng);
  const [isUsingGps, setIsUsingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState(300);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [showAssumptions, setShowAssumptions] = useState(false);

  // Synchronize preset coordinates
  const handlePresetChange = (index) => {
    setSelectedPreset(index);
    if (index !== -1 && PRESET_LOCATIONS[index]) {
      setCustomLat(PRESET_LOCATIONS[index].lat);
      setCustomLng(PRESET_LOCATIONS[index].lng);
    }
  };

  // Browser Geolocation integration
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported in this browser.');
      return;
    }
    setIsUsingGps(true);
    setGpsStatus('Locating device via GPS...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomLat(Number(pos.coords.latitude.toFixed(4)));
        setCustomLng(Number(pos.coords.longitude.toFixed(4)));
        setSelectedPreset(-1); // Custom
        setGpsStatus(`GPS acquired (±${Math.round(pos.coords.accuracy)}m)`);
        setIsUsingGps(false);
      },
      (err) => {
        setGpsStatus(`GPS Error: ${err.message}. Using default preset.`);
        setIsUsingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Execute Mandi Optimization Request
  const runOptimization = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        commodity,
        quantity: Number(quantity),
        unit,
        lat: Number(customLat),
        lng: Number(customLng),
        maxDistanceKm: Number(maxDistanceKm),
      };

      const res = await API.post('/mandi-optimizer/optimize', payload);
      if (res.data.success) {
        setResult(res.data);
      } else {
        setError(res.data.message || 'Optimization returned unsuccessful status.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to calculate optimal mandi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runOptimization();
  }, [commodity, selectedPreset]);

  const recommended = result?.recommendedMandi;
  const baseline = result?.baselineLocalMandi;
  const alternatives = result?.rankedAlternatives || [];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-agri-md overflow-hidden transition-all">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/20">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              Phase 6: Net Realization & Mandi Optimizer
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Mandi Profitability & Logistics Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
              Calculates your true take-home revenue after deducting estimated road freight, loading fees, and transit tolls.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runOptimization}
              disabled={loading}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Optimizing...' : 'Re-Calculate'}
            </button>
          </div>
        </div>

        {/* Input Parameters Controls Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Crop Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              1. Crop Commodity
            </label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {COMMODITY_OPTIONS.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Produce Quantity & Unit */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              2. Lot Quantity
            </label>
            <div className="flex rounded-xl overflow-hidden border border-white/10 bg-slate-800/90">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-2/3 bg-transparent px-3 py-2 text-xs font-bold text-white focus:outline-none"
                placeholder="25"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-1/3 bg-slate-700 text-white text-xs font-bold px-2 py-2 focus:outline-none border-l border-white/10"
              >
                <option value="quintal">Quintals (q)</option>
                <option value="kg">Kg</option>
                <option value="tonnes">Tonnes (T)</option>
              </select>
            </div>
          </div>

          {/* 3. Farmer Origin Location */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                3. Farmer Location
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isUsingGps}
                className="text-[10px] text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1"
              >
                <Navigation className="w-2.5 h-2.5" />
                {isUsingGps ? 'Locating...' : 'GPS Auto-Detect'}
              </button>
            </div>
            <select
              value={selectedPreset}
              onChange={(e) => handlePresetChange(Number(e.target.value))}
              className="w-full bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {PRESET_LOCATIONS.map((loc, idx) => (
                <option key={loc.name} value={idx} className="bg-slate-900 text-white">
                  {loc.name}
                </option>
              ))}
              {selectedPreset === -1 && (
                <option value={-1} className="bg-slate-900 text-white">
                  📍 Custom GPS ({customLat.toFixed(2)}, {customLng.toFixed(2)})
                </option>
              )}
            </select>
          </div>

          {/* 4. Search Radius */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                4. Max Radius
              </label>
              <span className="text-xs font-bold text-amber-300">{maxDistanceKm} km</span>
            </div>
            <select
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="w-full bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value={100}>100 km (Local Cluster)</option>
              <option value={200}>200 km (Regional)</option>
              <option value={300}>300 km (Standard North India)</option>
              <option value={500}>500 km (Inter-State Terminals)</option>
            </select>
          </div>
        </div>

        {gpsStatus && (
          <div className="mt-2 text-[11px] text-amber-300 font-medium flex items-center gap-1.5">
            <Info className="w-3 h-3" />
            {gpsStatus}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Optimization Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">
              Evaluating multi-mandi transport logistics & net revenue models...
            </p>
          </div>
        )}

        {/* Successful Optimization Results */}
        {!loading && result && recommended && (
          <div className="space-y-6">
            {/* HERO RECOMMENDATION CARD */}
            <div className="rounded-3xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 p-6 shadow-agri-sm relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                {/* Left Side: Mandi Identification & Recommendation Badge */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-600 text-white shadow-sm flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Economically Optimal Mandi (Rank #1)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {recommended.distanceKm} km away (Est. Road)
                    </span>
                    {recommended.priceProvenance === 'LIVE_EXTERNAL' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        Live Agmarknet
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Seeded APMC Baseline ({recommended.observationDate})
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                      {recommended.market}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {recommended.district ? `${recommended.district}, ` : ''}{recommended.state} • Commodity:{' '}
                      <span className="font-bold text-slate-900">{commodity}</span> ({result.quantityKg.toLocaleString('en-IN')} kg / {result.quantityQuintals} q)
                    </p>
                  </div>

                  {/* Reason Codes Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {recommended.reasonCodes.map((code) => {
                      const cfg = REASON_LABELS[code] || { label: code, color: 'bg-slate-100 text-slate-800 border-slate-300' };
                      return (
                        <span
                          key={code}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${cfg.color}`}
                        >
                          {cfg.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Key Financial Figures */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                  <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm min-w-[150px]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Net Realization
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-700 block">
                      ₹{recommended.netRealization.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 block">
                      ₹{recommended.netRealizationPerKg.toFixed(2)} / kg
                    </span>
                  </div>

                  {baseline && recommended.netAdvantageOverLocal > 0 && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-sm min-w-[160px]">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-80">
                        Net Advantage vs Local
                      </span>
                      <span className="text-2xl font-black block">
                        +₹{recommended.netAdvantageOverLocal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-extrabold block">
                        +₹{recommended.netAdvantagePerKg.toFixed(2)}/kg extra profit
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Breakdown & Waterfall Bar */}
              <div className="mt-6 pt-5 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-white/80 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">1. Gross Auction Value</span>
                  <span className="text-base font-black text-slate-900 block">
                    ₹{recommended.grossRevenue.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    @ ₹{recommended.pricePerKg.toFixed(2)}/kg (₹{recommended.pricePerQuintal}/q)
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/80 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">2. Est. Freight & Tolls</span>
                  <span className="text-base font-black text-rose-600 block">
                    -₹{recommended.estimatedLogisticsCost.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    ₹{recommended.logisticsCostPerKg.toFixed(2)}/kg ({recommended.logisticsPercentage}% of gross)
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/80 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">3. Allocated Vehicle</span>
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {recommended.vehicleTier}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {recommended.distanceKm} km route @ 1.25x
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-600 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">4. Net Take-Home</span>
                  <span className="text-base font-black block">
                    ₹{recommended.netRealization.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] font-bold opacity-90">
                    ₹{recommended.netRealizationPerKg.toFixed(2)} / kg take-home
                  </span>
                </div>
              </div>

              {/* Narrative Farmer Explainability */}
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-900 text-slate-100 text-xs font-medium flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-amber-300">Decision Rationale: </strong>
                  {recommended.explanation}
                </p>
              </div>
            </div>

            {/* ALL CANDIDATE MANDIS COMPARISON TABLE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-700" />
                    All Evaluated Mandis Ranked by Net Take-Home
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Complete breakdown comparing gross prices against estimated logistics overheads.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {alternatives.length} Mandis Evaluated
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Rank</th>
                      <th className="py-3 px-3">Mandi / Terminal</th>
                      <th className="py-3 px-3">Distance</th>
                      <th className="py-3 px-3">Modal Price</th>
                      <th className="py-3 px-3">Gross Revenue</th>
                      <th className="py-3 px-3">Est. Freight</th>
                      <th className="py-3 px-3 text-emerald-800">Net Realization</th>
                      <th className="py-3 px-3 text-right">Net vs Local</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {alternatives.map((m) => {
                      const isTop = m.rank === 1;
                      const isBase = m.market === baseline?.market;
                      return (
                        <tr
                          key={m.mandiId || m.market}
                          className={`transition-colors ${
                            isTop
                              ? 'bg-emerald-50/50 font-bold'
                              : isBase
                              ? 'bg-amber-50/30'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                                isTop
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {m.rank}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                                {m.market}
                                {isTop && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-600 text-white font-extrabold">
                                    TOP PICK
                                  </span>
                                )}
                                {isBase && !isTop && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500 text-white font-extrabold">
                                    CLOSEST MANDI
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {m.district}, {m.state}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-700">
                            {m.distanceKm} km
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">
                              ₹{m.pricePerKg.toFixed(2)}/kg
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              ₹{m.pricePerQuintal}/q
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-700">
                            ₹{m.grossRevenue.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-rose-600">
                            -₹{m.estimatedLogisticsCost.toLocaleString('en-IN')}
                            <span className="text-[10px] text-slate-400 block">
                              (₹{m.logisticsCostPerKg.toFixed(2)}/kg)
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-extrabold text-emerald-700 block">
                              ₹{m.netRealization.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 block">
                              ₹{m.netRealizationPerKg.toFixed(2)}/kg
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {m.netAdvantageOverLocal > 0 ? (
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-extrabold inline-block">
                                +₹{m.netAdvantageOverLocal.toLocaleString('en-IN')}
                              </span>
                            ) : m.netAdvantageOverLocal < 0 ? (
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-medium inline-block">
                                -₹{Math.abs(m.netAdvantageOverLocal).toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">— Baseline</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODEL ASSUMPTIONS & DATA PROVENANCE ACCORDION */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAssumptions(!showAssumptions)}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Model Assumptions, Logistics Pricing Methodology & Data Provenance
                  </span>
                </div>
                {showAssumptions ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {showAssumptions && (
                <div className="p-5 border-t border-slate-200 bg-white space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Road Circuity Factor
                      </span>
                      <span className="text-xs font-bold text-slate-900 block mt-0.5">
                        1.25x (Haversine-to-Road Model)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Reflects actual Indian highway & rural road curvature.
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Logistics Freight Source
                      </span>
                      <span className="text-xs font-bold text-slate-900 block mt-0.5">
                        ESTIMATED (Tiered Rate Baseline)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Transparent algorithmic estimate, not a binding carrier quote.
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Market Data Provenance
                      </span>
                      <span className="text-xs font-bold text-slate-900 block mt-0.5">
                        {result.provenance.marketDataSource} ({result.provenance.isMarketDataLive ? 'Live' : 'Verified APMC Baseline'})
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Provider: {result.provenance.marketDataProvider}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    <strong>Integrity Disclaimer: </strong> All transport costs are computed using tiered freight formulas including base linehaul per kilometer, payload weight surcharges, toll allowances, and terminal loading/unloading fees. Prices reflect verified government APMC records and live Agmarknet streams where reachable.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MandiOptimizerCard;
