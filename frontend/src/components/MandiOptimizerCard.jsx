import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  Navigation,
  Scale,
  Sparkles,
  Search,
  Sprout,
  Package,
  X,
} from 'lucide-react';

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
  { name: 'Panipat, Haryana', district: 'Panipat', state: 'Haryana', lat: 29.3909, lng: 76.9635 },
  { name: 'Ambala, Haryana', district: 'Ambala', state: 'Haryana', lat: 30.3782, lng: 76.7767 },
  { name: 'Kurukshetra, Haryana', district: 'Kurukshetra', state: 'Haryana', lat: 29.9695, lng: 76.8783 },
  { name: 'Sonipat, Haryana', district: 'Sonipat', state: 'Haryana', lat: 28.9931, lng: 77.0151 },
  { name: 'Rohtak, Haryana', district: 'Rohtak', state: 'Haryana', lat: 28.8955, lng: 76.6066 },
  { name: 'Gurugram, Haryana', district: 'Gurugram', state: 'Haryana', lat: 28.4595, lng: 77.0266 },
  { name: 'Azadpur, Delhi', district: 'North Delhi', state: 'Delhi', lat: 28.7112, lng: 77.1788 },
  { name: 'Ghazipur, Delhi', district: 'East Delhi', state: 'Delhi', lat: 28.6258, lng: 77.3274 },
  { name: 'Okhla, Delhi', district: 'South Delhi', state: 'Delhi', lat: 28.5355, lng: 77.2728 },
  { name: 'Agra, Uttar Pradesh', district: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
  { name: 'Mathura, Uttar Pradesh', district: 'Mathura', state: 'Uttar Pradesh', lat: 27.4924, lng: 77.6737 },
  { name: 'Aligarh, Uttar Pradesh', district: 'Aligarh', state: 'Uttar Pradesh', lat: 27.8974, lng: 78.0880 },
  { name: 'Meerut, Uttar Pradesh', district: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lng: 77.7064 },
  { name: 'Bareilly, Uttar Pradesh', district: 'Bareilly', state: 'Uttar Pradesh', lat: 28.3670, lng: 79.4304 },
  { name: 'Lucknow, Uttar Pradesh', district: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { name: 'Kanpur, Uttar Pradesh', district: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319 },
  { name: 'Varanasi, Uttar Pradesh', district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  { name: 'Ballia, Uttar Pradesh', district: 'Ballia', state: 'Uttar Pradesh', lat: 25.7610, lng: 84.1497 },
  { name: 'Jalandhar, Punjab', district: 'Jalandhar', state: 'Punjab', lat: 31.3260, lng: 75.5762 },
  { name: 'Ludhiana, Punjab', district: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573 },
  { name: 'Amritsar, Punjab', district: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723 },
  { name: 'Patiala, Punjab', district: 'Patiala', state: 'Punjab', lat: 30.3398, lng: 76.3869 },
  { name: 'Nashik, Maharashtra', district: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898 },
  { name: 'Lasalgaon, Maharashtra', district: 'Nashik', state: 'Maharashtra', lat: 20.1444, lng: 74.2281 },
  { name: 'Pune, Maharashtra', district: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Vashi Navi Mumbai, Maharashtra', district: 'Thane', state: 'Maharashtra', lat: 19.0771, lng: 72.9986 },
  { name: 'Kolar, Karnataka', district: 'Kolar', state: 'Karnataka', lat: 13.1378, lng: 78.1293 },
  { name: 'Bengaluru, Karnataka', district: 'Bengaluru', state: 'Karnataka', lat: 13.0238, lng: 77.5529 },
  { name: 'Ernakulam, Kerala', district: 'Ernakulam', state: 'Kerala', lat: 9.9489, lng: 76.3470 },
  { name: 'Jaipur, Rajasthan', district: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Indore, Madhya Pradesh', district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
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

const MandiOptimizerCard = ({ defaultCommodity = 'Tomato' }) => {
  const { user } = useAuth();

  // Produce State
  const [commodity, setCommodity] = useState(defaultCommodity);
  const [cropSearch, setCropSearch] = useState(defaultCommodity);
  const [cropDropdownOpen, setCropDropdownOpen] = useState(false);
  const [farmerListings, setFarmerListings] = useState([]);

  // Quantity & Units
  const [quantity, setQuantity] = useState(25);
  const [unit, setUnit] = useState('quintal'); // 'kg' | 'quintal' | 'tonnes'

  // Location State
  const [selectedLocation, setSelectedLocation] = useState(PRESET_LOCATIONS[0]);
  const [locationSearch, setLocationSearch] = useState(PRESET_LOCATIONS[0].name);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [isUsingGps, setIsUsingGps] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');

  // Search Radius & Calculation
  const [maxDistanceKm, setMaxDistanceKm] = useState(300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

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

  // 5. Select Produce from "Your Produce" Listing
  const handleSelectFarmerListing = (listing) => {
    const crop = listing.cropName || 'Tomato';
    setCommodity(crop);
    setCropSearch(crop);

    if (listing.quantityKg) {
      if (unit === 'quintal') {
        setQuantity(Math.max(1, Math.round(listing.quantityKg / 100)));
      } else if (unit === 'tonnes') {
        setQuantity(Math.max(0.1, Number((listing.quantityKg / 1000).toFixed(1))));
      } else {
        setQuantity(listing.quantityKg);
      }
    }

    setCropDropdownOpen(false);
  };

  // 6. Select Produce from All Crops
  const handleSelectCommodity = (cropName) => {
    setCommodity(cropName);
    setCropSearch(cropName);
    setCropDropdownOpen(false);
  };

  // 7. Select Location from Suggestion
  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setLocationSearch(loc.name);
    setLocationNotice('');
    setLocationDropdownOpen(false);
  };

  // 8. Geolocation Auto-Detection (Option A: Use My Location)
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

        // Match closest district/city from platform directory
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

  // 9. Run Mandi Optimization
  const runOptimization = async () => {
    setLoading(true);
    setError('');

    try {
      let quantityKg = Number(quantity);
      if (unit === 'quintal') quantityKg = quantity * 100;
      else if (unit === 'tonnes') quantityKg = quantity * 1000;

      const payload = {
        commodity,
        quantityKg,
        farmerLocation: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          district: selectedLocation.district,
          state: selectedLocation.state,
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

  // Auto-run on initial mount or change
  useEffect(() => {
    runOptimization();
  }, [commodity, selectedLocation, maxDistanceKm]);

  const recommended = result?.recommendedMandi;
  const baseline = result?.baselineLocalMandi;
  const alternatives = result?.rankedAlternatives || [];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-7">
      {/* 1. Header (Active Tool badge removed per UX spec) */}
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

      {/* 2. Modernized Inputs (Searchable Produce & Location Autocomplete) */}
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
              LOCATION INPUT: Search City/District with "Use My Location" GPS Action
             ========================================================================= */}
          <div className="space-y-1.5 relative" ref={locationDropdownRef}>
            <div className="flex items-center justify-between min-h-[22px] gap-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 truncate min-w-0">
                <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="truncate">Your Location</span>
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
                value={locationSearch}
                onChange={(e) => {
                  setLocationSearch(e.target.value);
                  setLocationDropdownOpen(true);
                }}
                onFocus={() => setLocationDropdownOpen(true)}
                placeholder="Search city, district or area..."
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
                  Suggested Mandis & Districts
                </span>
                <div className="space-y-0.5 mt-1">
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((loc) => {
                      const isSelected = selectedLocation.name === loc.name;
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
        </div>

        {/* Location Notice (Friendly Geolocation status without raw coordinates) */}
        {locationNotice && (
          <div className="text-xs text-emerald-900 font-bold flex items-center gap-2 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 animate-in fade-in">
            <Info className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>{locationNotice}</span>
          </div>
        )}

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

      {/* 3. Optimization Error Notification */}
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
