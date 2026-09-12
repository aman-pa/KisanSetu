import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  Compass,
  TrendingUp,
  Truck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Navigation,
  Scale,
  Sparkles,
  Search,
  Sprout,
} from 'lucide-react';

const COMMODITY_OPTIONS = ['Tomato', 'Potato', 'Onion', 'Wheat', 'Rice', 'Apple'];

const PRESET_LOCATIONS = [
  { name: 'Karnal, Haryana', lat: 29.6857, lng: 76.9905, district: 'Karnal', state: 'Haryana' },
  { name: 'Panipat, Haryana', lat: 29.3909, lng: 76.9635, district: 'Panipat', state: 'Haryana' },
  { name: 'Ambala, Haryana', lat: 30.3782, lng: 76.7767, district: 'Ambala', state: 'Haryana' },
  { name: 'Sonipat, Haryana', lat: 28.9931, lng: 77.0151, district: 'Sonipat', state: 'Haryana' },
  { name: 'Mathura, Uttar Pradesh', lat: 27.4924, lng: 77.6737, district: 'Mathura', state: 'Uttar Pradesh' },
  { name: 'Agra, Uttar Pradesh', lat: 27.1767, lng: 78.0081, district: 'Agra', state: 'Uttar Pradesh' },
  { name: 'Nashik, Maharashtra', lat: 19.9975, lng: 73.7898, district: 'Nashik', state: 'Maharashtra' },
];

