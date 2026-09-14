import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  Navigation,
  Package,
  X,
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

const ALL_COMMODITIES = [
  'Tomato',
  'Potato',
  'Onion',
  'Wheat',
  'Rice',
  'Apple',
  'Mustard',
  'Maize',
  'Soybean',
  'Cotton',
  'Sugarcane',
  'Banana',
  'Mango',
  'Green Chilli',
  'Garlic',
  'Ginger',
  'Turmeric',
  'Cauliflower',
  'Cabbage',
  'Brinjal',
  'Spinach',
  'Okra',
  'Carrot',
  'Capsicum',
  'Peas',
  'Cucumber',
  'Bitter Gourd',
  'Bottle Gourd',
  'Coriander',
  'Mint',
  'Groundnut',
  'Moong',
  'Urad',
  'Chana',
  'Arhar',
  'Masoor',
];

const PRESET_MANDIS = [
  { name: 'Karnal Mandi (Haryana)', mandi: 'Karnal', district: 'Karnal', state: 'Haryana', lat: 29.6857, lng: 76.9905 },
  { name: 'Azadpur APMC (Delhi)', mandi: 'Azadpur APMC', district: 'North Delhi', state: 'Delhi', lat: 28.7112, lng: 77.1788 },
  { name: 'Ghazipur Mandi (Delhi)', mandi: 'Ghazipur', district: 'East Delhi', state: 'Delhi', lat: 28.6258, lng: 77.3274 },
  { name: 'Panipat Mandi (Haryana)', mandi: 'Panipat', district: 'Panipat', state: 'Haryana', lat: 29.3909, lng: 76.9635 },
  { name: 'Ambala City Mandi (Haryana)', mandi: 'Ambala City', district: 'Ambala', state: 'Haryana', lat: 30.3782, lng: 76.7767 },
  { name: 'Agra Mandi (Uttar Pradesh)', mandi: 'Agra', district: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
  { name: 'Lasalgaon Mandi (Nashik)', mandi: 'Lasalgaon', district: 'Nashik', state: 'Maharashtra', lat: 20.1444, lng: 74.2281 },
  { name: 'Jalandhar Cantt Mandi (Punjab)', mandi: 'Jalandhar Cantt', district: 'Jalandhar', state: 'Punjab', lat: 31.3260, lng: 75.5762 },
  { name: 'Ludhiana Mandi (Punjab)', mandi: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573 },
  { name: 'Jaipur Mandi (Rajasthan)', mandi: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Pune Mandi (Maharashtra)', mandi: 'Pune', district: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
];

const HORIZON_OPTIONS = [
  { label: '7 Days', value: 7 },
  { label: '15 Days', value: 15 },
  { label: '30 Days', value: 30 },
];

const PriceIntelligenceCard = ({ defaultCommodity = 'Tomato', defaultMandi = 'Karnal' }) => {
  const { user } = useAuth();

  // Produce State
  const [commodity, setCommodity] = useState(defaultCommodity);
  const [cropSearch, setCropSearch] = useState(defaultCommodity);
  const [cropDropdownOpen, setCropDropdownOpen] = useState(false);
  const [farmerListings, setFarmerListings] = useState([]);

  // Mandi / Location State
  const initialMandi = PRESET_MANDIS.find((m) => m.mandi.toLowerCase() === defaultMandi.toLowerCase()) || PRESET_MANDIS[0];
  const [selectedMandi, setSelectedMandi] = useState(initialMandi);
  const [mandiSearch, setMandiSearch] = useState(initialMandi.name);
  const [mandiDropdownOpen, setMandiDropdownOpen] = useState(false);
  const [isUsingGps, setIsUsingGps] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');

  const [horizon, setHorizon] = useState(7);
  const [recommendationData, setRecommendationData] = useState(null);
  const [bestMandiData, setBestMandiData] = useState(null);
  const [signalsData, setSignalsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cropDropdownRef = useRef(null);
  const mandiDropdownRef = useRef(null);

  // 1. Fetch Farmer's Active Produce Listings from My Produce
  useEffect(() => {
    const fetchFarmerProduce = async () => {
      if (!user) return;
      try {
        const res = await API.get('/products/farmer/my-listings');
        if (res.data?.success && Array.isArray(res.data.listings)) {
          setFarmerListings(res.data.listings);
        }
      } catch (err) {
        // Silently continue if unauthenticated or non-farmer role
      }
    };
    fetchFarmerProduce();
  }, [user]);

  // 2. Outside Click Listener for Dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cropDropdownRef.current && !cropDropdownRef.current.contains(e.target)) {
        setCropDropdownOpen(false);
      }
      if (mandiDropdownRef.current && !mandiDropdownRef.current.contains(e.target)) {
        setMandiDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Filtered Crops for Search
  const filteredCrops = React.useMemo(() => {
    const query = cropSearch.trim().toLowerCase();
    if (!query) return ALL_COMMODITIES.slice(0, 10);

    return ALL_COMMODITIES.filter((c) => c.toLowerCase().includes(query))
      .sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        if (aLower === query) return -1;
        if (bLower === query) return 1;
        if (aLower.startsWith(query) && !bLower.startsWith(query)) return -1;
        if (!aLower.startsWith(query) && bLower.startsWith(query)) return 1;
        return aLower.localeCompare(bLower);
      })
      .slice(0, 10);
  }, [cropSearch]);

  // 4. Filtered Mandis for Search
  const filteredMandis = React.useMemo(() => {
    const query = mandiSearch.trim().toLowerCase();
    if (!query) return PRESET_MANDIS.slice(0, 8);

    return PRESET_MANDIS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query) ||
        loc.district.toLowerCase().includes(query) ||
        loc.state.toLowerCase().includes(query) ||
        loc.mandi.toLowerCase().includes(query)
    )
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        if (aName === query) return -1;
        if (bName === query) return 1;
        if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
        if (!aName.startsWith(query) && bName.startsWith(query)) return 1;
        return aName.localeCompare(bName);
      })
      .slice(0, 8);
  }, [mandiSearch]);

  // 5. Select Produce Handlers
  const handleSelectFarmerListing = (listing) => {
    const crop = listing.cropName || 'Tomato';
    setCommodity(crop);
    setCropSearch(crop);
    setCropDropdownOpen(false);
  };

  const handleSelectCommodity = (cropName) => {
    setCommodity(cropName);
    setCropSearch(cropName);
    setCropDropdownOpen(false);
  };

  // 6. Select Mandi Handlers
  const handleSelectMandi = (loc) => {
    setSelectedMandi(loc);
    setMandiSearch(loc.name);
    setLocationNotice('');
    setMandiDropdownOpen(false);
  };

  const handleMandiInputChange = (val) => {
    setMandiSearch(val);
    setMandiDropdownOpen(true);
    const match = PRESET_MANDIS.find(
      (l) =>
        l.name.toLowerCase() === val.trim().toLowerCase() ||
        l.mandi.toLowerCase() === val.trim().toLowerCase() ||
        l.district.toLowerCase() === val.trim().toLowerCase()
    );
    if (match) {
      setSelectedMandi(match);
    } else if (val.trim()) {
      setSelectedMandi({
        name: val,
        mandi: val,
        district: '',
        state: '',
      });
    }
  };

  // 7. Geolocation GPS Action
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice('Location access unavailable. You can search mandis manually.');
      return;
    }
    setIsUsingGps(true);
    setLocationNotice('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let closest = PRESET_MANDIS[0];
        let minDistance = Infinity;

        PRESET_MANDIS.forEach((loc) => {
          if (!loc.lat) return;
          const d = Math.sqrt(Math.pow(loc.lat - lat, 2) + Math.pow(loc.lng - lng, 2));
          if (d < minDistance) {
            minDistance = d;
            closest = loc;
          }
        });

        const detectedLoc = {
          name: closest.name,
          mandi: closest.mandi,
          district: closest.district,
          state: closest.state,
          lat,
          lng,
          isDetected: true,
        };

        setSelectedMandi(detectedLoc);
        setMandiSearch(closest.name);
        setIsUsingGps(false);
        setLocationNotice(`📍 ${closest.name}`);
      },
      (err) => {
        setIsUsingGps(false);
        setLocationNotice('Location access unavailable. You can search mandis manually.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const fetchPriceIntelligence = async () => {
    setLoading(true);
    setError('');
    try {
      const [recRes, mandisRes, sigRes] = await Promise.allSettled([
        API.get('/price-intelligence/recommendation', {
          params: { commodity, mandi: selectedMandi.mandi, horizonDays: horizon },
        }),
        API.get('/price-intelligence/best-mandi', {
          params: { commodity, localMandi: selectedMandi.mandi, horizonDays: horizon },
        }),
        API.get('/price-intelligence/signals', {
          params: { commodity, mandi: selectedMandi.mandi },
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
  }, [commodity, selectedMandi, horizon]);

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
      {/* 1. Header (Active Tool badge removed per UX spec) */}
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

      {/* 2. Modernized Inputs (Searchable Produce & Benchmark Mandi Autocomplete) */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* =========================================================================
              PRODUCE INPUT: Searchable Autocomplete with "Your Produce" Prioritization
             ========================================================================= */}
          <div className="space-y-1.5 relative" ref={cropDropdownRef}>
            <div className="flex items-center justify-between min-h-[22px]">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 truncate">
                <Sprout className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="truncate">Select Your Produce</span>
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={cropSearch}
                onChange={(e) => {
                  setCropSearch(e.target.value);
                  setCommodity(e.target.value);
                  setCropDropdownOpen(true);
                }}
                onFocus={() => setCropDropdownOpen(true)}
                placeholder="Search crop or produce..."
                className="w-full bg-slate-50/70 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors"
              />
              {cropSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setCropSearch('');
                    setCropDropdownOpen(true);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Produce Autocomplete Dropdown */}
            {cropDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-72 overflow-y-auto">
                {/* SECTION A: FARMER'S OWN PRODUCE ("Your Produce") */}
                {farmerListings && farmerListings.length > 0 && (
                  <div className="border-b border-slate-100 p-2 bg-emerald-50/30">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 px-2 py-1 block">
                      🌾 Your Produce
                    </span>
                    <div className="space-y-1 mt-1">
                      {farmerListings.map((listing) => (
                        <button
                          key={listing._id || listing.batchId}
                          type="button"
                          onClick={() => handleSelectFarmerListing(listing)}
                          className="w-full text-left p-2 rounded-xl hover:bg-emerald-100/60 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-emerald-200/80 text-emerald-800 flex items-center justify-center flex-shrink-0">
                              <Package className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-black text-slate-900 block truncate">
                                {listing.cropName}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {listing.quantityKg ? `${listing.quantityKg.toLocaleString('en-IN')} kg` : ''}
                                {listing.grade ? ` • ${listing.grade.replace('_', ' ')}` : ''}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 flex-shrink-0">
                            My Produce
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION B: SEARCH ALL PRODUCE */}
                <div className="p-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 block">
                    All Supported Crops
                  </span>
                  <div className="space-y-0.5 mt-1">
                    {filteredCrops.length > 0 ? (
                      filteredCrops.map((c) => {
                        const isSelected = commodity.toLowerCase() === c.toLowerCase();
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleSelectCommodity(c)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                              {c}
                            </span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400">
                        No crops matching "{cropSearch}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              BENCHMARK MANDI INPUT: Search Benchmark Market with "Use My Location" GPS Action
             ========================================================================= */}
          <div className="space-y-1.5 relative" ref={mandiDropdownRef}>
            <div className="flex items-center justify-between min-h-[22px] gap-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 truncate min-w-0">
                <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="truncate">Benchmark Mandi</span>
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isUsingGps}
                className="text-[11px] font-black text-emerald-800 hover:text-emerald-900 flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50 whitespace-nowrap flex-shrink-0 ml-1"
              >
                <Navigation className={`w-3 h-3 ${isUsingGps ? 'animate-spin text-emerald-600' : ''}`} />
                {isUsingGps ? 'Locating...' : 'Use My Location'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={mandiSearch}
                onChange={(e) => handleMandiInputChange(e.target.value)}
                onFocus={() => setMandiDropdownOpen(true)}
                placeholder="Search benchmark mandi..."
                className="w-full bg-slate-50/70 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors"
              />
              {mandiSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setMandiSearch('');
                    setMandiDropdownOpen(true);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mandi Autocomplete Dropdown */}
            {mandiDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-72 overflow-y-auto p-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 block">
                  Suggested Benchmark Mandis
                </span>
                <div className="space-y-0.5 mt-1">
                  {filteredMandis.length > 0 ? (
                    filteredMandis.map((loc) => {
                      const isSelected = selectedMandi.mandi === loc.mandi;
                      return (
                        <button
                          key={loc.name}
                          type="button"
                          onClick={() => handleSelectMandi(loc)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                            <span className="truncate">{loc.name}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No mandis matching "{mandiSearch}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Notice */}
        {locationNotice && (
          <div className="text-xs text-emerald-900 font-bold flex items-center gap-2 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 animate-in fade-in">
            <Info className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>{locationNotice}</span>
          </div>
        )}

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
