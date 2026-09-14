import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
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
  Sparkles,
  Info,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  Sprout,
  ChevronDown,
  ShieldCheck,
  Navigation,
  Package,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
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

const PRESET_LOCATIONS = [
  { name: 'Karnal, Haryana', district: 'Karnal', state: 'Haryana', lat: 29.6857, lng: 76.9905, mandi: 'Karnal Mandi' },
  { name: 'Azadpur, Delhi', district: 'North Delhi', state: 'Delhi', lat: 28.7112, lng: 77.1788, mandi: 'Azadpur APMC Mandi' },
  { name: 'Ghazipur, Delhi', district: 'East Delhi', state: 'Delhi', lat: 28.6258, lng: 77.3274, mandi: 'Ghazipur Mandi' },
  { name: 'Panipat, Haryana', district: 'Panipat', state: 'Haryana', lat: 29.3909, lng: 76.9635, mandi: 'Panipat Mandi' },
  { name: 'Ambala, Haryana', district: 'Ambala', state: 'Haryana', lat: 30.3782, lng: 76.7767, mandi: 'Ambala City Mandi' },
  { name: 'Kurukshetra, Haryana', district: 'Kurukshetra', state: 'Haryana', lat: 29.9695, lng: 76.8783, mandi: 'Kurukshetra Mandi' },
  { name: 'Sonipat, Haryana', district: 'Sonipat', state: 'Haryana', lat: 28.9931, lng: 77.0151, mandi: 'Sonipat Mandi' },
  { name: 'Rohtak, Haryana', district: 'Rohtak', state: 'Haryana', lat: 28.8955, lng: 76.6066, mandi: 'Rohtak Mandi' },
  { name: 'Gurugram, Haryana', district: 'Gurugram', state: 'Haryana', lat: 28.4595, lng: 77.0266, mandi: 'Gurugram Mandi' },
  { name: 'Agra, Uttar Pradesh', district: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081, mandi: 'Agra Mandi' },
  { name: 'Mathura, Uttar Pradesh', district: 'Mathura', state: 'Uttar Pradesh', lat: 27.4924, lng: 77.6737, mandi: 'Mathura Mandi' },
  { name: 'Aligarh, Uttar Pradesh', district: 'Aligarh', state: 'Uttar Pradesh', lat: 27.8974, lng: 78.0880, mandi: 'Aligarh Mandi' },
  { name: 'Meerut, Uttar Pradesh', district: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lng: 77.7064, mandi: 'Meerut Mandi' },
  { name: 'Bareilly, Uttar Pradesh', district: 'Bareilly', state: 'Uttar Pradesh', lat: 28.3670, lng: 79.4304, mandi: 'Bareilly Mandi' },
  { name: 'Lucknow, Uttar Pradesh', district: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, mandi: 'Lucknow Mandi' },
  { name: 'Kanpur, Uttar Pradesh', district: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319, mandi: 'Kanpur Mandi' },
  { name: 'Varanasi, Uttar Pradesh', district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739, mandi: 'Varanasi Mandi' },
  { name: 'Jalandhar, Punjab', district: 'Jalandhar', state: 'Punjab', lat: 31.3260, lng: 75.5762, mandi: 'Jalandhar Cantt Mandi' },
  { name: 'Ludhiana, Punjab', district: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573, mandi: 'Ludhiana Mandi' },
  { name: 'Amritsar, Punjab', district: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723, mandi: 'Amritsar Mandi' },
  { name: 'Nashik, Maharashtra', district: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898, mandi: 'Nashik Mandi' },
  { name: 'Lasalgaon, Maharashtra', district: 'Nashik', state: 'Maharashtra', lat: 20.1444, lng: 74.2281, mandi: 'Lasalgaon Mandi' },
  { name: 'Pune, Maharashtra', district: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, mandi: 'Pune Mandi' },
  { name: 'Jaipur, Rajasthan', district: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, mandi: 'Jaipur Mandi' },
  { name: 'Indore, Madhya Pradesh', district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, mandi: 'Indore Mandi' },
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

const WeatherForecastCard = ({ defaultCommodity = 'Tomato', defaultMarket = 'Karnal Mandi' }) => {
  const { user } = useAuth();

  // Produce State
  const [commodity, setCommodity] = useState(defaultCommodity);
  const [cropSearch, setCropSearch] = useState(defaultCommodity);
  const [cropDropdownOpen, setCropDropdownOpen] = useState(false);
  const [farmerListings, setFarmerListings] = useState([]);

  // Location / Mandi State
  const initialLoc = PRESET_LOCATIONS.find((l) => l.mandi?.toLowerCase() === defaultMarket.toLowerCase()) || PRESET_LOCATIONS[0];
  const [selectedLocation, setSelectedLocation] = useState(initialLoc);
  const [locationSearch, setLocationSearch] = useState(initialLoc.name);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [isUsingGps, setIsUsingGps] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');

  const [weatherData, setWeatherData] = useState(null);
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
        loc.state.toLowerCase().includes(query) ||
        (loc.mandi && loc.mandi.toLowerCase().includes(query))
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
        l.district.toLowerCase() === val.trim().toLowerCase() ||
        (l.mandi && l.mandi.toLowerCase() === val.trim().toLowerCase())
    );
    if (match) {
      setSelectedLocation(match);
    } else if (val.trim()) {
      setSelectedLocation({
        name: val,
        district: val,
        state: '',
        mandi: val,
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
          if (loc.lat && loc.lng) {
            const d = Math.sqrt(Math.pow(loc.lat - lat, 2) + Math.pow(loc.lng - lng, 2));
            if (d < minDistance) {
              minDistance = d;
              closest = loc;
            }
          }
        });

        const detectedLoc = {
          name: closest.name,
          district: closest.district,
          state: closest.state,
          mandi: closest.mandi,
          lat,
          lng,
          isDetected: true,
        };

        setSelectedLocation(detectedLoc);
        setLocationSearch(closest.name);
        setIsUsingGps(false);
        setLocationNotice(`📍 Detected GPS Location: ${closest.name}`);
      },
      (err) => {
        setIsUsingGps(false);
        setLocationNotice('Location access unavailable. You can search your area manually.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    try {
      const loc = selectedLocation || PRESET_LOCATIONS[0];
      const res = await API.get('/market-data/weather', {
        params: {
          market: loc.mandi || loc.name || locationSearch || 'Karnal Mandi',
          district: loc.district || loc.name || locationSearch || 'Karnal',
          state: loc.state || '',
          lat: loc.lat || undefined,
          lon: loc.lng || loc.lon || undefined,
          commodity,
        },
      });

      if (res.data?.success && res.data.weather) {
        setWeatherData(res.data.weather);
      } else {
        setError('Unable to load meteorological forecast.');
      }
    } catch (err) {
      console.error('[WeatherForecastCard Error]', err);
      setError(err.response?.data?.message || 'Error connecting to weather service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [selectedLocation, commodity]);

  // Format weather forecast chart data safely
  const weatherChartData = React.useMemo(() => {
    if (!weatherData?.forecast || !Array.isArray(weatherData.forecast)) return [];
    return weatherData.forecast.map((f) => {
      let dateLabel = f.date;
      try {
        const d = new Date(f.date);
        if (!isNaN(d.getTime())) {
          dateLabel = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
        }
      } catch (e) {
        dateLabel = f.date;
      }

      return {
        date: dateLabel,
        tempMax: f.tempMax,
        tempMin: f.tempMin,
        precipitationSum: f.precipitationSum,
        rainProb: f.precipitationProbabilityMax || 0,
      };
    });
  }, [weatherData]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-7">
      {/* 1. Header (Active Tool badge removed per UX spec) */}
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

      {/* 2. Modernized Inputs (Searchable Produce & Location Autocomplete) */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              LOCATION INPUT: Search City/District/Mandi with "Use My Location" GPS Action
             ========================================================================= */}
          <div className="space-y-1.5 relative" ref={locationDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                Target Mandi / Route Location
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
                placeholder="Search city, district or mandi..."
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
                  Suggested Mandis & Transit Routes
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
          onClick={fetchWeather}
          disabled={loading}
          className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Fetching Live Weather Feeds...</span>
            </>
          ) : (
            <>
              <CloudSun className="w-4 h-4" />
              <span>Check Weather & Route Transit</span>
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
      {!loading && weatherData && (
        <div className="space-y-6 pt-2 border-t border-slate-100">
          {/* Current Weather Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100 flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600 flex-shrink-0">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Temperature</span>
                <span className="text-xl font-black text-slate-900">
                  {weatherData.current?.temperature} {weatherData.current?.temperatureUnit || '°C'}
                </span>
                <span className="text-[10px] text-amber-700 font-bold block">{weatherData.current?.weatherLabel || 'Clear Sky'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50/50 border border-blue-100 flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600 flex-shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Humidity</span>
                <span className="text-xl font-black text-slate-900">
                  {weatherData.current?.relativeHumidity} {weatherData.current?.humidityUnit || '%'}
                </span>
                <span className="text-[10px] text-blue-700 font-medium block">
                  {weatherData.current?.relativeHumidity > 80 ? 'High Moisture' : 'Optimal Transit'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50/50 border border-indigo-100 flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600 flex-shrink-0">
                <Umbrella className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Current Rain</span>
                <span className="text-xl font-black text-slate-900">
                  {weatherData.current?.precipitation || 0} {weatherData.current?.precipitationUnit || 'mm'}
                </span>
                <span className="text-[10px] text-indigo-700 font-medium block">
                  7d Rain: {weatherData.advisories?.totalForecastRainMm || 0}mm
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50/50 border border-teal-100 flex items-center gap-3">
              <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-600 flex-shrink-0">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Wind Speed</span>
                <span className="text-xl font-black text-slate-900">
                  {weatherData.current?.windSpeed || 0} {weatherData.current?.windSpeedUnit || 'km/h'}
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
                Climate Risk: {weatherData.advisories?.riskLevel || 'LOW'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-3 bg-white/80 rounded-2xl border border-white/60 space-y-1">
                <span className="font-extrabold block text-[11px] text-slate-900">🚚 Mandi Transit & Route:</span>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {weatherData.advisories?.mandiTransportImpact || 'Clear road conditions expected. Safe for transport.'}
                </p>
              </div>

              <div className="p-3 bg-white/80 rounded-2xl border border-white/60 space-y-1">
                <span className="font-extrabold block text-[11px] text-slate-900">🌾 Harvesting Operations:</span>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {weatherData.advisories?.harvestAdvisory || 'Favorable dry weather for crop harvesting.'}
                </p>
              </div>

              <div className="p-3 bg-white/80 rounded-2xl border border-white/60 space-y-1">
                <span className="font-extrabold block text-[11px] text-slate-900">📦 Storage & Aeration:</span>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {weatherData.advisories?.storageAdvisory || 'Standard ventilation recommended.'}
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
          <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">7-Day Temperature & Rain Probability Trend</span>
              <span className="text-[10px] text-slate-400">Location: {weatherData.location?.district || selectedLocation?.name || 'Selected Region'}</span>
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
    </div>
  );
};

export default WeatherForecastCard;