const REASON_LABELS = {
  HIGHEST_NET_REALIZATION: { label: 'Highest Expected Realization', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
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

  // Browser Geolocation Auto-Detection
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported by your browser.');
      return;
    }
    setIsUsingGps(true);
    setGpsStatus('Locating your coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomLat(pos.coords.latitude);
        setCustomLng(pos.coords.longitude);
        setSelectedPreset(-1);
        setIsUsingGps(false);
        setGpsStatus(`GPS detected (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`);
      },
      (err) => {
        setIsUsingGps(false);
        setGpsStatus('Unable to access GPS location. Using selected farm preset.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // Run Optimization Calculation
  const runOptimization = async () => {
    setLoading(true);
    setError('');

    try {
      let quantityKg = Number(quantity);
      if (unit === 'quintal') quantityKg = quantity * 100;
      else if (unit === 'tonnes') quantityKg = quantity * 1000;

      const farmLoc =
        selectedPreset !== -1 && PRESET_LOCATIONS[selectedPreset]
          ? PRESET_LOCATIONS[selectedPreset]
          : {
              lat: customLat,
              lng: customLng,
              district: 'Custom Location',
              state: 'Custom',
            };

      const payload = {
        commodity,
        quantityKg,
        farmerLocation: {
          lat: farmLoc.lat,
          lng: farmLoc.lng,
          district: farmLoc.district,
          state: farmLoc.state,
        },
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
  }, [commodity, selectedPreset, maxDistanceKm]);

  const recommended = result?.recommendedMandi;
  const baseline = result?.baselineLocalMandi;
  const alternatives = result?.rankedAlternatives || [];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-7">
      {/* 1. Header (Matching User Mock) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-2xs flex-shrink-0">
            <Compass className="w-6 h-6 text-emerald-800" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Mandi Optimizer
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Find the best market for your produce based on price, distance and estimated net realization.
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

      {/* 2. Form Inputs (Matching User Mock: Select Your Produce & Your Location) */}
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

          {/* Location Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              Your Location
            </label>
            <div className="relative flex items-center">
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(Number(e.target.value))}
                className="w-full bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200 rounded-2xl px-4 py-3 pr-12 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer appearance-none"
              >
                {PRESET_LOCATIONS.map((loc, idx) => (
                  <option key={loc.name} value={idx}>
                    {loc.name}
                  </option>
                ))}
                {selectedPreset === -1 && (
                  <option value={-1}>
                    Custom GPS ({customLat.toFixed(2)}, {customLng.toFixed(2)})
                  </option>
                )}
              </select>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isUsingGps}
                title="Detect current GPS location"
                className="absolute right-3 p-1.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-white transition-colors cursor-pointer"
              >
                <Navigation className={`w-4 h-4 ${isUsingGps ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Action Button (Full-width Deep Green) */}
        <button
          type="button"
          onClick={runOptimization}
          disabled={loading}
          className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Mandis & Freight Routes...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Find Best Mandis</span>
            </>
          )}
        </button>
      </div>

      {gpsStatus && (
        <div className="text-xs text-emerald-800 font-medium flex items-center gap-1.5 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
          <Info className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>{gpsStatus}</span>
        </div>
      )}

      {/* 3. "How It Works?" Guide Banner (Matching User Mock) */}
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
              <h4 className="text-xs font-black text-slate-900">Select your crop</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Choose the produce you want to sell
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-900">Compare mandis</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                We analyze prices, distance and logistics
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-900">Get recommendation</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                See the best market with highest net realization
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Optimization Error */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Optimization Notice</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* 5. Results Section */}
      {!loading && result && recommended && (
        <div className="space-y-6 pt-2 border-t border-slate-100">
          {/* HERO RECOMMENDATION CARD */}
          <div className="rounded-3xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 p-6 sm:p-7 shadow-sm relative overflow-hidden space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              {/* Left Side: Mandi Details */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-800 text-white shadow-2xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Top Recommended Mandi (#1)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                    {recommended.distanceKm} km away
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Live APMC Spot Rates
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {recommended.market}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium pt-0.5">
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

              {/* Right Side: Big Financial Figures */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs min-w-[150px]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Net Take-Home
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-700 block">
                    ₹{recommended.netRealization.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 block">
                    ₹{recommended.netRealizationPerKg.toFixed(2)} / kg
                  </span>
                </div>

                {baseline && recommended.netAdvantageOverLocal > 0 && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-2xs min-w-[160px]">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-85">
                      Net Gain vs Local
                    </span>
                    <span className="text-2xl font-black block">
                      +₹{recommended.netAdvantageOverLocal.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-extrabold block opacity-90">
                      +₹{recommended.netAdvantagePerKg.toFixed(2)}/kg profit boost
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Waterfall Breakdown */}
            <div className="pt-5 border-t border-emerald-100 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Gross Auction Value</span>
                <span className="text-base font-black text-slate-900 block mt-0.5">
                  ₹{recommended.grossRevenue.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  @ ₹{recommended.pricePerKg.toFixed(2)}/kg
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Est. Freight & Tolls</span>
                <span className="text-base font-black text-rose-600 block mt-0.5">
                  -₹{recommended.estimatedLogisticsCost.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  ₹{recommended.logisticsCostPerKg.toFixed(2)}/kg
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Allocated Vehicle</span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate">
                  {recommended.vehicleTier}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {recommended.distanceKm} km route
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-800 text-white shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">4. Net Realization</span>
                <span className="text-base font-black block mt-0.5">
                  ₹{recommended.netRealization.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-bold opacity-90">
                  ₹{recommended.netRealizationPerKg.toFixed(2)} / kg net
                </span>
              </div>
            </div>

            {/* Decision Rationale */}
            <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 text-xs font-medium flex items-start gap-2.5">
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

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
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
                            ? 'bg-emerald-50/60 font-bold'
                            : isBase
                            ? 'bg-amber-50/30'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                              isTop
                                ? 'bg-emerald-800 text-white'
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
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-800 text-white font-extrabold">
                                  TOP PICK
                                </span>
                              )}
                              {isBase && !isTop && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500 text-white font-extrabold">
                                  CLOSEST
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
                          <span className="text-[10px] text-slate-400 block">
                            ₹{m.pricePerQuintal}/q
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          ₹{m.grossRevenue.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-rose-600">
                          -₹{m.estimatedLogisticsCost.toLocaleString('en-IN')}
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
        </div>
      )}
    </div>
  );
};

export default MandiOptimizerCard;
