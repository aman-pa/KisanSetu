import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import API from '../services/api';
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
  Printer,
  Copy,
  Check,
} from 'lucide-react';

const ConsumerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/orders');
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'PENDING':
        return {
          label: 'Pending',
          color: 'bg-amber-50 text-amber-800 border-amber-300',
          dotColor: 'bg-amber-500',
          icon: Clock,
        };
      case 'ACCEPTED':
      case 'PICKUP_VERIFIED':
        return {
          label: 'Accepted',
          color: 'bg-blue-50 text-blue-800 border-blue-300',
          dotColor: 'bg-blue-500',
          icon: CheckCircle2,
        };
      case 'IN_TRANSIT':
        return {
          label: 'In Transit',
          color: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          dotColor: 'bg-indigo-500',
          icon: Truck,
        };
      case 'DELIVERED':
      case 'COMPLETED':
        return {
          label: 'Delivered',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dotColor: 'bg-emerald-600',
          icon: CheckCircle2,
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: 'bg-rose-50 text-rose-800 border-rose-300',
          dotColor: 'bg-rose-500',
          icon: AlertCircle,
        };
      default:
        return {
          label: status || 'Pending',
          color: 'bg-slate-100 text-slate-800 border-slate-300',
          dotColor: 'bg-slate-500',
          icon: Package,
        };
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesFilter =
      activeFilter === 'ALL' ||
      (activeFilter === 'PENDING' && (ord.status === 'PENDING' || ord.status === 'CONFIRMED')) ||
      (activeFilter === 'ACCEPTED' && (ord.status === 'ACCEPTED' || ord.status === 'PICKUP_VERIFIED')) ||
      (activeFilter === 'IN_TRANSIT' && ord.status === 'IN_TRANSIT') ||
      (activeFilter === 'DELIVERED' && (ord.status === 'DELIVERED' || ord.status === 'COMPLETED'));

    if (!matchesFilter) return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const orderNum = (ord.orderNumber || '').toLowerCase();
    const cropNames = (ord.items || []).map((i) => (i.cropName || '').toLowerCase()).join(' ');
    const farmerName = (ord.items?.[0]?.farmer?.name || '').toLowerCase();

    return orderNum.includes(query) || cropNames.includes(query) || farmerName.includes(query);
  });

  const selectedOrder =
    filteredOrders.find((o) => o._id === selectedOrderId) || filteredOrders[0] || null;

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) =>
    ['PENDING', 'CONFIRMED'].includes(o.status)
  ).length;
  const inProgressCount = orders.filter((o) =>
    ['ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT'].includes(o.status)
  ).length;
  const completedOrdersCount = orders.filter((o) =>
    ['DELIVERED', 'COMPLETED'].includes(o.status)
  ).length;

  const handleCopyOrderId = (text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Clean & Professional Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-md border border-emerald-800/40">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-1.5 backdrop-blur-md">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Consumer Orders</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Consumer Orders
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Manage consumer orders and track their fulfillment status.
              </p>
            </div>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="self-start md:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-300 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 4 Simple Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Orders</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalOrdersCount}</div>
              <p className="text-[10px] text-slate-500 font-medium">All consumer orders</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">Pending Orders</span>
              <div className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">{pendingOrdersCount}</div>
              <p className="text-[10px] text-slate-500 font-medium">Awaiting confirmation</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-amber-100 transition-all">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">In Progress</span>
              <div className="text-xl sm:text-2xl font-black text-indigo-900 mt-0.5">{inProgressCount}</div>
              <p className="text-[10px] text-slate-500 font-medium">Accepted / In Transit</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
              <Truck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">Completed</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-0.5">{completedOrdersCount}</div>
              <p className="text-[10px] text-slate-500 font-medium">Successfully delivered</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: `All Orders (${orders.length})` },
            { id: 'PENDING', label: `Pending (${pendingOrdersCount})` },
            { id: 'ACCEPTED', label: 'Accepted' },
            { id: 'IN_TRANSIT', label: 'In Transit' },
            { id: 'DELIVERED', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-2xs">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Loading orders...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State - Only when user has 0 orders total in DB */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-black text-slate-900">No Orders Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                No consumer produce orders found.
              </p>
            </div>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-extrabold text-xs shadow-agri-sm hover:shadow-agri-md transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Browse Marketplace</span>
            </Link>
          </div>
        )}

        {/* DUAL INDEPENDENT SCROLLABLE MASTER-DETAIL LAYOUT */}
        {!loading && !error && orders.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* ========================================================================= */}
            {/* LEFT INDEPENDENT SCROLLABLE LIST PANE (lg:col-span-5) */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 flex flex-col h-[560px] lg:h-[650px]">
              {/* Header & Fixed Search Bar */}
              <div className="space-y-2 pb-2.5 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>Orders</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px] font-black">
                      {filteredOrders.length}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">Select to inspect</span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by ID, produce, farmer..."
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
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const isSelected = selectedOrder?._id === order._id;
                    const badge = getStatusBadge(order.status);
                    const primaryItem = order.items?.[0];
                    const totalKg =
                      order.items?.reduce((s, i) => s + (i.quantityKg || 0), 0) || 0;
                    const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    });

                    const thumbImg =
                      primaryItem?.listing?.images?.[0] ||
                      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=150&q=80';

                    return (
                      <div
                        key={order._id}
                        onClick={() => setSelectedOrderId(order._id)}
                        className={`p-3 rounded-2xl transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-white border-y border-r border-emerald-300 border-l-4 border-l-emerald-600 shadow-sm ring-2 ring-emerald-500/15'
                            : 'bg-white hover:bg-slate-50/90 border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:translate-x-0.5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={thumbImg}
                              alt={primaryItem?.cropName || 'Produce'}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=150&q=80';
                              }}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200/80 flex-shrink-0 shadow-2xs"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-slate-900 truncate">
                                  #{order.orderNumber}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {primaryItem?.cropName || 'Produce Lot'}{' '}
                                {order.items?.length > 1 && (
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    +{order.items.length - 1} more
                                  </span>
                                )}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium block">
                                {dateStr} • {totalKg} kg
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-xs sm:text-sm font-black text-slate-900 block">
                              ₹{order.totalAmount?.toLocaleString()}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border mt-1 ${badge.color}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                              <span className="truncate max-w-[90px]">{badge.label}</span>
                            </span>
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
                      <h4 className="text-xs font-black text-slate-800">No Orders Found</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] leading-relaxed">
                        {searchQuery
                          ? `No orders matching "${searchQuery}"`
                          : `No orders in "${activeFilter}"`}
                      </p>
                    </div>
                    {(searchQuery || activeFilter !== 'ALL') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setActiveFilter('ALL');
                        }}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset Filters</span>
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
              {selectedOrder ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-full">
                  
                  {/* Fixed Sticky Header for Selected Order */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white flex-shrink-0 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Order ID</span>
                          <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">#{selectedOrder.orderNumber}</span>
                          <button
                            onClick={() => handleCopyOrderId(selectedOrder.orderNumber)}
                            title="Copy Order ID"
                            className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          >
                            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {(() => {
                          const badge = getStatusBadge(selectedOrder.status);
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${badge.color}`}>
                              <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                              <span>{badge.label}</span>
                            </span>
                          );
                        })()}
                        {selectedOrder.paymentStatus && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <span>{selectedOrder.paymentStatus === 'PAID' ? 'Payment Completed' : 'Payment Pending'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Independently Scrollable Detail Body */}
                  <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                    
                    {/* Produce Purchased Section */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Produce Ordered</span>
                        </h4>
                        <span className="text-[11px] font-bold text-slate-500">
                          {selectedOrder.items?.length || 1} Item(s)
                        </span>
                      </div>

                      <div className="space-y-2">
                        {selectedOrder.items?.map((item, idx) => {
                          const listingImg =
                            item.listing?.images?.[0] ||
                            'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80';

                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-all gap-4 shadow-2xs"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={listingImg}
                                  alt={item.cropName}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80';
                                  }}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0 shadow-2xs"
                                />
                                <div className="min-w-0">
                                  <h5 className="text-sm font-black text-slate-900 truncate">{item.cropName}</h5>
                                  <p className="text-xs text-slate-500 font-semibold">
                                    {item.quantityKg} kg × ₹{item.pricePerKg}/kg
                                  </p>
                                  {item.batchId && (
                                    <Link
                                      to={`/trace/${item.batchId}`}
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 mt-0.5 group"
                                    >
                                      <QrCode className="w-3 h-3 text-emerald-600" />
                                      <span className="group-hover:underline">Batch #{item.batchId} Trace</span>
                                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                    </Link>
                                  )}
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0">
                                <span className="text-[10px] font-bold text-slate-400 block">Subtotal</span>
                                <span className="text-sm font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                                  ₹{item.subtotal?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Farmer & Delivery Information Cards (Side-by-Side Grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Farmer Details Box */}
                      <div className="bg-gradient-to-br from-emerald-50/70 via-emerald-50/40 to-teal-50/30 rounded-2xl border border-emerald-200/80 p-3.5 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                          <span className="text-[11px] font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Farmer / Producer</span>
                          </span>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                            Producer
                          </span>
                        </div>

                        {selectedOrder.items?.[0]?.farmer ? (
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">Farmer:</span>
                              <span className="font-bold text-slate-900">
                                {selectedOrder.items[0].farmer.name || 'Verified Farmer'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium flex items-center gap-1">
                                <Phone className="w-3 h-3 text-emerald-600" /> Phone:
                              </span>
                              <a
                                href={`tel:${selectedOrder.items[0].farmer.phone}`}
                                className="font-bold text-emerald-800 hover:underline inline-flex items-center gap-1"
                              >
                                {selectedOrder.items[0].farmer.phone || '+91 98765 43210'}
                              </a>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-600" /> Farm:
                              </span>
                              <span className="font-bold text-slate-900 truncate max-w-[130px]">
                                {selectedOrder.items[0].farmer.address?.city ||
                                  selectedOrder.items[0].farmer.profileDetails?.location?.district ||
                                  'Karnal'},{' '}
                                {selectedOrder.items[0].farmer.address?.state || 'Haryana'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 font-medium italic">Verified KisanSetu Partner Farmer</p>
                        )}
                      </div>

                      {/* Delivery Details Box */}
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200/80 p-3.5 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                          <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-600" />
                            <span>Destination</span>
                          </span>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            Doorstep
                          </span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <p className="text-slate-700 font-medium leading-relaxed">
                            {selectedOrder.deliveryAddress
                              ? `${selectedOrder.deliveryAddress.street || ''}, ${selectedOrder.deliveryAddress.city || ''}, ${selectedOrder.deliveryAddress.state || ''} - ${selectedOrder.deliveryAddress.pincode || ''}`
                              : 'Default Registered Customer Address'}
                          </p>
                          {selectedOrder.buyer && (
                            <p className="text-[11px] text-slate-500 font-medium pt-0.5 border-t border-slate-200/60 flex items-center justify-between">
                              <span>Recipient:</span>
                              <b className="text-slate-800">{selectedOrder.buyer.name || 'Consumer'}</b>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 5-Hour Area-Batching Notification Box */}
                    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-3.5 rounded-2xl border border-emerald-200/80 flex items-start gap-3 shadow-2xs">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-xs">
                        🌿
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-emerald-950">5-Hour Area Pooling Active (10–20km Hub)</span>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            48% Saved
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium leading-relaxed text-[11px]">
                          Your order is grouped with neighbor deliveries within a 20km radius of the local FPO hub over a 5-hour window. This cuts delivery costs for both farmers and consumers.
                        </p>
                      </div>
                    </div>

                    {/* Order Progress Stepper Timeline */}
                    <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Fulfillment Milestones</span>
                        </h4>
                        <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                          Status: {getStatusBadge(selectedOrder.status).label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        {/* Step 1 */}
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-300 shadow-2xs space-y-1">
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-[10px] font-bold">
                            ✓
                          </div>
                          <p className="text-[11px] font-extrabold text-slate-900">1. Order Placed</p>
                          <p className="text-[9px] text-emerald-700 font-semibold">Received</p>
                        </div>

                        {/* Step 2 */}
                        <div
                          className={`p-2.5 rounded-xl border space-y-1 ${
                            ['ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(selectedOrder.status)
                              ? 'bg-white border-emerald-300 shadow-2xs'
                              : 'bg-slate-100/80 border-slate-200 opacity-60'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto text-[10px] font-bold ${
                              ['ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(selectedOrder.status)
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-300 text-slate-600'
                            }`}
                          >
                            {['ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(selectedOrder.status) ? '✓' : '2'}
                          </div>
                          <p className="text-[11px] font-extrabold text-slate-900">2. Accepted</p>
                          <p className="text-[9px] text-slate-500 font-semibold">
                            {['ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(selectedOrder.status)
                              ? 'Confirmed'
                              : 'Pending'}
                          </p>
                        </div>

                        {/* Step 3 */}
                        <div
                          className={`p-2.5 rounded-xl border space-y-1 ${
                            ['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(selectedOrder.status)
                              ? 'bg-white border-emerald-300 shadow-2xs'
                              : 'bg-slate-100/80 border-slate-200 opacity-60'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto text-[10px] font-bold ${
                              ['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(selectedOrder.status)
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-300 text-slate-600'
                            }`}
                          >
                            {['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(selectedOrder.status) ? '✓' : '3'}
                          </div>
                          <p className="text-[11px] font-extrabold text-slate-900">3. In Transit</p>
                          <p className="text-[9px] text-slate-500 font-semibold">
                            {['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(selectedOrder.status) ? 'Dispatched' : 'Awaiting'}
                          </p>
                        </div>

                        {/* Step 4 */}
                        <div
                          className={`p-2.5 rounded-xl border space-y-1 ${
                            ['DELIVERED', 'COMPLETED'].includes(selectedOrder.status)
                              ? 'bg-white border-emerald-300 shadow-2xs'
                              : 'bg-slate-100/80 border-slate-200 opacity-60'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto text-[10px] font-bold ${
                              ['DELIVERED', 'COMPLETED'].includes(selectedOrder.status)
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-300 text-slate-600'
                            }`}
                          >
                            {['DELIVERED', 'COMPLETED'].includes(selectedOrder.status) ? '✓' : '4'}
                          </div>
                          <p className="text-[11px] font-extrabold text-slate-900">4. Delivered</p>
                          <p className="text-[9px] text-slate-500 font-semibold">
                            {['DELIVERED', 'COMPLETED'].includes(selectedOrder.status) ? 'Delivered' : 'Destination'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fixed Sticky Footer for Actions & Total */}
                  <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 text-xs">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Grand Total</span>
                      <span className="text-xl font-black text-slate-900">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/ticket/${selectedOrder._id}`}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Print Trade Ticket</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 text-center text-slate-400 space-y-3.5 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-300 shadow-2xs">
                    <Package className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="max-w-xs space-y-1">
                    <h3 className="text-sm font-black text-slate-800">No Order Selected</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Select an order from the left list or adjust your search to inspect produce items, farmer details, and fulfillment status.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ConsumerOrdersPage;
