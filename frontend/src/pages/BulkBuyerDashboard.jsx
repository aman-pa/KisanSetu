import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import {
  Building2,
  Award,
  Users,
  CheckCircle2,
  Layers,
  MapPin,
  TrendingUp,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  DollarSign,
  Package,
  Calendar,
  Truck,
  Search,
  Filter,
  Clock,
  Plus,
  ShoppingCart,
  AlertCircle,
  ChevronRight,
  Eye,
  Sprout,
  Check,
} from 'lucide-react';

const BulkBuyerDashboard = () => {
  const { user } = useAuth();
  const { addToCart, cartItems } = useCart();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState('PRODUCE_LISTINGS'); // 'PRODUCE_LISTINGS' | 'AI_ENGINE' | 'MY_ORDERS'

  // Listings State
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [maxDistance, setMaxDistance] = useState('ALL');
  const [orderQtyMap, setOrderQtyMap] = useState({});

  // AI Matching Form State
  const [cropName, setCropName] = useState('Tomato');
  const [quantityRequiredKg, setQuantityRequiredKg] = useState(5000);
  const [qualityGrade, setQualityGrade] = useState('GRADE_A');
  const [maxBudgetPerKg, setMaxBudgetPerKg] = useState(30);
  const [district, setDistrict] = useState(user?.address?.city || 'Delhi NCR');

  const [activeRequest, setActiveRequest] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState('');

  // Buyer location coordinates (or defaults)
  const userLat = user?.address?.lat || 28.6139;
  const userLng = user?.address?.lng || 77.2090;

  // Fetch produce listings from farmers / FPOs
  const fetchListings = async () => {
    setListingsLoading(true);
    try {
      const { data } = await API.get('/products', {
        params: {
          userLat,
          userLng,
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          search: searchTerm.trim() ? searchTerm.trim() : undefined,
        },
      });
      if (data.success) {
        setListings(data.listings || []);
      }
    } catch (err) {
      console.error('Failed to fetch produce listings:', err);
    } finally {
      setListingsLoading(false);
    }
  };

  // Fetch bulk buyer's orders history
  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders');
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchOrders();
  }, [selectedCategory, searchTerm]);

  // Handle Quantity Change per Listing
  const handleQtyChange = (listingId, val) => {
    setOrderQtyMap((prev) => ({
      ...prev,
      [listingId]: Math.max(1, Number(val) || 1),
    }));
  };

  // Handle Add to Cart
  const handleAddToCart = (listing) => {
    const qty = orderQtyMap[listing._id] || Math.min(listing.availableQuantityKg, 500);
    addToCart(listing, qty);
    setOrderSuccess(`Added ${qty.toLocaleString()} kg of ${listing.cropName} from ${listing.farmer?.name || 'Farmer'} to your cart! 🛒`);
    setTimeout(() => setOrderSuccess(''), 5000);
  };

  // Handle Direct Bulk Order Placement
  const handleDirectOrder = async (listing) => {
    const qty = orderQtyMap[listing._id] || Math.min(listing.availableQuantityKg, 500);
    setLoading(true);
    setOrderSuccess('');

    try {
      const { data } = await API.post('/orders', {
        items: [{ listingId: listing._id, quantityKg: qty }],
        deliveryAddress: {
          street: user?.address?.street || 'Central Procurement Hub',
          city: user?.address?.city || 'Delhi',
          state: user?.address?.state || 'Delhi NCR',
          pincode: user?.address?.pincode || '110001',
        },
      });

      if (data.success) {
        setOrderSuccess(`Direct Bulk Order #${data.order.orderNumber} placed successfully for ${qty.toLocaleString()} kg ${listing.cropName}! Escrow locked.`);
        fetchOrders();
        fetchListings();
        setActiveTab('MY_ORDERS');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to place direct bulk order.');
    } finally {
      setLoading(false);
    }
  };

  // Handle AI Matching Request
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOrderSuccess('');

    try {
      const { data: reqRes } = await API.post('/bulk/requests', {
        cropName,
        quantityRequiredKg: Number(quantityRequiredKg),
        qualityGrade,
        maxBudgetPerKg: Number(maxBudgetPerKg),
        deliveryLocation: { city: user?.address?.city || 'Delhi', district, state: user?.address?.state || 'Delhi', lat: userLat, lng: userLng },
        requiredDeliveryDate: '2026-09-07',
      });

      if (reqRes.success) {
        setActiveRequest(reqRes.request);
        const { data: matchRes } = await API.get(`/bulk/requests/${reqRes.request._id}/match`);
        if (matchRes.success) {
          setMatchData(matchRes);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Aggregated Package Order
  const handlePlaceAggregatedOrder = async () => {
    if (!matchData || !matchData.aggregationPackage) return;

    setLoading(true);
    try {
      const agg = matchData.aggregationPackage;
      const items = agg.suppliers.map((s) => ({
        listingId: s.listingId,
        quantityKg: s.allocatedQuantityKg,
      }));

      const { data } = await API.post('/orders', {
        items,
        procurementRequestId: activeRequest._id,
        deliveryAddress: {
          street: user?.address?.street || 'Sector 62 DC',
          city: user?.address?.city || 'Noida',
          state: user?.address?.state || 'Delhi NCR',
          pincode: user?.address?.pincode || '201301',
        },
      });

      if (data.success) {
        setOrderSuccess(`Bulk Order #${data.order.orderNumber} placed successfully! ${agg.aggregatedQuantityKg.toLocaleString()} kg aggregated across ${agg.suppliersCount} farmer listings.`);
        fetchOrders();
        fetchListings();
        setActiveTab('MY_ORDERS');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter listings by max distance if requested
  const filteredListings = listings.filter((item) => {
    if (maxDistance === '10') return (item.distanceKm || 18.5) <= 10;
    if (maxDistance === '25') return (item.distanceKm || 18.5) <= 25;
    if (maxDistance === '50') return (item.distanceKm || 18.5) <= 50;
    return true;
  });

  const totalProcurementSpend = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 485000);
  const totalVolumeSourcedKg = orders.reduce((sum, o) => {
    return sum + (o.items ? o.items.reduce((iSum, i) => iSum + (i.quantityKg || 0), 0) : 0);
  }, 18500);

  // Order Status Tracker Helper
  const getStatusStep = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 4;
      case 'SHIPPED':
      case 'IN_TRANSIT':
        return 3;
      case 'ACCEPTED':
      case 'CONFIRMED':
      case 'PROCESSING':
        return 2;
      case 'PENDING':
      default:
        return 1;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>Bulk Procurement Engine</span>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {user?.businessName || user?.name || 'Bulk Supermarket Buyer'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Direct Farmer Sourcing, Real-Time Stock Availability, GPS Distance Calculation & AI Match Engine
            </p>
          </div>

          <Link
            to="/cart"
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-extrabold text-xs shadow-2xs hover:bg-slate-50 flex items-center gap-2 self-start sm:self-auto"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span>Procurement Cart</span>
            {cartItems.length > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {cartItems.length}
              </span>
            )}
          </Link>
        </div>

        {/* Global Success Banner */}
        {orderSuccess && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold rounded-2xl flex items-center justify-between shadow-agri-sm animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              <span>{orderSuccess}</span>
            </span>
            <button
              onClick={() => setOrderSuccess('')}
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 4 Procurement Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Total Procurement Spend</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">₹{totalProcurementSpend.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Direct Farmer Sourcing
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Volume Sourced</span>
              <Package className="w-4 h-4 text-agri-accent" />
            </div>
            <p className="text-2xl font-black text-slate-900">{totalVolumeSourcedKg.toLocaleString()} kg</p>
            <span className="text-[10px] font-bold text-slate-500">Grade A & B Quality</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Active Bulk Orders</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700">{orders.length || 12} Contracts</p>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              100% Escrow Protected
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Active Escrow Funds</span>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">₹1,20,000</p>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
              Protected Escrow
            </span>
          </div>
        </div>

        {/* Tab Switcher Bar */}
        <div className="flex items-center gap-2 bg-slate-200/70 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('PRODUCE_LISTINGS')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'PRODUCE_LISTINGS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>Farmers & FPO Produce Listings</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {filteredListings.length} Available
            </span>
          </button>

          <button
            onClick={() => setActiveTab('AI_ENGINE')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'AI_ENGINE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-agri-gold" />
            <span>AI Bulk Sourcing & Aggregation Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('MY_ORDERS')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'MY_ORDERS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <span>My Bulk Orders & Status Tracking</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {orders.length} Placed
            </span>
          </button>
        </div>

        {/* TAB 1: Farmers & FPO Direct Bulk Listings */}
        {activeTab === 'PRODUCE_LISTINGS' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search produce by crop name (e.g. Tomato, Wheat, Potato)..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="VEGETABLES">Vegetables</option>
                    <option value="FRUITS">Fruits</option>
                    <option value="GRAINS">Grains</option>
                    <option value="PULSES">Pulses</option>
                  </select>
                </div>

                <div>
                  <select
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700"
                  >
                    <option value="ALL">All Distances</option>
                    <option value="10">Within 10 km (Nearby)</option>
                    <option value="25">Within 25 km</option>
                    <option value="50">Within 50 km</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Produce Grid */}
            {listingsLoading ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400 animate-pulse">
                Fetching real-time Farmer & FPO produce listings...
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-100 shadow-2xs">
                <Sprout className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No produce listings found</h3>
                <p className="text-xs text-slate-500">Try adjusting your crop search or distance filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredListings.map((item) => {
                  const dist = item.distanceKm || 18.5;
                  const isNearby = dist <= 10;
                  const requestedQty = orderQtyMap[item._id] || Math.min(item.availableQuantityKg, 500);

                  return (
                    <div
                      key={item._id}
                      className="bg-white rounded-3xl border border-slate-100 shadow-agri-sm hover:shadow-agri-md transition-all overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Banner */}
                        <div className="h-44 bg-slate-100 relative overflow-hidden">
                          <img
                            src={
                              item.images?.[0] ||
                              'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'
                            }
                            alt={item.cropName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            <span className="bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                              {item.grade || 'GRADE_A'}
                            </span>
                            <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-full">
                              {item.category || 'VEGETABLES'}
                            </span>
                          </div>

                          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl text-xs font-black text-slate-900 shadow-xs flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span>{dist.toFixed(1)} km</span>
                            {isNearby && (
                              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded ml-1">
                                Nearby
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-base font-extrabold text-slate-900">{item.cropName}</h3>
                              <p className="text-xs text-slate-500 font-medium">
                                Batch #{item.batchId || 'KS-BATCH-9948'} • Quality Score: {item.aiQualityEstimateScore || 92}/100
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-black text-emerald-700">₹{item.pricePerKg}</span>
                              <span className="text-[10px] text-slate-400 font-bold block">/ kg</span>
                            </div>
                          </div>

                          {/* Farmer Details Box */}
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-slate-500">
                              {item.farmer?.profileImage ? (
                                <img
                                  src={item.farmer.profileImage}
                                  alt={item.farmer.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>👤</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-extrabold text-slate-900 truncate">
                                  {item.farmer?.name || 'Verified Farmer Partner'}
                                </p>
                                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                  Verified
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium truncate">
                                📍 {item.location?.district || item.farmer?.address?.city || 'Karnal'}, {item.location?.state || item.farmer?.address?.state || 'Haryana'}
                              </p>
                            </div>
                          </div>

                          {/* Stock Info */}
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                            <span className="text-slate-500 font-medium">Available Bulk Stock:</span>
                            <span className="font-extrabold text-slate-900">
                              {item.availableQuantityKg?.toLocaleString()} kg
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Box */}
                      <div className="p-4 bg-slate-50/80 border-t border-slate-100 space-y-3">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-slate-600 whitespace-nowrap">Order Qty (kg):</label>
                          <input
                            type="number"
                            min="1"
                            max={item.availableQuantityKg}
                            value={requestedQty}
                            onChange={(e) => handleQtyChange(item._id, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 text-center bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Add to Cart</span>
                          </button>

                          <button
                            onClick={() => handleDirectOrder(item)}
                            disabled={loading}
                            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Direct Order ⚡</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI Bulk Sourcing & Aggregation Engine */}
        {activeTab === 'AI_ENGINE' && (
          <div className="space-y-6">
            {/* Request Form */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-agri-primary" /> Create Bulk Procurement Request
              </h3>

              <form onSubmit={handleCreateRequest} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Crop Needed</label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Potato">Potato</option>
                    <option value="Onion">Onion</option>
                    <option value="Wheat">Wheat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Required Qty (kg)</label>
                  <input
                    type="number"
                    value={quantityRequiredKg}
                    onChange={(e) => setQuantityRequiredKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Budget (₹/kg)</label>
                  <input
                    type="number"
                    value={maxBudgetPerKg}
                    onChange={(e) => setMaxBudgetPerKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quality Grade</label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="GRADE_A">Grade A (Premium)</option>
                    <option value="GRADE_B">Grade B (Standard)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-bold text-xs shadow-agri-sm hover:shadow-agri-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-agri-gold" /> Run AI Matching
                </button>
              </form>
            </div>

            {/* AI Smart Matching & Aggregation Results */}
            {matchData && (
              <div className="space-y-6">
                {/* Section 1: Order Aggregation Package */}
                <div className="bg-gradient-to-r from-agri-dark via-emerald-950 to-slate-950 p-6 rounded-3xl text-white shadow-agri-md space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-agri-gold" />
                      <h3 className="text-base font-bold text-white">Multi-Farmer Order Aggregation Package</h3>
                    </div>
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                      {matchData.aggregationPackage.suppliersCount} Farmer Lots Pooled
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {matchData.aggregationPackage.suppliers.map((s, idx) => (
                      <div key={idx} className="bg-white/10 p-4 rounded-2xl border border-white/15 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-300">{s.farmerName}</span>
                          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-mono">{s.batchId}</span>
                        </div>
                        <p className="text-xs font-extrabold text-white">
                          Allocated: {s.allocatedQuantityKg.toLocaleString()} kg @ ₹{s.pricePerKg}/kg
                        </p>
                        <p className="text-[10px] text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400" /> {s.location} • Trust: {s.trustScore}/100
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-300">
                        Aggregated Quantity: <b>{matchData.aggregationPackage.aggregatedQuantityKg.toLocaleString()} kg</b>
                      </p>
                      <p className="text-xl font-black text-agri-light">
                        Grand Total: ₹{matchData.aggregationPackage.totalGrandCost.toLocaleString()}{' '}
                        <span className="text-xs text-slate-300 font-normal">(Includes logistics & cold chain)</span>
                      </p>
                    </div>

                    <button
                      onClick={handlePlaceAggregatedOrder}
                      disabled={loading}
                      className="px-8 py-3.5 rounded-2xl bg-agri-gold hover:bg-amber-500 text-slate-950 font-extrabold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" /> Confirm & Place Aggregated Order
                    </button>
                  </div>
                </div>

                {/* Section 2: AI Smart Matching Score Matrix */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" /> Individual AI Match Scoring Matrix
                  </h3>

                  <div className="space-y-4">
                    {matchData.matches.map((m) => (
                      <div key={m.listingId} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-slate-900">{m.farmer.name}</span>
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              Match Score: {m.matchScore}%
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            {m.cropName} ({m.grade}) • ₹{m.pricePerKg}/kg • {m.availableQuantityKg.toLocaleString()} kg available
                          </p>
                          <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                            <span>Price Match: <b>{m.breakdown.priceScore}%</b></span>
                            <span>Distance Match: <b>{m.breakdown.distanceScore}%</b></span>
                            <span>Quality Match: <b>{m.breakdown.qualityScore}%</b></span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-700 block">Estimated Distance</span>
                          <span className="text-sm font-black text-slate-900">~{m.estimatedDistanceKm} km</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: My Bulk Orders & Status Tracking */}
        {activeTab === 'MY_ORDERS' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" /> My Bulk Procurement Orders & Tracking
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Track live status of requests sent to farmers & FPOs with Escrow payment verification.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-bold">{orders.length} Orders Placed</span>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No bulk orders placed yet.</p>
                <button
                  onClick={() => setActiveTab('PRODUCE_LISTINGS')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors"
                >
                  Browse Farmers Produce Listings →
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((o) => {
                  const step = getStatusStep(o.status);

                  return (
                    <div
                      key={o._id}
                      className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4 shadow-2xs hover:border-emerald-300 transition-all"
                    >
                      {/* Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 font-mono">
                              Order #{o.orderNumber}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                              Escrow {o.paymentStatus || 'LOCKED'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Placed on {new Date(o.createdAt).toLocaleDateString()} • Direct Sourcing Contract
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-base font-black text-slate-900">
                            ₹{o.totalAmount?.toLocaleString()}
                          </span>
                          <span className="text-[11px] font-extrabold text-emerald-700 block">
                            {o.items?.map((i) => `${i.quantityKg?.toLocaleString()} kg ${i.cropName}`).join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Live Order Progress Timeline */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-extrabold text-slate-700 block">
                          Live Sourcing & Delivery Progress Status:
                        </span>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                          <div
                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                              step >= 1
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span className="text-[10px]">1. Request Sent & Escrow Locked</span>
                          </div>

                          <div
                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                              step >= 2
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="text-[10px]">2. Farmer / FPO Approved</span>
                          </div>

                          <div
                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                              step >= 3
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}
                          >
                            <Truck className="w-4 h-4 text-emerald-600" />
                            <span className="text-[10px]">3. Logistics In-Transit</span>
                          </div>

                          <div
                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                              step >= 4
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}
                          >
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-[10px]">4. Quality Checked & Delivered</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BulkBuyerDashboard;
