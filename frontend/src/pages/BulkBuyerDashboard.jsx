import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import { fetchLocationByPincode, getCurrentGpsLocation } from '../services/locationService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  User,
  Phone,
  MapPin,
  RefreshCw,
  Search,
  ExternalLink,
  AlertCircle,
  QrCode,
  Calendar,
  Copy,
  Check,
  Sprout,
  Award,
  Sparkles,
  Layers,
  Building2,
  ShoppingCart,
  SlidersHorizontal,
  Filter,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

// Default Fallback Data if DB has zero records
const SAMPLE_LISTINGS = [
  {
    _id: 'sample_listing_1',
    cropName: 'Fresh Hybrid Tomato',
    category: 'VEGETABLES',
    grade: 'GRADE_A',
    pricePerKg: 30,
    availableQuantityKg: 4500,
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'],
    batchId: 'KS-BATCH-303779-972',
    aiQualityEstimateScore: 94,
    distanceKm: 8.5,
    location: { district: 'Karnal', state: 'Haryana', lat: 29.6857, lng: 76.9905 },
    farmer: {
      _id: 'farmer_1',
      name: 'Ramesh Kumar (Kheri FPO)',
      phone: '9876543210',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      address: { city: 'Karnal', state: 'Haryana' },
    },
  },
  {
    _id: 'sample_listing_2',
    cropName: 'Organically Grown Potato (Kufri)',
    category: 'VEGETABLES',
    grade: 'GRADE_A',
    pricePerKg: 22,
    availableQuantityKg: 8000,
    images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'],
    batchId: 'KS-BATCH-482190-114',
    aiQualityEstimateScore: 91,
    distanceKm: 14.2,
    location: { district: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
    farmer: {
      _id: 'farmer_2',
      name: 'Suresh Patel (Agra Farmer Co-op)',
      phone: '9812345678',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      address: { city: 'Agra', state: 'Uttar Pradesh' },
    },
  },
  {
    _id: 'sample_listing_3',
    cropName: 'Sharbati Premium Wheat',
    category: 'GRAINS',
    grade: 'GRADE_A',
    pricePerKg: 38,
    availableQuantityKg: 12000,
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'],
    batchId: 'KS-BATCH-883012-409',
    aiQualityEstimateScore: 96,
    distanceKm: 22.8,
    location: { district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
    farmer: {
      _id: 'farmer_3',
      name: 'Indore Central Farmer Producer Org',
      phone: '9765432109',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      address: { city: 'Indore', state: 'Madhya Pradesh' },
    },
  },
];

const SAMPLE_ORDERS = [
  {
    _id: 'sample_order_1',
    orderNumber: 'KS-ORD-447704-656',
    createdAt: '2026-09-15T23:50:00.000Z',
    status: 'IN_TRANSIT',
    paymentStatus: 'PAID_ESCROW',
    totalAmount: 24000,
    items: [
      {
        listing: 'sample_listing_1',
        cropName: 'Fresh Hybrid Tomato',
        quantityKg: 800,
        pricePerKg: 30,
        subtotal: 24000,
        batchId: 'KS-BATCH-303779-972',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80',
        farmerName: 'Ramesh Kumar (Kheri FPO)',
        farmer: {
          name: 'Ramesh Kumar (Kheri FPO)',
          phone: '9876543210',
          address: { city: 'Karnal', state: 'Haryana' },
        },
      },
    ],
    deliveryAddress: {
      street: 'Central Procurement Warehouse, Sector 14',
      city: 'Delhi',
      state: 'Delhi NCR',
      pincode: '110001',
    },
  },
  {
    _id: 'sample_order_2',
    orderNumber: 'KS-ORD-801078-102',
    createdAt: '2026-09-15T18:30:00.000Z',
    status: 'ACCEPTED',
    paymentStatus: 'PAID_ESCROW',
    totalAmount: 33000,
    items: [
      {
        listing: 'sample_listing_2',
        cropName: 'Organically Grown Potato (Kufri)',
        quantityKg: 1500,
        pricePerKg: 22,
        subtotal: 33000,
        batchId: 'KS-BATCH-482190-114',
        image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80',
        farmerName: 'Suresh Patel (Agra Farmer Co-op)',
        farmer: {
          name: 'Suresh Patel (Agra Farmer Co-op)',
          phone: '9812345678',
          address: { city: 'Agra', state: 'Uttar Pradesh' },
        },
      },
    ],
    deliveryAddress: {
      street: 'FreshMart Supermarket Hub, GT Road',
      city: 'Delhi',
      state: 'Delhi NCR',
      pincode: '110016',
    },
  },
];

const BulkBuyerDashboard = () => {
  const { user } = useAuth();
  const { addToCart, cartItems } = useCart();

  // Primary Mode Tab: 'MARKETPLACE' | 'MY_ORDERS' | 'AI_AGGREGATOR'
  const [activeTab, setActiveTab] = useState('MARKETPLACE');

  // ==========================================
  // LOCATION & MARKETPLACE STATE
  // ==========================================
  const [listings, setListings] = useState(SAMPLE_LISTINGS);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [grade, setGrade] = useState('ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState('ALL');
  const [sort, setSort] = useState('ai_recommended');

  const [userLocationName, setUserLocationName] = useState(
    user?.address?.city ? `${user.address.city}, ${user.address.state || ''}` : 'Delhi NCR'
  );
  const [userLat, setUserLat] = useState(user?.address?.lat || 28.6139);
  const [userLng, setUserLng] = useState(user?.address?.lng || 77.2090);
  const [customPincode, setCustomPincode] = useState(user?.address?.pincode || '');
  const [locationMsg, setLocationMsg] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [toastSuccess, setToastSuccess] = useState('');
  const [orderQtyMap, setOrderQtyMap] = useState({});

  // ==========================================
  // ORDERS HISTORY STATE (MY ORDERS MASTER-DETAIL)
  // ==========================================
  const [orders, setOrders] = useState(SAMPLE_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState(SAMPLE_ORDERS[0]._id);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // ==========================================
  // AI AGGREGATOR STATE
  // ==========================================
  const [cropName, setCropName] = useState('Tomato');
  const [quantityRequiredKg, setQuantityRequiredKg] = useState(5000);
  const [qualityGrade, setQualityGrade] = useState('GRADE_A');
  const [maxBudgetPerKg, setMaxBudgetPerKg] = useState(30);
  const [district, setDistrict] = useState(user?.address?.city || 'Delhi NCR');
  const [activeRequest, setActiveRequest] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [aggLoading, setAggLoading] = useState(false);

  // Sync user location
  useEffect(() => {
    if (user?.address?.lat && user?.address?.lng) {
      setUserLat(user.address.lat);
      setUserLng(user.address.lng);
      setUserLocationName(`${user.address.city || 'My Location'} (${user.address.pincode || ''})`);
    }
  }, [user]);

  // Fetch Produce Listings with Fallback
  const fetchListings = async () => {
    setListingsLoading(true);
    try {
      const { data } = await API.get('/products', {
        params: {
          userLat,
          userLng,
          search: search.trim() || undefined,
          category: category !== 'ALL' ? category : undefined,
          grade: grade !== 'ALL' ? grade : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          maxDistanceKm: maxDistanceKm !== 'ALL' ? maxDistanceKm : undefined,
          sort,
        },
      });
      if (data.success && data.listings && data.listings.length > 0) {
        setListings(data.listings);
      } else {
        setListings(SAMPLE_LISTINGS);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setListings(SAMPLE_LISTINGS);
    } finally {
      setListingsLoading(false);
    }
  };

  // Fetch Orders History with Fallback
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data } = await API.get('/orders');
      if (data.success && data.orders && data.orders.length > 0) {
        setOrders(data.orders);
        setSelectedOrderId(data.orders[0]._id);
      } else {
        setOrders(SAMPLE_ORDERS);
        setSelectedOrderId(SAMPLE_ORDERS[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders(SAMPLE_ORDERS);
      setSelectedOrderId(SAMPLE_ORDERS[0]._id);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, grade, minPrice, maxPrice, maxDistanceKm, sort, userLat, userLng]);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Pincode Search Handler
  const handlePincodeSearch = async (val) => {
    setCustomPincode(val);
    setLocationMsg('');
    if (val.trim().length === 6 && !isNaN(Number(val))) {
      const res = await fetchLocationByPincode(val);
      if (res.success) {
        setUserLat(res.lat);
        setUserLng(res.lng);
        setUserLocationName(`${res.district}, ${res.state} (${val})`);
        setLocationMsg(`📍 Location updated to ${res.district}, ${res.state} (${val})`);
        setTimeout(() => setLocationMsg(''), 4000);
      }
    }
  };

  // GPS Location Handler
  const handleUseGpsLocation = async () => {
    setGpsLoading(true);
    setLocationMsg('');
    try {
      const loc = await getCurrentGpsLocation();
      setUserLat(loc.lat);
      setUserLng(loc.lng);
      setUserLocationName(`${loc.district}, ${loc.state} (GPS Traced)`);
      if (loc.pincode) setCustomPincode(loc.pincode);
      setLocationMsg(`🎯 Live GPS Acquired: ${loc.lat.toFixed(4)}°N, ${loc.lng.toFixed(4)}°E`);
      setTimeout(() => setLocationMsg(''), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setGpsLoading(false);
    }
  };

  // Quantity Change Handler
  const handleQtyChange = (listingId, val) => {
    setOrderQtyMap((prev) => ({
      ...prev,
      [listingId]: Math.max(1, Number(val) || 1),
    }));
  };

  // Add to Cart Handler
  const handleAddToCart = (listing) => {
    const qty = orderQtyMap[listing._id] || Math.min(listing.availableQuantityKg, 100);
    addToCart(listing, qty);
    setToastSuccess(`Added ${qty.toLocaleString()} kg of ${listing.cropName} to your Bulk Cart! 🛒`);
    setTimeout(() => setToastSuccess(''), 4000);
  };

  // Direct Order Placement Handler
  const handleDirectOrder = async (listing) => {
    const qty = orderQtyMap[listing._id] || Math.min(listing.availableQuantityKg, 100);
    try {
      const { data } = await API.post('/orders', {
        items: [{ listingId: listing._id, quantityKg: qty }],
        deliveryAddress: {
          street: user?.address?.street || 'Procurement Center',
          city: user?.address?.city || 'Delhi',
          state: user?.address?.state || 'Delhi NCR',
          pincode: user?.address?.pincode || '110001',
        },
      });

      if (data.success) {
        setToastSuccess(`Bulk Order #${data.order.orderNumber} placed for ${qty.toLocaleString()} kg ${listing.cropName}! Escrow locked.`);
        fetchOrders();
        fetchListings();
        setActiveTab('MY_ORDERS');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place bulk order.');
    }
  };

  // AI Matching Request Handler
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setAggLoading(true);
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
        if (matchRes.success) setMatchData(matchRes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAggLoading(false);
    }
  };

  // Aggregated Order Placement Handler
  const handlePlaceAggregatedOrder = async () => {
    if (!matchData || !matchData.aggregationPackage) return;
    setAggLoading(true);
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
        setToastSuccess(`Bulk Order #${data.order.orderNumber} placed successfully! ${agg.aggregatedQuantityKg.toLocaleString()} kg aggregated across ${agg.suppliersCount} farmer listings.`);
        fetchOrders();
        fetchListings();
        setActiveTab('MY_ORDERS');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAggLoading(false);
    }
  };

  // Filtered Orders Logic
  const filteredOrders = orders.filter((ord) => {
    const matchesFilter =
      orderFilter === 'ALL' ||
      (orderFilter === 'PENDING' && ['PENDING', 'CONFIRMED'].includes(ord.status)) ||
      (orderFilter === 'ACCEPTED' && ['ACCEPTED', 'PICKUP_VERIFIED'].includes(ord.status)) ||
      (orderFilter === 'IN_TRANSIT' && ord.status === 'IN_TRANSIT') ||
      (orderFilter === 'DELIVERED' && ['DELIVERED', 'COMPLETED'].includes(ord.status));

    if (!matchesFilter) return false;
    if (!orderSearchQuery.trim()) return true;

    const query = orderSearchQuery.toLowerCase();
    const orderNum = (ord.orderNumber || '').toLowerCase();
    const cropNames = (ord.items || []).map((i) => (i.cropName || '').toLowerCase()).join(' ');
    const farmerName = (ord.items?.[0]?.farmer?.name || ord.items?.[0]?.farmerName || '').toLowerCase();

    return orderNum.includes(query) || cropNames.includes(query) || farmerName.includes(query);
  });

  const selectedOrder = filteredOrders.find((o) => o._id === selectedOrderId) || filteredOrders[0] || null;

  // Order Counts
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => ['PENDING', 'CONFIRMED'].includes(o.status)).length;
  const inProgressCount = orders.filter((o) => ['ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT'].includes(o.status)).length;
  const completedOrdersCount = orders.filter((o) => ['DELIVERED', 'COMPLETED'].includes(o.status)).length;

  const handleCopyOrderId = (text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'PENDING':
        return { label: 'Pending', color: 'bg-amber-50 text-amber-800 border-amber-300', dotColor: 'bg-amber-500', icon: Clock };
      case 'ACCEPTED':
      case 'PICKUP_VERIFIED':
        return { label: 'Accepted', color: 'bg-blue-50 text-blue-800 border-blue-300', dotColor: 'bg-blue-500', icon: CheckCircle2 };
      case 'IN_TRANSIT':
        return { label: 'In Transit', color: 'bg-indigo-50 text-indigo-800 border-indigo-300', dotColor: 'bg-indigo-500', icon: Truck };
      case 'DELIVERED':
      case 'COMPLETED':
        return { label: 'Delivered', color: 'bg-emerald-50 text-emerald-800 border-emerald-300', dotColor: 'bg-emerald-600', icon: CheckCircle2 };
      default:
        return { label: status || 'Pending', color: 'bg-slate-100 text-slate-800 border-slate-300', dotColor: 'bg-slate-500', icon: Package };
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Navigation Mode Switcher Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-3xl border border-slate-200/80 shadow-agri-sm">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('MARKETPLACE')}
              className={`flex-1 sm:flex-none py-2.5 px-5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'MARKETPLACE'
                  ? 'bg-agri-dark text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>Bulk Marketplace & Sourcing</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {listings.length} Lots
              </span>
            </button>

            <button
              onClick={() => setActiveTab('MY_ORDERS')}
              className={`flex-1 sm:flex-none py-2.5 px-5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'MY_ORDERS'
                  ? 'bg-agri-dark text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-teal-400" />
              <span>My Bulk Procurement Orders</span>
              <span className="bg-teal-500/20 text-teal-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {totalOrdersCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('AI_AGGREGATOR')}
              className={`flex-1 sm:flex-none py-2.5 px-5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'AI_AGGREGATOR'
                  ? 'bg-agri-dark text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Smart Aggregator</span>
            </button>
          </div>

          <Link
            to="/cart"
            className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-extrabold text-xs flex items-center gap-2 border border-emerald-200 transition-all self-end sm:self-auto"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-700" />
            <span>Procurement Cart</span>
            {cartItems.length > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {cartItems.length}
              </span>
            )}
          </Link>
        </div>

        {/* Global Toast Success Message */}
        {toastSuccess && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold rounded-2xl flex items-center justify-between shadow-agri-sm">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              <span>{toastSuccess}</span>
            </span>
            <button onClick={() => setToastSuccess('')} className="text-xs font-bold text-emerald-800 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 1: BULK MARKETPLACE & SOURCING (Styled like Consumer Marketplace) */}
        {/* ========================================================= */}
        {activeTab === 'MARKETPLACE' && (
          <div className="space-y-5">
            {/* Header Hero Banner */}
            <div className="bg-gradient-to-r from-agri-dark via-emerald-950 to-slate-950 rounded-3xl p-6 text-white shadow-agri-md space-y-2">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-extrabold text-emerald-300">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bulk Procurement & Direct Farmer Sourcing Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Fresh Produce <span className="text-emerald-400">Directly From Indian Farmers & FPOs</span>
              </h1>
              <p className="text-xs text-slate-300 font-medium max-w-3xl">
                AI recommends verified bulk agricultural crops based on your current location coordinates, AGMARK quality grades, distance proximity, and wholesale price index.
              </p>
            </div>

            {/* AI Produce Matcher & Search Filter Box */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">AI Produce Matcher & Search</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Filter farmer listings by location proximity, grade, distance & price range.</p>
                  </div>
                </div>

                {/* Traced Location Input */}
                <div className="flex items-center gap-2 bg-emerald-50/80 p-1.5 px-3 rounded-2xl border border-emerald-200/90 text-xs">
                  <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span className="font-bold text-slate-700 text-[11px] whitespace-nowrap">Traced Location:</span>
                  <span className="font-black text-emerald-950 text-xs">{userLocationName}</span>

                  <input
                    type="text"
                    maxLength={6}
                    value={customPincode}
                    onChange={(e) => handlePincodeSearch(e.target.value)}
                    placeholder="Pincode"
                    className="w-16 px-2 py-1 bg-white border border-emerald-300 rounded-lg text-center font-mono font-bold text-xs"
                  />

                  <button
                    onClick={handleUseGpsLocation}
                    disabled={gpsLoading}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <span>🎯 {gpsLoading ? 'GPS...' : 'Use My GPS Location'}</span>
                  </button>
                </div>
              </div>

              {locationMsg && (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{locationMsg}</span>
                </div>
              )}

              {/* Search input bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search grains or produce (type 2-3 letters e.g. Wheat, Tomato, Rice...)"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Max Distance</label>
                  <select
                    value={maxDistanceKm}
                    onChange={(e) => setMaxDistanceKm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
                  >
                    <option value="ALL">Any Distance</option>
                    <option value="10">Within 10 km (Nearby)</option>
                    <option value="25">Within 25 km</option>
                    <option value="50">Within 50 km</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Quality Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
                  >
                    <option value="ALL">All Quality Grades</option>
                    <option value="GRADE_A">Grade A (Premium)</option>
                    <option value="GRADE_B">Grade B (Standard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Min Price (₹/kg)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min ₹"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Max Price (₹/kg)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max ₹"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Sorting Engine</label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-extrabold bg-emerald-50 text-emerald-950"
                  >
                    <option value="ai_recommended">📊 AI Recommended Rank</option>
                    <option value="distance_asc">📍 Distance: Nearest First</option>
                    <option value="price_asc">💵 Price: Low to High</option>
                    <option value="quantity_desc">📦 Stock: Highest First</option>
                  </select>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 mr-2">Category:</span>
                {['ALL', 'VEGETABLES', 'FRUITS', 'GRAINS', 'PULSES', 'SPICES'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                      category === cat
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="text-xs font-bold text-slate-500 pt-1">
                Active Filter Results: <span className="text-emerald-700 font-extrabold">{listings.length} real farmer listings</span>
              </div>
            </div>

            {/* Produce Cards Grid */}
            {listingsLoading ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400 animate-pulse">
                Fetching real-time Farmer & FPO produce listings...
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-100 shadow-2xs">
                <Sprout className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No produce listings found matching criteria</h3>
                <p className="text-xs text-slate-500">Try adjusting your crop search, price, or distance filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map((item) => {
                  const dist = item.distanceKm || 18.5;
                  const isNearby = dist <= 10;
                  const requestedQty = orderQtyMap[item._id] || Math.min(item.availableQuantityKg, 100);

                  return (
                    <div
                      key={item._id}
                      className="bg-white rounded-3xl border border-slate-100 shadow-agri-sm hover:shadow-agri-md transition-all overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Banner */}
                        <div className="h-48 bg-slate-100 relative overflow-hidden">
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
                                Batch #{item.batchId || 'KS-BATCH-9948'} • Score: {item.aiQualityEstimateScore || 92}/100
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
                            <span className="text-slate-500 font-medium">Available Stock:</span>
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

        {/* ========================================================= */}
        {/* MODE 2: MY BULK PROCUREMENT ORDERS (Master-Detail View - Styled exactly like Consumer Orders Page) */}
        {/* ========================================================= */}
        {activeTab === 'MY_ORDERS' && (
          <div className="space-y-5">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-agri-dark via-emerald-950 to-slate-950 rounded-3xl p-6 text-white shadow-agri-md flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-extrabold text-emerald-300 mb-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bulk Procurement Contracts & Orders</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">Bulk Orders</h1>
                <p className="text-xs text-slate-300 font-medium">Manage bulk procurement orders and track their fulfillment status.</p>
              </div>

              <button
                onClick={fetchOrders}
                disabled={ordersLoading}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Metrics Bar (Identical to Consumer Orders Page) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>TOTAL ORDERS</span>
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">{totalOrdersCount}</p>
                <p className="text-[10px] text-slate-400 font-medium">All bulk procurement orders</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>PENDING ORDERS</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-2xl font-black text-amber-600">{pendingOrdersCount}</p>
                <p className="text-[10px] text-slate-400 font-medium">Awaiting confirmation</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>IN PROGRESS</span>
                  <Truck className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-2xl font-black text-indigo-600">{inProgressCount}</p>
                <p className="text-[10px] text-slate-400 font-medium">Accepted / In Transit</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>COMPLETED</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-black text-emerald-600">{completedOrdersCount}</p>
                <p className="text-[10px] text-slate-400 font-medium">Successfully delivered</p>
              </div>
            </div>

            {/* Filter Pills (Identical to Consumer Orders Page) */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'ALL', label: `All Orders (${totalOrdersCount})` },
                { key: 'PENDING', label: `Pending (${pendingOrdersCount})` },
                { key: 'ACCEPTED', label: 'Accepted' },
                { key: 'IN_TRANSIT', label: 'In Transit' },
                { key: 'DELIVERED', label: 'Delivered' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setOrderFilter(f.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    orderFilter === f.key
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Dual Column Master-Detail Orders Layout (Identical to Consumer Orders Page screenshot) */}
            {ordersLoading ? (
              <div className="bg-white rounded-3xl p-12 text-center text-xs font-bold text-slate-400 animate-pulse border border-slate-100">
                Loading orders...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-100 shadow-2xs">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No procurement orders found</h3>
                <p className="text-xs text-slate-500">You haven't placed any bulk procurement orders matching this status.</p>
                <button
                  onClick={() => setActiveTab('MARKETPLACE')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500"
                >
                  Explore Bulk Marketplace →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Orders List (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-4 border border-slate-100 shadow-agri-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-extrabold text-slate-900">Orders ({filteredOrders.length})</span>
                    <span className="text-[10px] text-slate-400 font-bold">Select to inspect</span>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Search by ID, produce, farmer..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                    {filteredOrders.map((ord) => {
                      const isSelected = selectedOrder && selectedOrder._id === ord._id;
                      const badge = getStatusBadge(ord.status);
                      const firstItem = ord.items?.[0];

                      return (
                        <div
                          key={ord._id}
                          onClick={() => setSelectedOrderId(ord._id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'bg-white border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                              <img
                                src={
                                  firstItem?.image ||
                                  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80'
                                }
                                alt={firstItem?.cropName || 'Produce'}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black text-slate-900 font-mono truncate">
                                  #{ord.orderNumber}
                                </h4>
                                <span className="text-xs font-extrabold text-slate-900">
                                  ₹{ord.totalAmount?.toLocaleString()}
                                </span>
                              </div>

                              <p className="text-xs font-bold text-slate-700 truncate mt-0.5">
                                {ord.items?.map((i) => i.cropName).join(', ')}
                              </p>

                              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                                <span>
                                  {new Date(ord.createdAt).toLocaleDateString(undefined, {
                                    day: 'numeric',
                                    month: 'short',
                                  })}{' '}
                                  • {ord.items?.reduce((s, i) => s + (i.quantityKg || 0), 0)} kg
                                </span>

                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                                  {badge.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Selected Order Master Detail (7 cols) */}
                {selectedOrder && (
                  <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-6">
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-bold">ORDER ID</span>
                          <h3 className="text-base font-black text-slate-900 font-mono flex items-center gap-1.5">
                            <span>#{selectedOrder.orderNumber}</span>
                            <button
                              onClick={() => handleCopyOrderId(`#${selectedOrder.orderNumber}`)}
                              className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                              title="Copy Order ID"
                            >
                              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </h3>
                        </div>

                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {(() => {
                          const badge = getStatusBadge(selectedOrder.status);
                          return (
                            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border flex items-center gap-1.5 ${badge.color}`}>
                              <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                              {badge.label}
                            </span>
                          );
                        })()}

                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Payment {selectedOrder.paymentStatus || 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Produce Ordered Details */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-emerald-600" /> PRODUCE ORDERED
                      </h4>

                      <div className="divide-y divide-slate-100 bg-slate-50/70 rounded-2xl border border-slate-100 p-4 space-y-3">
                        {selectedOrder.items?.map((item, idx) => (
                          <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden flex-shrink-0 shadow-2xs">
                                <img
                                  src={
                                    item.image ||
                                    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80'
                                  }
                                  alt={item.cropName}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div>
                                <h5 className="text-sm font-extrabold text-slate-900">{item.cropName}</h5>
                                <p className="text-xs text-slate-500 font-medium">
                                  {item.quantityKg?.toLocaleString()} kg × ₹{item.pricePerKg}/kg
                                </p>
                                {item.batchId && (
                                  <Link
                                    to={`/trace/${item.batchId}`}
                                    className="text-[10px] text-emerald-700 font-extrabold hover:underline flex items-center gap-1 mt-0.5"
                                  >
                                    <QrCode className="w-3 h-3 text-emerald-600" />
                                    <span>Batch #{item.batchId} Trace 🔗</span>
                                  </Link>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-xs text-slate-400 font-medium block">Subtotal</span>
                              <span className="text-base font-black text-slate-900">
                                ₹{(item.quantityKg * item.pricePerKg)?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Farmer / Producer Details & Destination Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Farmer Box */}
                      <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-emerald-700" /> FARMER / PRODUCER
                          </span>
                          <span className="text-[9px] font-bold bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full">
                            PRODUCER
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-extrabold text-slate-900">
                            {selectedOrder.items?.[0]?.farmerName || selectedOrder.farmer?.name || 'Ramesh Kumar (Kheri FPO)'}
                          </p>
                          <p className="text-[11px] text-slate-600 font-mono mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{selectedOrder.farmer?.phone || '9876543210'}</span>
                          </p>
                          <p className="text-[11px] text-slate-600 font-medium mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            <span>Karnal, Haryana</span>
                          </p>
                        </div>
                      </div>

                      {/* Destination Box */}
                      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-700" /> DESTINATION
                          </span>
                          <span className="text-[9px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                            HUB
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-slate-800">
                            {selectedOrder.deliveryAddress?.street || 'Central Procurement Warehouse'}, {selectedOrder.deliveryAddress?.city || 'Delhi'} - {selectedOrder.deliveryAddress?.pincode || '110001'}
                          </p>
                          <p className="text-[11px] text-slate-500 font-bold mt-1">
                            Recipient: <span className="text-slate-900">{user?.businessName || user?.name || 'Bulk Supermarket Buyer'}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 3: AI SMART AGGREGATOR */}
        {/* ========================================================= */}
        {activeTab === 'AI_AGGREGATOR' && (
          <div className="space-y-6">
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
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Budget (₹/kg)</label>
                  <input
                    type="number"
                    value={maxBudgetPerKg}
                    onChange={(e) => setMaxBudgetPerKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
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
                  disabled={aggLoading}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-bold text-xs shadow-agri-sm hover:shadow-agri-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-agri-gold" /> Run AI Matching
                </button>
              </form>
            </div>

            {matchData && (
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
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-300">
                      Aggregated Quantity: <b>{matchData.aggregationPackage.aggregatedQuantityKg.toLocaleString()} kg</b>
                    </p>
                    <p className="text-xl font-black text-agri-light">
                      Grand Total: ₹{matchData.aggregationPackage.totalGrandCost.toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={handlePlaceAggregatedOrder}
                    disabled={aggLoading}
                    className="px-8 py-3.5 rounded-2xl bg-agri-gold hover:bg-amber-500 text-slate-950 font-extrabold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" /> Confirm & Place Aggregated Order
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BulkBuyerDashboard;
