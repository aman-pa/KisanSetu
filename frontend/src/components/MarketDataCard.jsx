import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  Search,
  Sprout,
  ChevronDown,
  Navigation,
  Package,
  X,
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
  { name: 'All Regional Mandis', mandi: '', district: '', state: '' },
  { name: 'Karnal Mandi (Haryana)', mandi: 'Karnal Mandi', district: 'Karnal', state: 'Haryana', lat: 29.6857, lng: 76.9905 },
  { name: 'Azadpur APMC (Delhi)', mandi: 'Azadpur APMC Mandi', district: 'North Delhi', state: 'Delhi', lat: 28.7112, lng: 77.1788 },
  { name: 'Ghazipur Mandi (Delhi)', mandi: 'Ghazipur Mandi', district: 'East Delhi', state: 'Delhi', lat: 28.6258, lng: 77.3274 },
  { name: 'Panipat Mandi (Haryana)', mandi: 'Panipat Mandi', district: 'Panipat', state: 'Haryana', lat: 29.3909, lng: 76.9635 },
  { name: 'Ambala City Mandi (Haryana)', mandi: 'Ambala City Mandi', district: 'Ambala', state: 'Haryana', lat: 30.3782, lng: 76.7767 },
  { name: 'Agra Mandi (Uttar Pradesh)', mandi: 'Agra Mandi', district: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
  { name: 'Lasalgaon Mandi (Nashik)', mandi: 'Lasalgaon Mandi', district: 'Nashik', state: 'Maharashtra', lat: 20.1444, lng: 74.2281 },
  { name: 'Jalandhar Cantt Mandi (Punjab)', mandi: 'Jalandhar Cantt Mandi', district: 'Jalandhar', state: 'Punjab', lat: 31.3260, lng: 75.5762 },
  { name: 'Ludhiana Mandi (Punjab)', mandi: 'Ludhiana Mandi', district: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573 },
  { name: 'Jaipur Mandi (Rajasthan)', mandi: 'Jaipur Mandi', district: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Pune Mandi (Maharashtra)', mandi: 'Pune Mandi', district: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
];

const LIMIT_OPTIONS = [
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 15 Days', value: 15 },
  { label: 'Last 30 Days', value: 30 },
  { label: 'Last 60 Days', value: 60 },
];

const formatMarketName = (name) => {
  if (!name) return 'Regional Mandi';
  let clean = name.trim();
  clean = clean.replace(/([^\s])\(/g, '$1 (');
  clean = clean.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
  clean = clean.replace(/\s+/g, ' ');
  return clean;
};

const MarketDataCard = ({ defaultCommodity = 'Tomato', defaultMarket = '' }) => {
  const { user } = useAuth();

  // Produce State
  const [commodity, setCommodity] = useState(defaultCommodity);
  const [cropSearch, setCropSearch] = useState(defaultCommodity);
  const [cropDropdownOpen, setCropDropdownOpen] = useState(false);
  const [farmerListings, setFarmerListings] = useState([]);

  // Mandi / Location State
  const initialMandi = PRESET_MANDIS.find((m) => m.mandi === defaultMarket) || PRESET_MANDIS[0];
  const [selectedMandi, setSelectedMandi] = useState(initialMandi);
  const [mandiSearch, setMandiSearch] = useState(initialMandi.name);
  const [mandiDropdownOpen, setMandiDropdownOpen] = useState(false);
  const [isUsingGps, setIsUsingGps] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');

  const [limitDays, setLimitDays] = useState(30);
  const [activeTab, setActiveTab] = useState('snapshots'); // 'snapshots' | 'prices' | 'arrivals' | 'provider'
  const [snapshotsData, setSnapshotsData] = useState([]);
  const [pricesData, setPricesData] = useState({ records: [], statistics: {} });
  const [arrivalsData, setArrivalsData] = useState({ arrivals: [], statistics: {} });
  const [providerStatus, setProviderStatus] = useState(null);

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
        (l.mandi && l.mandi.toLowerCase() === val.trim().toLowerCase()) ||
        (l.district && l.district.toLowerCase() === val.trim().toLowerCase())
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

        let closest = PRESET_MANDIS[1]; // default first mandi after 'All Regional Mandis'
        let minDistance = Infinity;

        PRESET_MANDIS.slice(1).forEach((loc) => {
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

  const fetchMarketData = async () => {
    setLoading(true);
    setError('');

    try {
      const [currentRes, pricesRes, arrivalsRes, statusRes] = await Promise.allSettled([
        API.get('/market-data/prices/current', {
          params: { commodity, market: selectedMandi.mandi || undefined },
        }),
        API.get('/market-data/prices', {
          params: {
            commodity,
            market: selectedMandi.mandi || undefined,
            limit: limitDays,
          },
        }),
        API.get('/market-data/arrivals', {
          params: {
            commodity,
            market: selectedMandi.mandi || undefined,
            limit: limitDays,
          },
        }),
        API.get('/market-data/providers/status'),
      ]);

      let hasCoreData = false;

      if (currentRes.status === 'fulfilled' && currentRes.value?.data?.success) {
        setSnapshotsData(currentRes.value.data.snapshots || []);
        hasCoreData = true;
      }

      if (pricesRes.status === 'fulfilled' && pricesRes.value?.data?.success) {
        setPricesData({
          records: pricesRes.value.data.records || [],
          statistics: pricesRes.value.data.statistics || {},
        });
        hasCoreData = true;
      }

      if (arrivalsRes.status === 'fulfilled' && arrivalsRes.value?.data?.success) {
        setArrivalsData({
          arrivals: arrivalsRes.value.data.arrivals || [],
          statistics: arrivalsRes.value.data.statistics || {},
        });
      }

      if (statusRes.status === 'fulfilled' && statusRes.value?.data?.success) {
        setProviderStatus(statusRes.value.data || null);
      }

      if (!hasCoreData) {
        setError('Unable to connect to Agricultural Market Data Layer.');
      }
    } catch (err) {
      console.error('[MarketDataCard Error]', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch market data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [commodity, selectedMandi, limitDays]);

  // Format price chart time series (sorted chronologically)
  const priceChartData = React.useMemo(() => {
    return [...(pricesData.records || [])]
      .sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate))
      .map((r) => {
        let dateStr = r.arrivalDate;
        try {
          const d = new Date(r.arrivalDate);
          if (!isNaN(d.getTime())) {
            dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
          }
        } catch (e) {
          dateStr = r.arrivalDate;
        }
        return {
          date: dateStr,
          modalPrice: r.modalPrice,
          minPrice: r.minPrice,
          maxPrice: r.maxPrice,
          modalPricePerKg: r.modalPricePerKg,
          market: r.market,
        };
      });
  }, [pricesData]);

  // Format arrival chart time series
  const arrivalChartData = React.useMemo(() => {
    return [...(arrivalsData.arrivals || [])]
      .sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate))
      .map((a) => {
        let dateStr = a.arrivalDate;
        try {
          const d = new Date(a.arrivalDate);
          if (!isNaN(d.getTime())) {
            dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
          }
        } catch (e) {
          dateStr = a.arrivalDate;
        }
        return {
          date: dateStr,
          arrivalTonnes: a.arrivalQuantity,
          market: a.market,
        };
      });
  }, [arrivalsData]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-7">
      {/* 1. Header (Active Tool badge removed per UX spec) */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-2xs flex-shrink-0">
          <BarChart3 className="w-6 h-6 text-emerald-800" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Market Data
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Real-time APMC mandi spot prices, intake volumes, and regional supply indicators.
          </p>
        </div>
      </div>

      {/* 2. Modernized Inputs (Searchable Produce & Mandi Autocomplete) */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* =========================================================================
              PRODUCE INPUT: Searchable Autocomplete with "Your Produce" Prioritization
             ========================================================================= */}
          <div className="space-y-1.5 relative" ref={cropDropdownRef}>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-700" />
              Select Your Produce
            </label>
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
              MANDI INPUT: Search Reference Market with "Use My Location" GPS Action
             ========================================================================= */}
          <div className="space-y-1.5 relative" ref={mandiDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                Mandi / Reference Market
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isUsingGps}
                className="text-[11px] font-black text-emerald-800 hover:text-emerald-900 flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50"
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
                placeholder="Search mandi or reference market..."
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
                  Reference Mandis & Spot Markets
                </span>
                <div className="space-y-0.5 mt-1">
                  {filteredMandis.length > 0 ? (
                    filteredMandis.map((loc) => {
                      const isSelected = selectedMandi.name === loc.name;
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

          {/* Time Horizon */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Time Horizon
            </label>
            <div className="relative">
              <select
                value={limitDays}
                onChange={(e) => setLimitDays(Number(e.target.value))}
                className="w-full bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer appearance-none"
              >
                {LIMIT_OPTIONS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Location Notice */}
        {locationNotice && (
          <div className="text-xs text-emerald-900 font-bold flex items-center gap-2 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 animate-in fade-in">
            <Info className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>{locationNotice}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={fetchMarketData}
          disabled={loading}
          className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Fetching APMC Spot Data...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Fetch Market Data & Spot Prices</span>
            </>
          )}
        </button>
      </div>

      {/* Sub-Tabs for In-Depth Data */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 pb-2">
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
          📈 Price Trends Chart
        </button>
        <button
          onClick={() => setActiveTab('arrivals')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'arrivals' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          📦 Mandi Arrival Volumes
        </button>
        <button
          onClick={() => setActiveTab('provider')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'provider' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          🌐 Provider Telemetry
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Results Section */}
      {!loading && (
        <div className="space-y-6 pt-2">
          {/* TAB 1: Mandi Snapshots */}
          {activeTab === 'snapshots' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    Current Mandi Spot Price Snapshots ({commodity})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Latest observed modal, minimum, and maximum prices across regional APMCs.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {snapshotsData.length} Mandis Reporting
                </span>
              </div>

              {snapshotsData.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  No active mandi snapshots found for {commodity}.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {snapshotsData.map((snap, idx) => {
                    const modalPerQuintal =
                      snap.currentModalPrice ??
                      snap.modalPrice ??
                      (snap.minPrice && snap.maxPrice ? Math.round((snap.minPrice + snap.maxPrice) / 2) : 0);
                    const modalPerKg =
                      snap.currentModalPricePerKg ??
                      snap.modalPricePerKg ??
                      (modalPerQuintal ? (modalPerQuintal / 100).toFixed(2) : '0.00');
                    const minPrice = snap.minPrice ?? 0;
                    const maxPrice = snap.maxPrice ?? 0;
                    const marketName = formatMarketName(snap.market);
                    const locationText = [snap.district, snap.state].filter(Boolean).join(', ');

                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between gap-4 shadow-2xs"
                      >
                        {/* 1. Header Badges: State Pill & Live Trend Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 whitespace-nowrap flex-shrink-0">
                            {snap.state || 'APMC Mandi'}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 shadow-2xs ${
                              snap.trend === 'RISING'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : snap.trend === 'FALLING'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : snap.trend === 'LIVE_AUCTION'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {snap.trend === 'RISING' && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                            {snap.trend === 'FALLING' && <TrendingDown className="w-3 h-3 text-rose-600" />}
                            {snap.trend === 'LIVE_AUCTION' && <Activity className="w-3 h-3 text-amber-600" />}
                            {snap.trend ? snap.trend.replace(/_/g, ' ') : 'STABLE'}
                          </span>
                        </div>

                        {/* 2. Full-Width Market Name & Full Location */}
                        <div className="space-y-1">
                          <h4 className="text-base font-black text-slate-900 leading-snug">
                            {marketName}
                          </h4>
                          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 pt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                            <span className="truncate">{locationText || 'Regional Market'}</span>
                          </div>
                        </div>

                        {/* 3. Systematic Pricing Box */}
                        <div className="pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-3 items-end">
                          {/* Left Box: Per KG Rate */}
                          <div className="bg-emerald-50/60 p-2.5 rounded-2xl border border-emerald-100/80">
                            <span className="text-[10px] text-emerald-800 uppercase font-black tracking-wider block">
                              Modal Rate
                            </span>
                            <div className="text-xl font-black text-emerald-800 whitespace-nowrap leading-tight mt-0.5">
                              ₹{modalPerKg}
                              <span className="text-xs font-bold text-emerald-600 ml-0.5">/kg</span>
                            </div>
                          </div>

                          {/* Right Box: Per Quintal & Range */}
                          <div className="text-right flex flex-col justify-end">
                            <span className="text-xs font-black text-slate-800 whitespace-nowrap">
                              ₹{Number(modalPerQuintal).toLocaleString('en-IN')}{' '}
                              <span className="text-[11px] text-slate-500 font-semibold">/ q</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap mt-0.5 block">
                              ₹{Number(minPrice).toLocaleString('en-IN')} – ₹{Number(maxPrice).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Historical Price Trends */}
          {activeTab === 'prices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    Historical Modal Price Trends ({commodity})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Day-by-day modal price curve across reporting dates.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {priceChartData.length} Data Points
                </span>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={priceChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} unit="₹" />
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
                      <Line type="monotone" dataKey="modalPrice" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} name="Modal Price (₹/q)" />
                      <Line type="monotone" dataKey="minPrice" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="3 3" name="Min Price" />
                      <Line type="monotone" dataKey="maxPrice" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="3 3" name="Max Price" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Arrival Volumes */}
          {activeTab === 'arrivals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    Mandi Intake & Arrival Volume ({commodity})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Physical quantity arriving at mandis in tonnes.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {arrivalChartData.length} Records
                </span>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={arrivalChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} unit="T" />
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
                      <Bar dataKey="arrivalTonnes" fill="#10B981" radius={[6, 6, 0, 0]} name="Arrival Volume (Tonnes)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Provider Telemetry */}
          {activeTab === 'provider' && providerStatus && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> Multi-Source Telemetry & System Health
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Market Data Provider</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {providerStatus.market?.activeProvider || 'Agmarknet / APMC'}
                  </span>
                  <p className="text-[11px] text-slate-500">Status: {providerStatus.market?.status || 'READY'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Weather Provider</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                    {providerStatus.weather?.activeProvider || 'Open-Meteo API'}
                  </span>
                  <p className="text-[11px] text-slate-500">Status: {providerStatus.weather?.status || 'ACTIVE_LIVE'}</p>
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
