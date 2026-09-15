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
  Star,
  CreditCard,
  ShieldCheck,
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
      address: { city: 'Karnal', state: 'Haryana', lat: 29.6857, lng: 76.9905 },
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
      address: { city: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
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
      address: { city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
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
    paymentStatus: 'UNPAID',
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

// Helper to compute distance in km
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 12.4;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

const BulkBuyerDashboard = () => {
  const { user } = useAuth();
  const { addToCart, cartItems } = useCart();

  // Mode Tab on Dashboard: 'MY_ORDERS' | 'AI_AGGREGATOR'
  const [activeTab, setActiveTab] = useState('MY_ORDERS');

  // ==========================================
  // LOCATION & MARKETPLACE LISTINGS STATE
  // ==========================================
  const [listings, setListings] = useState(SAMPLE_LISTINGS);
  const [userLocationName, setUserLocationName] = useState(
    user?.address?.city ? `${user.address.city}, ${user.address.state || ''}` : 'Delhi NCR'
  );
  const [userLat, setUserLat] = useState(user?.address?.lat || 28.6139);
  const [userLng, setUserLng] = useState(user?.address?.lng || 77.2090);
  const [toastSuccess, setToastSuccess] = useState('');

  // ==========================================
  // ORDERS HISTORY STATE
  // ==========================================
  const [orders, setOrders] = useState(SAMPLE_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState(SAMPLE_ORDERS[0]._id);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

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

  useEffect(() => {
    if (user?.address?.lat && user?.address?.lng) {
      setUserLat(user.address.lat);
      setUserLng(user.address.lng);
      setUserLocationName(`${user.address.city || 'My Location'} (${user.address.pincode || ''})`);
    }
  }, [user]);

  // Fetch Produce Listings
  const fetchListings = async () => {
    try {
      const { data } = await API.get('/products', {
        params: { userLat, userLng },
      });
      if (data.success && data.listings && data.listings.length > 0) {
        setListings(data.listings);
      } else {
        setListings(SAMPLE_LISTINGS);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setListings(SAMPLE_LISTINGS);
    }
  };

  // Fetch Orders History
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
    fetchOrders();
  }, [userLat, userLng]);

  // Handle Pay & Lock Escrow
  const handlePayEscrow = async (orderId) => {
    setPaymentLoading(true);
    try {
      // If sample order
      if (orderId.startsWith('sample_')) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, status: 'IN_TRANSIT', paymentStatus: 'PAID_ESCROW' } : o
          )
        );
        setToastSuccess('Payment confirmed & Escrow locked! Order is now in transit 🚚');
      } else {
        const { data } = await API.put(`/orders/${orderId}/pay`);
        if (data.success) {
          setToastSuccess('Payment confirmed & Escrow locked! Order is now in transit 🚚');
          fetchOrders();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing error.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // AI Matching Request
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
        setActiveTab('MY_ORDERS');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAggLoading(false);
    }
  };

  // Filtered Orders
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

  const getStepNumber = (status) => {
    if (['DELIVERED', 'COMPLETED'].includes(status)) return 4;
    if (status === 'IN_TRANSIT') return 3;
    if (['ACCEPTED', 'PICKUP_VERIFIED'].includes(status)) return 2;
    return 1;
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Simple Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('MY_ORDERS')}
              className={`flex-1 sm:flex-none py-2 px-5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'MY_ORDERS'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-teal-400" />
              <span>My Orders</span>
              <span className="bg-teal-500/20 text-teal-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {totalOrdersCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('AI_AGGREGATOR')}
              className={`flex-1 sm:flex-none py-2 px-5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'AI_AGGREGATOR'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Aggregator</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Link
              to="/marketplace"
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center gap-1.5 transition-all"
            >
              <Sprout className="w-3.5 h-3.5 text-emerald-700" />
              <span>Explore Marketplace →</span>
            </Link>

            <Link
              to="/cart"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-extrabold text-xs flex items-center gap-2 border border-emerald-200 transition-all"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-700" />
              <span>Cart</span>
              {cartItems.length > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Toast Success Message */}
        {toastSuccess && (
          <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold rounded-2xl flex items-center justify-between shadow-2xs">
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
        {/* MODE 1: MY ORDERS (Master-Detail View - Styled like Consumer Orders Page) */}
        {/* ========================================================= */}
        {activeTab === 'MY_ORDERS' && (
          <div className="space-y-5">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-agri-dark via-emerald-950 to-slate-950 rounded-3xl p-6 text-white shadow-agri-md flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-extrabold text-emerald-300 mb-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bulk Buyer Dashboard</span>
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

            {/* Metrics Bar */}
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

            {/* Filter Pills */}
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

            {/* Dual Column Master-Detail Orders Layout */}
            {ordersLoading ? (
              <div className="bg-white rounded-3xl p-12 text-center text-xs font-bold text-slate-400 animate-pulse border border-slate-100">
                Loading orders...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-100 shadow-2xs">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No procurement orders found</h3>
                <p className="text-xs text-slate-500">You haven't placed any bulk procurement orders matching this status.</p>
                <Link
                  to="/marketplace"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 inline-block"
                >
                  Explore Marketplace →
                </Link>
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

                {/* Right Column: Selected Order Detail Panel */}
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
                          {selectedOrder.paymentStatus === 'PAID_ESCROW' ? 'Escrow Locked ✓' : 'Payment Pending'}
                        </span>
                      </div>
                    </div>

                    {/* ACTION BOX: Farmer Accepted -> Payment & Escrow Lock Button */}
                    {selectedOrder.status === 'ACCEPTED' && selectedOrder.paymentStatus !== 'PAID_ESCROW' && (
                      <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                              <span>Farmer Accepted Your Buy Request!</span>
                            </h4>
                            <p className="text-[11px] text-emerald-800 font-medium">
                              Pay &amp; Lock Escrow funds (₹{selectedOrder.totalAmount?.toLocaleString()}) to dispatch this order.
                            </p>
                          </div>

                          <button
                            onClick={() => handlePayEscrow(selectedOrder._id)}
                            disabled={paymentLoading}
                            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
                          >
                            <CreditCard className="w-4 h-4 text-emerald-300" />
                            <span>{paymentLoading ? 'Securing Escrow...' : 'Pay & Lock Escrow 💳'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Live Order Progress Tracker Bar */}
                    <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3">
                      <span className="text-[11px] font-extrabold text-slate-700 block">
                        Fulfillment & Delivery Tracker:
                      </span>
                      {(() => {
                        const stepNum = getStepNumber(selectedOrder.status);
                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                            <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${stepNum >= 1 ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                              <Clock className="w-3.5 h-3.5 text-emerald-700" />
                              <span className="text-[10px]">1. Request Sent</span>
                            </div>
                            <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${stepNum >= 2 ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span className="text-[10px]">2. Farmer Accepted</span>
                            </div>
                            <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${stepNum >= 3 ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                              <Truck className="w-3.5 h-3.5 text-emerald-700" />
                              <span className="text-[10px]">3. In Transit</span>
                            </div>
                            <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${stepNum >= 4 ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                              <span className="text-[10px]">4. Delivered</span>
                            </div>
                          </div>
                        );
                      })()}
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
        {/* MODE 2: AI SMART AGGREGATOR */}
        {/* ========================================================= */}
        {activeTab === 'AI_AGGREGATOR' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-agri-primary" /> Run AI Multi-Farmer Contract Aggregator
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
                    <option value="GRADE_A">Grade A (Premium Quality)</option>
                    <option value="GRADE_B">Grade B (Standard Quality)</option>
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

            {/* AI Results displaying Farmer Quality Rating & Traced Distance */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" /> AI Producer Quality Rankings & Traced Distance Matrix
                </h3>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Traced from Registered Coordinates
                </span>
              </div>

              <div className="space-y-4">
                {listings.map((item) => {
                  const farmerLat = item.farmer?.address?.lat || item.location?.lat || 29.6857;
                  const farmerLng = item.farmer?.address?.lng || item.location?.lng || 76.9905;
                  const dist = calculateDistanceKm(userLat, userLng, farmerLat, farmerLng);
                  const qualityScore = item.aiQualityEstimateScore || 94;

                  return (
                    <div
                      key={item._id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-extrabold text-slate-900">
                            {item.farmer?.name || 'Verified Farmer Partner'}
                          </span>
                          <span className="bg-emerald-100 text-emerald-950 text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>Quality Score: {qualityScore}/100</span>
                          </span>
                          <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded">
                            {item.grade || 'GRADE_A'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 font-medium">
                          {item.cropName} • Stock Available: <b>{item.availableQuantityKg?.toLocaleString()} kg</b> @ ₹{item.pricePerKg}/kg
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span>
                              Farm Location: <b>{item.location?.district || item.farmer?.address?.city || 'Karnal'}, {item.location?.state || item.farmer?.address?.state || 'Haryana'}</b>
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Traced Distance Pill */}
                      <div className="text-right flex flex-col items-end justify-center bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Traced GPS Distance</span>
                        <span className="text-base font-black text-slate-900 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span>{dist.toFixed(1)} km</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">From {userLocationName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pooled Aggregation Package */}
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
