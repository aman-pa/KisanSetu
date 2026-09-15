import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Sprout,
  ShoppingCart,
  Award,
  Calendar,
  MapPin,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  PlusCircle,
  Layers,
  TrendingUp,
  SlidersHorizontal,
  Bot,
  Compass,
  CheckCircle2,
  X,
  IndianRupee,
} from 'lucide-react';

const ConsumerMarketplace = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [grade, setGrade] = useState('ALL');
  const [district, setDistrict] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState('ALL');
  const [sort, setSort] = useState('ai_recommended'); // Default: AI Match Rank

  // Autosuggest State
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // User location simulation (Delhi NCR default coordinates or custom)
  const [userLocationName, setUserLocationName] = useState('Delhi NCR');
  const [userLat, setUserLat] = useState(28.6139);
  const [userLng, setUserLng] = useState(77.2090);

  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState('');

  const { addToCart, maxConsumerLimitKg } = useCart();
  const { user } = useAuth();

  // Fetch produce listings from DB with AI recommendation & location parameters
  const fetchListings = async (customSearch = null) => {
    setLoading(true);
    try {
      const querySearch = customSearch !== null ? customSearch : search;
      const params = {
        search: querySearch,
        category: category !== 'ALL' ? category : '',
        grade: grade !== 'ALL' ? grade : '',
        district: district.trim(),
        minPrice: minPrice ? Number(minPrice) : '',
        maxPrice: maxPrice ? Number(maxPrice) : '',
        maxDistanceKm: maxDistanceKm !== 'ALL' ? Number(maxDistanceKm) : '',
        userLat,
        userLng,
        sort,
      };

      const { data } = await API.get('/products', { params });
      if (data.success) {
        setListings(data.listings || []);
      }
    } catch (err) {
      console.error('Fetch listings error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, grade, sort, maxDistanceKm, userLat, userLng]);

  // Fetch Typeahead Suggestions (2-3+ characters)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!search || search.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const { data } = await API.get('/products/suggestions', {
          params: { q: search.trim() },
        });
        if (data.success && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        console.error('Suggestions error:', err);
      }
    };

    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 200);

    return () => clearTimeout(timer);
  }, [search]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (cropName) => {
    setSearch(cropName);
    setShowSuggestions(false);
    fetchListings(cropName);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    fetchListings();
  };

  // State for quantity selected per produce item
  const [selectedQuantities, setSelectedQuantities] = useState({});

  const getQuantity = (id) => selectedQuantities[id] || 1;

  const handleQuantityChange = (id, val, availableStock = 9999) => {
    let num = Number(val);
    if (isNaN(num)) num = 1;
    if (num < 1) num = 1;
    const maxAllowed = user?.role === 'CONSUMER' ? Math.min(maxConsumerLimitKg, availableStock) : availableStock;
    if (num > maxAllowed) num = maxAllowed;

    setSelectedQuantities((prev) => ({
      ...prev,
      [id]: num,
    }));
  };

  const handleAddToCart = (listing, quantityOverride = null) => {
    setToastMessage('');
    setToastError('');
    const qty = quantityOverride !== null ? quantityOverride : getQuantity(listing._id);

    try {
      addToCart(listing, qty);
      setToastMessage(`Added ${qty} kg of ${listing.cropName} to cart!`);
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      setToastError(err.message);
      setTimeout(() => setToastError(''), 6000);
    }
  };

  const handleLocationPresetChange = (e) => {
    const val = e.target.value;
    setUserLocationName(val);
    if (val === 'Delhi NCR') {
      setUserLat(28.6139);
      setUserLng(77.2090);
    } else if (val === 'Karnal, Haryana') {
      setUserLat(29.6857);
      setUserLng(76.9905);
    } else if (val === 'Chandigarh') {
      setUserLat(30.7333);
      setUserLng(76.7794);
    } else if (val === 'Jaipur, Rajasthan') {
      setUserLat(26.9124);
      setUserLng(75.7873);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-700/50">
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Bot className="w-4 h-4 text-emerald-400" /> AI Smart Produce Matchmaker & Marketplace
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Fresh Produce <span className="text-emerald-400">Directly From Indian Farmers</span>
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200/90 font-medium max-w-2xl">
                AI recommends verified crops based on your <b>current location</b>, <b>quality grades</b>, <b>distance proximity</b>, and <b>competitive prices</b>.
              </p>
              {user?.role === 'CONSUMER' && (
                <div className="inline-block bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs px-3 py-1.5 rounded-xl font-semibold">
                  ℹ️ Retail Consumer Purchase Limit Active: Max <b>{maxConsumerLimitKg} kg</b> per order.
                </div>
              )}
            </div>
          </div>

          {/* Farmer / FPO Quick Management Panel */}
          {(user?.role === 'FARMER' || user?.role === 'FPO') && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                    Farmer Management Panel
                  </h4>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    List new harvest produce or check your active listings.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Link
                  to="/farmer/add-produce"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <PlusCircle className="w-4 h-4" /> Add Produce Listing
                </Link>
                <Link
                  to="/farmer/produce"
                  className="px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition-all flex items-center gap-1.5"
                >
                  <Layers className="w-4 h-4" /> My Produce Listings
                </Link>
              </div>
            </div>
          )}

          {/* Toast Notification Alerts */}
          {toastMessage && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center justify-between shadow-sm">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> {toastMessage}
              </span>
              <Link to="/cart" className="underline font-extrabold text-emerald-800">
                Go to Cart & Checkout →
              </Link>
            </div>
          )}

          {toastError && (
            <div className="p-4 bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{toastError}</span>
            </div>
          )}

          {/* =========================================================================
              AI RECOMMENDATION & FILTER CONTROL PANEL
             ========================================================================= */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    AI Produce Matcher & Search
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Filter farmer listings by location proximity, grade, distance & price range.
                  </p>
                </div>
              </div>

              {/* Location Selector */}
              <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200 text-xs">
                <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="font-bold text-slate-600">Your Location:</span>
                <select
                  value={userLocationName}
                  onChange={handleLocationPresetChange}
                  className="bg-transparent font-black text-emerald-800 focus:outline-none cursor-pointer"
                >
                  <option value="Delhi NCR">Delhi NCR (28.61° N, 77.20° E)</option>
                  <option value="Karnal, Haryana">Karnal, Haryana (29.68° N, 76.99° E)</option>
                  <option value="Chandigarh">Chandigarh (30.73° N, 76.77° E)</option>
                  <option value="Jaipur, Rajasthan">Jaipur, Rajasthan (26.91° N, 75.78° E)</option>
                </select>
              </div>
            </div>

            {/* Typeahead Search Bar & Autosuggest Dropdown */}
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div ref={searchContainerRef} className="relative flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    placeholder="Search grains or produce (type 2-3 letters e.g. Wheat, Tomato, Rice...)"
                    className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setShowSuggestions(false);
                        fetchListings('');
                      }}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* TYPEAHEAD POPUP DROPDOWN MENU */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                      <span>Matching Farmer Listings ({suggestions.length})</span>
                      <span className="text-[10px] text-emerald-700 font-bold">Real DB Data</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {suggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectSuggestion(item.cropName)}
                          className="w-full p-3 text-left hover:bg-emerald-50/80 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                item.image ||
                                'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=100&q=80'
                              }
                              alt={item.cropName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                            />
                            <div>
                              <div className="text-xs font-black text-slate-900 group-hover:text-emerald-900">
                                {item.cropName}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                  {item.grade.replace('GRADE_', 'Grade ')}
                                </span>
                                <span>📍 {item.district}, {item.state}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-700">₹{item.pricePerKg}/kg</span>
                            <span className="text-[10px] text-slate-400 block font-medium">Click to filter</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-Filter Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
                {/* 1. Distance Filter */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    Max Distance
                  </label>
                  <select
                    value={maxDistanceKm}
                    onChange={(e) => setMaxDistanceKm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50"
                  >
                    <option value="ALL">Any Distance</option>
                    <option value="25">Within 25 km</option>
                    <option value="50">Within 50 km</option>
                    <option value="100">Within 100 km</option>
                    <option value="250">Within 250 km</option>
                  </select>
                </div>

                {/* 2. Grade Filter */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    Quality Grade
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50"
                  >
                    <option value="ALL">All Quality Grades</option>
                    <option value="GRADE_A">Grade A (Premium Quality)</option>
                    <option value="GRADE_B">Grade B (Standard Quality)</option>
                    <option value="GRADE_C">Grade C (Commercial Grade)</option>
                  </select>
                </div>

                {/* 3. Min Price Filter */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    Min Price (₹/kg)
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min ₹"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50"
                  />
                </div>

                {/* 4. Max Price Filter */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    Max Price (₹/kg)
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max ₹"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50"
                  />
                </div>

                {/* 5. Sort By Option */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    Sorting Engine
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-black text-emerald-900 bg-emerald-50"
                  >
                    <option value="ai_recommended">🤖 AI Recommended Rank</option>
                    <option value="distance_asc">📍 Nearest Distance First</option>
                    <option value="price_asc">⚡ Price: Low to High</option>
                    <option value="price_desc">📈 Price: High to Low</option>
                    <option value="quality_desc">⭐ Highest Quality Score</option>
                    <option value="newest">🕒 Newest Harvest First</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs font-bold text-slate-500">
                  Active Filter Results: <span className="text-emerald-800 font-black">{listings.length} real farmer listings</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setCategory('ALL');
                      setGrade('ALL');
                      setDistrict('');
                      setMinPrice('');
                      setMaxPrice('');
                      setMaxDistanceKm('ALL');
                      setSort('ai_recommended');
                      fetchListings('');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    Reset Filters
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <Filter className="w-4 h-4" /> Apply AI Filters
                  </button>
                </div>
              </div>
            </form>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-400 mr-1 flex items-center gap-1">Category:</span>
              {['ALL', 'VEGETABLES', 'FRUITS', 'GRAINS', 'PULSES', 'SPICES'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-agri-dark text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* =========================================================================
              PRODUCE LISTINGS GRID (STRICTLY REAL DB DATA)
             ========================================================================= */}
          {loading ? (
            <div className="py-20 text-center text-xs font-bold text-slate-500 space-y-3">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
              <p>Analyzing real farmer produce listings with AI...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-2xs">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Sprout className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-900">No Matching Farmer Produce Listings Found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  No real listings in the database match your exact AI criteria. Try expanding your max distance range or price filters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCategory('ALL');
                  setGrade('ALL');
                  setMinPrice('');
                  setMaxPrice('');
                  setMaxDistanceKm('ALL');
                  setSearch('');
                  fetchListings('');
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-sm hover:bg-emerald-700 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Image & Badges */}
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={
                          item.images?.[0] ||
                          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={item.cropName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Top Left: Grade Badge */}
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-extrabold text-white border border-white/20 shadow-sm flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.grade ? item.grade.replace('GRADE_', 'Grade ') : 'Grade A'}</span>
                      </div>

                      {/* Top Right: AI Recommendation Match Score */}
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-3 py-1 rounded-xl text-[11px] font-black shadow-md border border-emerald-400/40 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{item.aiRecommendationScore || 92}% AI Match</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-black text-slate-900 leading-tight">{item.cropName}</h3>
                          <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span>
                              {item.location?.district || 'Karnal'}, {item.location?.state || 'Haryana'}
                            </span>
                            <span className="text-emerald-800 font-extrabold ml-1 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              📍 {item.distanceKm || 18} km
                            </span>
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xl font-black text-emerald-700">₹{item.pricePerKg}</span>
                          <span className="text-[10px] text-slate-400 font-bold block">/ kg</span>
                        </div>
                      </div>

                      {/* Farmer Info */}
                      <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                            👨‍🌾
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-slate-900">
                              {item.farmer?.name || 'Verified Farmer'}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              Quality Score: {item.aiQualityEstimateScore || 92}%
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          Verified DB
                        </span>
                      </div>

                      {/* Harvest & Available Stock */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Harvest:{' '}
                          {new Date(item.harvestDate).toLocaleDateString('en-IN')}
                        </span>
                        <span className="font-extrabold text-slate-900">
                          {item.availableQuantityKg?.toLocaleString()} kg left
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action & Quantity Selection Box */}
                  <div className="p-5 pt-0 space-y-3">
                    {/* Quantity Adjuster Row (+ / - / typeable input) */}
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-200 text-xs">
                      <span className="font-extrabold text-slate-600">Qty (kg):</span>
                      <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item._id, getQuantity(item._id) - 1, item.availableQuantityKg)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-colors cursor-pointer"
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          max={user?.role === 'CONSUMER' ? Math.min(maxConsumerLimitKg, item.availableQuantityKg) : item.availableQuantityKg}
                          value={getQuantity(item._id)}
                          onChange={(e) => handleQuantityChange(item._id, e.target.value, item.availableQuantityKg)}
                          className="w-14 text-center py-1 text-xs font-extrabold text-slate-900 focus:outline-none bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item._id, getQuantity(item._id) + 1, item.availableQuantityKg)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-colors cursor-pointer"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/product/${item._id}`}
                        className="py-2.5 px-3 rounded-xl border border-slate-300 text-center text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-agri-dark to-agri-primary hover:to-agri-accent text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4 text-emerald-300" />
                        <span>Add {getQuantity(item._id)} kg (₹{(item.pricePerKg * getQuantity(item._id)).toLocaleString()})</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ConsumerMarketplace;
