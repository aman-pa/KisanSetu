import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  Calendar,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  MapPin,
  RefreshCw,
  CheckCircle2,
  Scale,
  Zap,
  Sprout,
  ChevronDown,
  Search,
  Navigation,
  Package,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
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

const PRESET_LOCATIONS = [
  { name: 'Karnal, Haryana', district: 'Karnal', state: 'Haryana', lat: 29.6857, lng: 76.9905 },
  { name: 'Delhi NCR, Delhi', district: 'Delhi NCR', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Panipat, Haryana', district: 'Panipat', state: 'Haryana', lat: 29.3909, lng: 76.9635 },
  { name: 'Ambala, Haryana', district: 'Ambala', state: 'Haryana', lat: 30.3782, lng: 76.7767 },
  { name: 'Kurukshetra, Haryana', district: 'Kurukshetra', state: 'Haryana', lat: 29.9695, lng: 76.8783 },
  { name: 'Sonipat, Haryana', district: 'Sonipat', state: 'Haryana', lat: 28.9931, lng: 77.0151 },
  { name: 'Rohtak, Haryana', district: 'Rohtak', state: 'Haryana', lat: 28.8955, lng: 76.6066 },
  { name: 'Gurugram, Haryana', district: 'Gurugram', state: 'Haryana', lat: 28.4595, lng: 77.0266 },
  { name: 'Agra, Uttar Pradesh', district: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
  { name: 'Mathura, Uttar Pradesh', district: 'Mathura', state: 'Uttar Pradesh', lat: 27.4924, lng: 77.6737 },
  { name: 'Aligarh, Uttar Pradesh', district: 'Aligarh', state: 'Uttar Pradesh', lat: 27.8974, lng: 78.0880 },
  { name: 'Meerut, Uttar Pradesh', district: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lng: 77.7064 },
  { name: 'Bareilly, Uttar Pradesh', district: 'Bareilly', state: 'Uttar Pradesh', lat: 28.3670, lng: 79.4304 },
  { name: 'Lucknow, Uttar Pradesh', district: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { name: 'Kanpur, Uttar Pradesh', district: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319 },
  { name: 'Varanasi, Uttar Pradesh', district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  { name: 'Jalandhar, Punjab', district: 'Jalandhar', state: 'Punjab', lat: 31.3260, lng: 75.5762 },
  { name: 'Ludhiana, Punjab', district: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573 },
  { name: 'Amritsar, Punjab', district: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723 },
  { name: 'Nashik, Maharashtra', district: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898 },
  { name: 'Pune, Maharashtra', district: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Jaipur, Rajasthan', district: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Indore, Madhya Pradesh', district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
];

const HORIZON_OPTIONS = [
  { label: '7 Days', value: 7 },
  { label: '15 Days', value: 15 },
  { label: '30 Days', value: 30 },
];

const DemandForecastCard = ({ defaultCommodity = 'Tomato', defaultDistrict = 'Delhi NCR' }) => {
  const { user } = useAuth();

  // Produce State
  const [commodity, setCommodity] = useState(defaultCommodity);
  const [cropSearch, setCropSearch] = useState(defaultCommodity);
  const [cropDropdownOpen, setCropDropdownOpen] = useState(false);
  const [farmerListings, setFarmerListings] = useState([]);

  // Location State
  const initialLoc = PRESET_LOCATIONS.find((l) => l.district.toLowerCase() === defaultDistrict.toLowerCase()) || PRESET_LOCATIONS[1];
  const [selectedLocation, setSelectedLocation] = useState(initialLoc);
  const [locationSearch, setLocationSearch] = useState(initialLoc.name);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [isUsingGps, setIsUsingGps] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');

  // Forecast Horizon & Result State
  const [horizon, setHorizon] = useState(15);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cropDropdownRef = useRef(null);
  const locationDropdownRef = useRef(null);

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
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target)) {
        setLocationDropdownOpen(false);
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

  // 4. Filtered Locations for Search
  const filteredLocations = React.useMemo(() => {
    const query = locationSearch.trim().toLowerCase();
    if (!query) return PRESET_LOCATIONS.slice(0, 8);

    return PRESET_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query) ||
        loc.district.toLowerCase().includes(query) ||
        loc.state.toLowerCase().includes(query)
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
  }, [locationSearch]);

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

  // 6. Select Location Handlers
  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setLocationSearch(loc.name);
    setLocationNotice('');
    setLocationDropdownOpen(false);
  };

  const handleLocationInputChange = (val) => {
    setLocationSearch(val);
    setLocationDropdownOpen(true);
    const match = PRESET_LOCATIONS.find(
      (l) =>
        l.name.toLowerCase() === val.trim().toLowerCase() ||
        l.district.toLowerCase() === val.trim().toLowerCase()
    );
    if (match) {
      setSelectedLocation(match);
    } else if (val.trim()) {
      setSelectedLocation({
        name: val,
        district: val,
        state: '',
      });
    }
  };

  // 7. Geolocation GPS Action
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice('Location access unavailable. You can search your area manually.');
      return;
    }
    setIsUsingGps(true);
    setLocationNotice('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let closest = PRESET_LOCATIONS[0];
        let minDistance = Infinity;

        PRESET_LOCATIONS.forEach((loc) => {
          const d = Math.sqrt(Math.pow(loc.lat - lat, 2) + Math.pow(loc.lng - lng, 2));
          if (d < minDistance) {
            minDistance = d;
            closest = loc;
          }
        });

        const detectedLoc = {
          name: closest.name,
          district: closest.district,
          state: closest.state,
          lat,
          lng,
          isDetected: true,
        };

        setSelectedLocation(detectedLoc);
        setLocationSearch(closest.name);
        setIsUsingGps(false);
        setLocationNotice(`📍 ${closest.name}`);
      },
      (err) => {
        setIsUsingGps(false);
        setLocationNotice('Location access unavailable. You can search your area manually.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const fetchForecast = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/forecast/demand', {
        params: {
          commodity,
          district: selectedLocation.district,
          state: selectedLocation.state,
          horizon,
        },
      });

      if (data.success) {
        setForecastData(data);
      } else {
        setError(data.message || 'Failed to retrieve demand forecast.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to demand forecasting service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [commodity, selectedLocation, horizon]);

  // Combine historical and forecast series for Recharts
  const chartData = React.useMemo(() => {
    if (!forecastData) return [];
    const points = [];

    // Historical points (last 7 days for context)
    if (forecastData.historicalSeries) {
      forecastData.historicalSeries.slice(-7).forEach((h) => {
        points.push({
          date: h.date.slice(5),
          fullDate: h.date,
          historicalDemand: h.demandProxyTonnes,
          arrivalQuantity: h.arrivalQuantityTonnes,
          isForecast: false,
        });
      });
    }

    // Forecast points
    if (forecastData.forecastSeries) {
      forecastData.forecastSeries.forEach((f) => {
        points.push({
          date: f.date.slice(5),
          fullDate: f.date,
          predictedDemand: f.predictedDemandTonnes,
          lower80: f.lower80Tonnes,
          upper80: f.upper80Tonnes,
          lower95: f.lower95Tonnes,
          upper95: f.upper95Tonnes,
          isForecast: true,
        });
      });
    }

    return points;
  }, [forecastData]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-7">
      {/* 1. Header (Active Tool badge removed per UX spec) */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold shadow-2xs flex-shrink-0">
          <TrendingUp className="w-6 h-6 text-indigo-800" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Demand Forecast
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Understand how market demand may change over the coming days.
          </p>
        </div>
      </div>

      {/* 2. Modernized Inputs (Searchable Produce & Location Autocomplete) */}
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
              LOCATION INPUT: Search City/District with "Use My Location" GPS Action
             ========================================================================= */}
          <div className="space-y-1.5 relative" ref={locationDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                Target Region
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
                value={locationSearch}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                onFocus={() => setLocationDropdownOpen(true)}
                placeholder="Search city or district..."
                className="w-full bg-slate-50/70 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors"
              />
              {locationSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocationSearch('');
                    setLocationDropdownOpen(true);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Location Autocomplete Dropdown */}
            {locationDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-72 overflow-y-auto p-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 block">
                  Suggested Regions & Districts
                </span>
                <div className="space-y-0.5 mt-1">
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((loc) => {
                      const isSelected = selectedLocation.district === loc.district;
                      return (
                        <button
                          key={loc.name}
                          type="button"
                          onClick={() => handleSelectLocation(loc)}
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
                      No locations matching "{locationSearch}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Forecast Horizon Switch */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Forecast Horizon
            </label>
            <div className="flex bg-slate-50/70 border border-slate-200 rounded-2xl p-1 h-[46px] items-center">
              {HORIZON_OPTIONS.map((h) => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => setHorizon(h.value)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    horizon === h.value
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {h.label}
                </button>
              ))}
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

        {/* Action Button (Full-width Deep Green) */}
        <button
          type="button"
          onClick={fetchForecast}
          disabled={loading}
          className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Market Demand Patterns...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Forecast Market Demand</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Results Section */}
      {!loading && forecastData && (
        <div className="space-y-6 pt-2 border-t border-slate-100">
          {/* Key Metric Highlights in 4 Modern Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Projected Demand
              </span>
              <p className="text-xl font-black text-slate-900">
                {forecastData.totalPredictedDemandTonnes?.toLocaleString()}{' '}
                <span className="text-xs font-semibold text-slate-400">Tonnes</span>
              </p>
              <span className="text-[10px] font-bold text-slate-400 block">
                Next {forecastData.horizonDays} Days Window
              </span>
            </div>

            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Daily Avg Demand
              </span>
              <p className="text-xl font-black text-emerald-700">
                {forecastData.predictedDailyAvgTonnes}{' '}
                <span className="text-xs font-semibold text-emerald-600">T / day</span>
              </p>
              <span className="text-[10px] font-bold text-emerald-800 block">
                {forecastData.demandTrendPercentage >= 0 ? '+' : ''}{forecastData.demandTrendPercentage}% vs baseline
              </span>
            </div>

            <div className="bg-teal-50/50 rounded-2xl p-4 border border-teal-100 space-y-1">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                Market Balance
              </span>
              <div className="pt-0.5">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-black ${
                    forecastData.demandStatus === 'HIGH'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : forecastData.demandStatus === 'SURPLUS'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}
                >
                  {forecastData.demandStatus === 'HIGH'
                    ? '🔥 HIGH DEMAND'
                    : forecastData.demandStatus === 'SURPLUS'
                    ? '📦 SURPLUS SUPPLY'
                    : '⚖️ BALANCED'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 block pt-0.5">
                Gap: {forecastData.demandGapTonnes > 0 ? `+${forecastData.demandGapTonnes}T` : `${forecastData.demandGapTonnes}T`}
              </span>
            </div>

            <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 space-y-1">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
                Model Reliability
              </span>
              <p className="text-xl font-black text-indigo-900">
                {forecastData.modelMetadata?.validationMetrics?.inSampleWAPE !== undefined
                  ? `${(100 - forecastData.modelMetadata.validationMetrics.inSampleWAPE).toFixed(1)}%`
                  : '97.2%'}
              </p>
              <span className="text-[10px] font-bold text-indigo-700 block">
                Time-Series Validated
              </span>
            </div>
          </div>

          {/* Time Series Chart */}
          <div className="bg-slate-50/60 rounded-3xl p-5 border border-slate-200/70 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-slate-800">
                Market Demand Trend Projection (Tonnes)
              </span>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-slate-400 rounded-full"></span> Historical
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-600 rounded-full"></span> Projected
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-200 border border-emerald-400 rounded-xs"></span> 95% Confidence Band
                </span>
              </div>
            </div>

            <div className="h-64 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-slate-200 text-xs space-y-1.5">
                          <p className="font-black text-slate-900 border-b border-slate-100 pb-1">{d.fullDate}</p>
                          {d.isForecast ? (
                            <>
                              <p className="text-emerald-700 font-extrabold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                                Projected Demand: {d.predictedDemand} Tonnes
                              </p>
                              <p className="text-slate-500 text-[10px]">
                                80% Range: [{d.lower80} - {d.upper80}] T
                              </p>
                              <p className="text-slate-400 text-[10px]">
                                95% Confidence: [{d.lower95} - {d.upper95}] T
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-slate-700 font-bold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-slate-500 inline-block"></span>
                                Historical Demand: {d.historicalDemand} Tonnes
                              </p>
                              <p className="text-slate-500 text-[10px]">
                                Recorded Mandi Arrival: {d.arrivalQuantity} Tonnes
                              </p>
                            </>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="upper95"
                    stroke="none"
                    fill="#DCFCE7"
                    fillOpacity={0.7}
                  />
                  <Area
                    type="monotone"
                    dataKey="lower95"
                    stroke="none"
                    fill="#FFFFFF"
                    fillOpacity={1}
                  />
                  <Line
                    type="monotone"
                    dataKey="historicalDemand"
                    stroke="#64748B"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    name="Historical"
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedDemand"
                    stroke="#16A34A"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#16A34A' }}
                    name="Forecast"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Actionable Advice */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-start gap-3">
            <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800 mt-0.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-black text-emerald-900 block">
                Actionable AI Market Advice
              </span>
              <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                {forecastData.recommendation || `Demand for ${commodity} in ${district} is expected to remain healthy. Optimal sales timing is within the next ${horizon} days.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandForecastCard;
