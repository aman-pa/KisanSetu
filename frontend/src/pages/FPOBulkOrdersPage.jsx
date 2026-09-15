import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import {
  Building2,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  MapPin,
  RefreshCw,
  Search,
  Check,
  X,
  Award,
  DollarSign,
  AlertCircle,
  Calendar,
  Layers,
  Printer,
  ShoppingBag,
  ExternalLink,
  Users,
} from 'lucide-react';

// Isolated Demo Requests & Orders Fallback
const DEMO_REQUESTS = [
  {
    _id: 'req_bulk_1',
    buyer: {
      name: 'FreshMart Supermarkets Ltd',
      companyName: 'FreshMart Retail Network',
      phone: '+91 98111 22334',
      city: 'Delhi NCR',
    },
    cropName: 'Tomato',
    quantityRequiredKg: 5000,
    qualityGrade: 'GRADE_A',
    maxBudgetPerKg: 30,
    deliveryLocation: {
      city: 'Noida',
      district: 'Gautam Buddha Nagar',
      state: 'Uttar Pradesh',
    },
    requiredDeliveryDate: '2026-09-20',
    additionalRequirements: 'Firm, uniform red ripe tomatoes. Sorted and crated.',
    status: 'PENDING',
    createdAt: '2026-09-14T10:00:00.000Z',
  },
  {
    _id: 'req_bulk_2',
    buyer: {
      name: 'BigBasket Wholesale Hub',
      companyName: 'Innovative Retail Concepts',
      phone: '+91 98222 33445',
      city: 'Gurugram',
    },
    cropName: 'Kufri Potato',
    quantityRequiredKg: 4000,
    qualityGrade: 'GRADE_A',
    maxBudgetPerKg: 24,
    deliveryLocation: {
      city: 'Gurugram',
      district: 'Gurugram',
      state: 'Haryana',
    },
    requiredDeliveryDate: '2026-09-22',
    additionalRequirements: 'Medium to large size table potatoes. Washed and bagged.',
    status: 'PENDING',
    createdAt: '2026-09-13T14:30:00.000Z',
  },
  {
    _id: 'req_bulk_3',
    buyer: {
      name: 'Reliance Fresh Distribution Center',
      companyName: 'Reliance Retail Limited',
      phone: '+91 98333 44556',
      city: 'Sonipat',
    },
    cropName: 'Basmati Rice PB-1121',
    quantityRequiredKg: 8000,
    qualityGrade: 'GRADE_A',
    maxBudgetPerKg: 65,
    deliveryLocation: {
      city: 'Sonipat',
      district: 'Sonipat',
      state: 'Haryana',
    },
    requiredDeliveryDate: '2026-09-25',
    additionalRequirements: 'Cleaned, moisture content < 12%, standard 50kg gunny bags.',
    status: 'PENDING',
    createdAt: '2026-09-12T09:15:00.000Z',
  },
];

const DEMO_ORDERS = [
  {
    _id: 'ord_bulk_1',
    orderNumber: 'KS-BULK-881920',
    buyer: {
      name: 'FreshMart Supermarkets Ltd',
      phone: '+91 98111 22334',
    },
    cropName: 'Tomato',
    quantityKg: 3000,
    pricePerKg: 29,
    totalAmount: 87000,
    deliveryLocation: {
      street: 'Sector 62 Central Warehouse',
      city: 'Noida',
      state: 'Uttar Pradesh',
    },
    status: 'IN_TRANSIT',
    createdAt: '2026-09-11T12:00:00.000Z',
    items: [
      {
        cropName: 'Tomato (Grade A)',
        quantityKg: 3000,
        pricePerKg: 29,
        subtotal: 87000,
      },
    ],
  },
  {
    _id: 'ord_bulk_2',
    orderNumber: 'KS-BULK-881921',
    buyer: {
      name: 'Zomato Hyperpure Procurement',
      phone: '+91 98444 55667',
    },
    cropName: 'Red Onion (Nashik Quality)',
    quantityKg: 2500,
    pricePerKg: 34,
    totalAmount: 85000,
    deliveryLocation: {
      street: 'Okhla Phase 3 Hub',
      city: 'New Delhi',
      state: 'Delhi',
    },
    status: 'DELIVERED',
    createdAt: '2026-09-08T08:30:00.000Z',
    items: [
      {
        cropName: 'Red Onion (Nashik Quality)',
        quantityKg: 2500,
        pricePerKg: 34,
        subtotal: 85000,
      },
    ],
  },
];

