import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

const ConsumerMarketplace = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [grade, setGrade] = useState('ALL');
  const [district, setDistrict] = useState('');
  const [sort, setSort] = useState('newest');

  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState('');

  const { addToCart, maxConsumerLimitKg } = useCart();
  const { user } = useAuth();

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        category: category !== 'ALL' ? category : '',
        grade: grade !== 'ALL' ? grade : '',
        district,
        sort,
      };
      const { data } = await API.get('/products', { params });
      if (data.success) {
        setListings(data.listings);
      }
    } catch (err) {
      console.error('Fetch listings error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, grade, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleAddToCart = (listing) => {
    setToastMessage('');
    setToastError('');
    try {
      addToCart(listing, 1);
      setToastMessage(`Added 1 kg of ${listing.cropName} to cart!`);
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      setToastError(err.message);
      setTimeout(() => setToastError(''), 6000);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-emerald-700/50">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Direct Farm Marketplace
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Fresh Produce Directly From Indian Farmers
              </h1>
              <p className="text-xs text-emerald-200/90 font-medium max-w-xl">
                Direct Farm-to-Buyer Marketplace • Verified Quality Grades • Batch QR Traceability
              </p>
              {user?.role === 'CONSUMER' && (
                <div className="inline-block mt-2 bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs px-3 py-1.5 rounded-xl font-semibold">
                  ℹ️ Consumer Purchase Limit Active: Max <b>{maxConsumerLimitKg} kg</b> per order to ensure fair retail distribution.
                </div>
              )}
            </div>
          </div>

          {/* Farmer / FPO Quick Actions Bar */}
          {(user?.role === 'FARMER' || user?.role === 'FPO') && (
            <div className="bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-600/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-950 dark:text-emerald-100 uppercase tracking-wider">
                    Farmer & FPO Management Panel
                  </h4>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                    List new harvest batches, manage stock, or compare mandi net realization before selling.
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
                  className="px-4 py-2 rounded-xl bg-white dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-all flex items-center gap-1.5"
                >
                  <Layers className="w-4 h-4" /> My Produce Listings
                </Link>
                <Link
                  to="/market-intelligence"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <TrendingUp className="w-4 h-4" /> Mandi Optimizer
                </Link>
              </div>
            </div>
          )}

          {/* Toast Notification Alert */}
          {toastMessage && (
            <div className="p-4 bg-emerald-100 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-200 text-xs font-bold rounded-2xl flex items-center justify-between shadow-sm">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {toastMessage}</span>
              <Link to="/cart" className="underline font-extrabold text-emerald-800 dark:text-emerald-300">Go to Cart & Checkout →</Link>
            </div>
          )}

          {toastError && (
            <div className="p-4 bg-rose-100 dark:bg-rose-950/90 border border-rose-300 dark:border-rose-500/50 text-rose-900 dark:text-rose-200 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{toastError}</span>
            </div>
          )}

          {/* Search & Filters Bar */}
          <div className="agri-card space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 dark:text-emerald-400/60 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search produce (e.g. Tomato, Potato, Wheat...)"
                  className="agri-input w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District (e.g. Karnal)"
                  className="agri-input w-36 px-4 py-2.5 rounded-2xl text-xs font-medium"
                />

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="agri-input px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-800 dark:text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-md"
                >
                  Filter
                </button>
              </div>
            </form>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="font-bold text-slate-500 dark:text-emerald-300 mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Category:
              </span>
              {['ALL', 'VEGETABLES', 'FRUITS', 'GRAINS', 'PULSES', 'SPICES'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold transition-all ${
                    category === cat
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-emerald-950/80 text-slate-700 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                  }`}
                >
                  {cat}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-emerald-800/40">
                <span className="font-bold text-slate-500 dark:text-emerald-300">Grade:</span>
                {['ALL', 'GRADE_A', 'GRADE_B', 'GRADE_C'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      grade === g
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-emerald-950/80 text-slate-700 dark:text-emerald-200'
                    }`}
                  >
                    {g === 'ALL' ? 'All' : g.replace('GRADE_', 'Grade ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Listings Grid */}
          {loading ? (
            <div className="py-20 text-center text-xs font-bold text-slate-500 dark:text-emerald-300 animate-pulse">
              Loading fresh produce listings...
            </div>
          ) : listings.length === 0 ? (
            <div className="agri-card p-12 text-center space-y-3">
              <Sprout className="w-12 h-12 text-emerald-500/60 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No produce listings found</h3>
              <p className="text-xs text-slate-500 dark:text-emerald-300">Try adjusting your category filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <div
                  key={item._id}
                  className="agri-card overflow-hidden flex flex-col justify-between group p-0"
                >
                  <div>
                    {/* Card Image */}
                    <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-emerald-950">
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'}
                        alt={item.cropName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-slate-900/90 dark:bg-emerald-950/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-extrabold text-white border border-white/20 shadow-sm flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" /> {item.grade.replace('GRADE_', 'Grade ')}
                      </div>

                      <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-xl text-[11px] font-extrabold shadow-sm">
                        Quality Score: {item.aiQualityEstimateScore}% (Sample)
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">{item.cropName}</h3>
                          <p className="text-[11px] text-slate-500 dark:text-emerald-300/80 flex items-center gap-1 mt-0.5 font-medium">
                            <MapPin className="w-3 h-3 text-rose-500" /> {item.location?.district}, {item.location?.state}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-emerald-600 dark:text-amber-400">₹{item.pricePerKg}</span>
                          <span className="text-[10px] text-slate-400 font-bold block">/ kg</span>
                        </div>
                      </div>

                      {/* Farmer Info */}
                      <div className="p-3 bg-slate-50 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-emerald-800/40">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                            🌾
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{item.farmer?.name || 'Farmer Partner'}</p>
                            <p className="text-[10px] text-slate-500 dark:text-emerald-300/80 font-medium">Trust Score: 94/100</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                          Verified
                        </span>
                      </div>

                      {/* Harvest Date & Stock */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-emerald-200/80 font-medium pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Harvest: {new Date(item.harvestDate).toLocaleDateString()}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-white">{item.availableQuantityKg.toLocaleString()} kg available</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 flex gap-2">
                    <Link
                      to={`/product/${item._id}`}
                      className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-700/60 text-center text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-emerald-900/60 transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add
                    </button>
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