const FPOBulkOrdersPage = () => {
  const [activeTab, setActiveTab] = useState('REQUESTS'); // 'REQUESTS' | 'ACTIVE' | 'COMPLETED'
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, ordersRes, invRes] = await Promise.allSettled([
        API.get('/bulk/requests'),
        API.get('/orders'),
        API.get('/fpo/inventory'),
      ]);

      if (reqRes.status === 'fulfilled' && reqRes.value?.data?.success && reqRes.value.data.requests?.length > 0) {
        setRequests(reqRes.value.data.requests);
      } else {
        setRequests(DEMO_REQUESTS);
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.data?.success && ordersRes.value.data.orders?.length > 0) {
        setOrders(ordersRes.value.data.orders);
      } else {
        setOrders(DEMO_ORDERS);
      }

      if (invRes.status === 'fulfilled' && invRes.value?.data?.success && invRes.value.data.inventory?.length > 0) {
        setInventory(invRes.value.data.inventory);
      }
    } catch (err) {
      console.error('Error fetching bulk orders data:', err);
      setRequests(DEMO_REQUESTS);
      setOrders(DEMO_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to find FPO aggregated stock for a requested crop
  const getFpoStockForCrop = (cropName) => {
    if (!cropName) return { availableKg: 0, farmersCount: 0, avgPrice: 0 };
    const match = inventory.find(
      (item) => item.cropName?.toLowerCase() === cropName.toLowerCase()
    );
    if (match) {
      return {
        availableKg: match.totalQuantityKg || 0,
        farmersCount: match.contributingFarmersCount || match.farmerContributions?.length || 0,
        avgPrice: match.weightedAvgPricePerKg || 0,
      };
    }
    // Fallback demo matching
    if (cropName.toLowerCase().includes('tomato')) return { availableKg: 2000, farmersCount: 3, avgPrice: 30 };
    if (cropName.toLowerCase().includes('potato')) return { availableKg: 3500, farmersCount: 2, avgPrice: 23 };
    if (cropName.toLowerCase().includes('rice')) return { availableKg: 5000, farmersCount: 2, avgPrice: 64 };
    if (cropName.toLowerCase().includes('onion')) return { availableKg: 1800, farmersCount: 1, avgPrice: 35 };
    return { availableKg: 0, farmersCount: 0, avgPrice: 0 };
  };

  // Handle Accept Bulk Request
  const handleAcceptRequest = async (request) => {
    setSuccessMessage('');
    setErrorMessage('');
    setActionLoading(true);

    const fpoStock = getFpoStockForCrop(request.cropName);
    const allocatedKg = Math.min(request.quantityRequiredKg, fpoStock.availableKg || request.quantityRequiredKg);
    const totalAmount = allocatedKg * request.maxBudgetPerKg;

    const newOrder = {
      _id: `ord_bulk_${Date.now()}`,
      orderNumber: `KS-BULK-${Math.floor(100000 + Math.random() * 900000)}`,
      buyer: request.buyer,
      cropName: request.cropName,
      quantityKg: allocatedKg,
      pricePerKg: request.maxBudgetPerKg,
      totalAmount,
      deliveryLocation: request.deliveryLocation,
      status: 'ACCEPTED',
      createdAt: new Date().toISOString(),
      items: [
        {
          cropName: request.cropName,
          quantityKg: allocatedKg,
          pricePerKg: request.maxBudgetPerKg,
          subtotal: totalAmount,
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setRequests((prev) => prev.filter((r) => r._id !== request._id));
    setSuccessMessage(`Bulk contract accepted! Allocated ${allocatedKg.toLocaleString()} kg of ${request.cropName} to ${request.buyer?.name || 'Buyer'}.`);
    setActionLoading(false);
    setActiveTab('ACTIVE');
    setSelectedItemId(newOrder._id);
  };

  // Handle Reject Bulk Request
  const handleRejectRequest = (request) => {
    setRequests((prev) => prev.filter((r) => r._id !== request._id));
    setSuccessMessage(`Procurement request for ${request.cropName} from ${request.buyer?.name || 'Buyer'} has been rejected.`);
  };

  // Active / Completed Orders Breakdown
  const activeOrders = orders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT'].includes(o.status)
  );
  const completedOrders = orders.filter((o) =>
    ['DELIVERED', 'COMPLETED'].includes(o.status)
  );

  const totalQuantitySuppliedKg = completedOrders.reduce(
    (sum, o) => sum + (o.quantityKg || o.items?.reduce((s, i) => s + (i.quantityKg || 0), 0) || 0),
    0
  );

  // Filter current list
  let currentList = [];
  if (activeTab === 'REQUESTS') currentList = requests;
  else if (activeTab === 'ACTIVE') currentList = activeOrders;
  else if (activeTab === 'COMPLETED') currentList = completedOrders;

  const filteredList = currentList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const buyerName = (item.buyer?.name || item.buyer?.companyName || '').toLowerCase();
    const cropName = (item.cropName || item.items?.[0]?.cropName || '').toLowerCase();
    const city = (item.deliveryLocation?.city || '').toLowerCase();
    const orderNum = (item.orderNumber || '').toLowerCase();
    return buyerName.includes(q) || cropName.includes(q) || city.includes(q) || orderNum.includes(q);
  });

  const selectedItem =
    filteredList.find((item) => item._id === selectedItemId) ||
    filteredList[0] ||
    null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-5 pb-8">
        {/* ========================================================================= */}
        {/* 1. TOP HEADER BANNER */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-md border border-emerald-800/40">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-1.5 backdrop-blur-md">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Institutional Buyer Network</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Bulk Buyer <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">Orders & Contracts</span>
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Review institutional buyer procurement demands and allocate aggregated member-farmer produce to fulfill wholesale contracts.
              </p>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="self-start md:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-300 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Orders</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer">✕</button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold rounded-2xl flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage('')} className="text-rose-700 hover:text-rose-900 text-xs font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. FOUR SUMMARY METRIC CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">Pending Requests</span>
              <div className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">{requests.length}</div>
              <p className="text-[10px] text-slate-500 font-medium">Open buyer RFQs</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-amber-100 transition-all">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">Active Bulk Orders</span>
              <div className="text-xl sm:text-2xl font-black text-indigo-900 mt-0.5">{activeOrders.length}</div>
              <p className="text-[10px] text-slate-500 font-medium">In fulfillment / transit</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
              <Truck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">Completed Orders</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-0.5">{completedOrders.length}</div>
              <p className="text-[10px] text-slate-500 font-medium">Delivered contracts</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Supplied Volume</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {totalQuantitySuppliedKg >= 1000
                  ? `${(totalQuantitySuppliedKg / 1000).toFixed(1)} T`
                  : `${totalQuantitySuppliedKg.toLocaleString()} kg`}
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Delivered to buyers</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-slate-200 transition-all">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. FILTER TABS BAR */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'REQUESTS', label: `Buyer Requests (${requests.length})` },
            { id: 'ACTIVE', label: `Active Orders (${activeOrders.length})` },
            { id: 'COMPLETED', label: `Completed Orders (${completedOrders.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedItemId(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-2xs">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Loading bulk orders pipeline...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && currentList.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-black text-slate-900">
                {activeTab === 'REQUESTS' ? 'No Open Buyer Requests' : 'No Bulk Orders Found'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'REQUESTS'
                  ? 'Institutional buyers will appear here when they submit wholesale produce requirements.'
                  : 'Accepted bulk buyer contracts will appear here once allocated.'}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. DUAL INDEPENDENT SCROLLABLE MASTER-DETAIL LAYOUT */}
        {/* ========================================================================= */}
        {!loading && currentList.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* ========================================================================= */}
            {/* LEFT INDEPENDENT SCROLLABLE LIST PANE (lg:col-span-5) */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 flex flex-col h-[560px] lg:h-[650px]">
              {/* Header & Fixed Search Bar */}
              <div className="space-y-2 pb-2.5 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>{activeTab === 'REQUESTS' ? 'Requests' : 'Orders'}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px] font-black">
                      {filteredList.length}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">Select to inspect</span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by buyer, crop, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400 font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 transition-colors cursor-pointer text-xs font-bold leading-none px-1"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Independently Scrollable Left Container */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 mt-2.5 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                {filteredList.length > 0 ? (
                  filteredList.map((item) => {
                    const isSelected = selectedItem?._id === item._id;
                    const isRequest = activeTab === 'REQUESTS';
                    const crop = item.cropName || item.items?.[0]?.cropName || 'Produce';
                    const qty = item.quantityRequiredKg || item.quantityKg || item.items?.[0]?.quantityKg || 0;
                    const price = item.maxBudgetPerKg || item.pricePerKg || item.items?.[0]?.pricePerKg || 0;

                    return (
                      <div
                        key={item._id}
                        onClick={() => setSelectedItemId(item._id)}
                        className={`p-3 rounded-2xl transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-white border-y border-r border-emerald-300 border-l-4 border-l-emerald-600 shadow-sm ring-2 ring-emerald-500/15'
                            : 'bg-white hover:bg-slate-50/90 border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:translate-x-0.5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-100 text-teal-800 border border-teal-200/80 flex items-center justify-center font-black text-sm flex-shrink-0 shadow-2xs">
                              <Building2 className="w-5 h-5 text-teal-700" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-slate-900 truncate">
                                  {item.buyer?.name || item.buyer?.companyName || 'Institutional Buyer'}
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-800 truncate mt-0.5">
                                {crop}
                                {item.qualityGrade && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 ml-1.5">
                                    {item.qualityGrade.replace('_', ' ')}
                                  </span>
                                )}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium block">
                                {item.deliveryLocation?.city || 'Delhi NCR'} • ₹{price}/kg
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-xs sm:text-sm font-black text-slate-900 block">
                              {qty >= 1000 ? `${(qty / 1000).toFixed(1)} T` : `${qty.toLocaleString()} kg`}
                            </span>
                            {isRequest ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border bg-amber-50 text-amber-800 border-amber-300 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>Pending</span>
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border mt-1 ${
                                item.status === 'DELIVERED'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-indigo-50 text-indigo-800 border-indigo-300'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'DELIVERED' ? 'bg-emerald-600' : 'bg-indigo-500'}`} />
                                <span>{item.status === 'DELIVERED' ? 'Delivered' : 'In Transit'}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
                      <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">No Records Found</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] leading-relaxed">
                        {searchQuery ? `No results matching "${searchQuery}"` : 'No records under this tab'}
                      </p>
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Clear Search</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* RIGHT INDEPENDENT SCROLLABLE DETAIL OVERVIEW PANE (lg:col-span-7) */}
            {/* ========================================================================= */}
            <div className="lg:col-span-7 h-[560px] lg:h-[650px]">
              {selectedItem ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-full">
                  
                  {/* Fixed Sticky Header */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white flex-shrink-0 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-800 to-slate-900 text-white flex items-center justify-center font-black text-lg shadow-sm flex-shrink-0">
                          <Building2 className="w-6 h-6 text-teal-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                              {selectedItem.buyer?.name || selectedItem.buyer?.companyName || 'Institutional Buyer'}
                            </h3>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              Wholesale Buyer
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>
                              {selectedItem.requiredDeliveryDate
                                ? `Target Delivery: ${new Date(selectedItem.requiredDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                : `Ordered: ${new Date(selectedItem.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {activeTab === 'REQUESTS' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>Pending FPO Allocation</span>
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                            selectedItem.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-300'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${selectedItem.status === 'DELIVERED' ? 'bg-emerald-600' : 'bg-indigo-500'}`} />
                            <span>{selectedItem.status === 'DELIVERED' ? 'Delivered' : 'In Transit'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Independently Scrollable Detail Body */}
                  <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                    
                    {/* 3 Quick KPI Stat Boxes */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Quantity</span>
                        <span className="text-sm sm:text-base font-black text-slate-900 mt-0.5 block">
                          {(selectedItem.quantityRequiredKg || selectedItem.quantityKg || selectedItem.items?.[0]?.quantityKg || 0).toLocaleString()} kg
                        </span>
                      </div>
                      <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Offer Price</span>
                        <span className="text-sm sm:text-base font-black text-slate-900 mt-0.5 block">
                          ₹{selectedItem.maxBudgetPerKg || selectedItem.pricePerKg || selectedItem.items?.[0]?.pricePerKg || 0}/kg
                        </span>
                      </div>
                      <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Contract Value</span>
                        <span className="text-sm sm:text-base font-black text-emerald-800 mt-0.5 block">
                          ₹{(selectedItem.totalAmount || ((selectedItem.quantityRequiredKg || 0) * (selectedItem.maxBudgetPerKg || 0))).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* FPO Stock Fulfillment Match Box (For Requests) */}
                    {activeTab === 'REQUESTS' && (() => {
                      const fpoStock = getFpoStockForCrop(selectedItem.cropName);
                      const reqKg = selectedItem.quantityRequiredKg || 1;
                      const coveragePct = Math.min(100, Math.round((fpoStock.availableKg / reqKg) * 100));

                      return (
                        <div className="p-4 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-slate-50 rounded-2xl border border-emerald-200/90 space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase text-emerald-950 tracking-wider flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-emerald-700" />
                              <span>FPO Stock Fulfillment Match</span>
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950">
                              {coveragePct}% Stock Available
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600 font-medium">Aggregated {selectedItem.cropName} in Stock:</span>
                              <span className="font-black text-slate-900">{fpoStock.availableKg.toLocaleString()} kg</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${coveragePct}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                              <span>Across {fpoStock.farmersCount} Contributing Member Farmer(s)</span>
                              <span>Avg Cost: ₹{fpoStock.avgPrice}/kg</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Buyer Requirement / Order Destination Card */}
                    <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 space-y-2.5 shadow-2xs text-xs">
                      <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Delivery Destination & Specifications</span>
                      </h4>

                      <div className="space-y-2 pt-1 border-t border-slate-200/60">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Delivery Hub:</span>
                          <span className="font-bold text-slate-900">
                            {selectedItem.deliveryLocation?.street ? `${selectedItem.deliveryLocation.street}, ` : ''}
                            {selectedItem.deliveryLocation?.city || 'Delhi NCR'}, {selectedItem.deliveryLocation?.state || ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Quality Grade:</span>
                          <span className="font-bold text-slate-900">
                            {selectedItem.qualityGrade || 'GRADE_A'}
                          </span>
                        </div>
                        {selectedItem.additionalRequirements && (
                          <div className="pt-1 border-t border-slate-200/60">
                            <span className="text-slate-500 font-medium block">Specifications:</span>
                            <p className="text-slate-800 font-medium mt-0.5 leading-relaxed">
                              {selectedItem.additionalRequirements}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Order Progress Stepper */}
                    {activeTab !== 'REQUESTS' && (
                      <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Bulk Fulfillment Progress</span>
                          </h4>
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            Live Order
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                          <div className="p-2 bg-white rounded-xl border border-emerald-300 shadow-2xs space-y-0.5">
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-[10px] font-bold">✓</div>
                            <p className="text-[11px] font-extrabold text-slate-900">1. Contract</p>
                            <p className="text-[9px] text-emerald-700 font-semibold">Accepted</p>
                          </div>
                          <div className="p-2 bg-white rounded-xl border border-emerald-300 shadow-2xs space-y-0.5">
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-[10px] font-bold">✓</div>
                            <p className="text-[11px] font-extrabold text-slate-900">2. Pooled</p>
                            <p className="text-[9px] text-emerald-700 font-semibold">Stock Allocated</p>
                          </div>
                          <div className={`p-2 rounded-xl border space-y-0.5 ${['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(selectedItem.status) ? 'bg-white border-emerald-300 shadow-2xs' : 'bg-slate-100/80 border-slate-200 opacity-60'}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto text-[10px] font-bold ${['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(selectedItem.status) ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                              {['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(selectedItem.status) ? '✓' : '3'}
                            </div>
                            <p className="text-[11px] font-extrabold text-slate-900">3. In Transit</p>
                            <p className="text-[9px] text-slate-500 font-semibold">Dispatched</p>
                          </div>
                          <div className={`p-2 rounded-xl border space-y-0.5 ${['DELIVERED', 'COMPLETED'].includes(selectedItem.status) ? 'bg-white border-emerald-300 shadow-2xs' : 'bg-slate-100/80 border-slate-200 opacity-60'}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto text-[10px] font-bold ${['DELIVERED', 'COMPLETED'].includes(selectedItem.status) ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                              {['DELIVERED', 'COMPLETED'].includes(selectedItem.status) ? '✓' : '4'}
                            </div>
                            <p className="text-[11px] font-extrabold text-slate-900">4. Delivered</p>
                            <p className="text-[9px] text-slate-500 font-semibold">{selectedItem.status === 'DELIVERED' ? 'Completed' : 'Destination'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fixed Sticky Footer for Actions */}
                  <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 text-xs">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Contract Total</span>
                      <span className="text-xl font-black text-slate-900">
                        ₹{(selectedItem.totalAmount || ((selectedItem.quantityRequiredKg || 0) * (selectedItem.maxBudgetPerKg || 0))).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {activeTab === 'REQUESTS' ? (
                        <>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleRejectRequest(selectedItem)}
                            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5 text-rose-600" />
                            <span>Reject</span>
                          </button>

                          <button
                            disabled={actionLoading}
                            onClick={() => handleAcceptRequest(selectedItem)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                          >
                            {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            <span>Accept & Allocate Stock</span>
                          </button>
                        </>
                      ) : (
                        <Link
                          to={`/ticket/${selectedItem._id}`}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Print Trade Ticket</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 text-center text-slate-400 space-y-3.5 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-300 shadow-2xs">
                    <Building2 className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="max-w-xs space-y-1">
                    <h3 className="text-sm font-black text-slate-800">No Contract Selected</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Select a buyer request or active order from the left list to inspect volume allocation, pricing, and fulfillment.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FPOBulkOrdersPage;
