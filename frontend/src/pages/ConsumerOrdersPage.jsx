import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import API from '../services/api';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Package,
  User,
  Phone,
  MapPin,
  ChevronRight,
  RefreshCw,
  Search,
  ExternalLink,
  AlertCircle,
  IndianRupee,
} from 'lucide-react';

const ConsumerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

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
      setError(err.response?.data?.message || 'Failed to load your orders.');
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
          label: status === 'CONFIRMED' ? 'Order Confirmed (Escrow Secured)' : 'Awaiting Farmer Approval',
          color: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: Clock,
        };
      case 'ACCEPTED':
      case 'PICKUP_VERIFIED':
        return {
          label: 'Accepted by Farmer',
          color: 'bg-blue-50 text-blue-800 border-blue-300',
          icon: CheckCircle2,
        };
      case 'IN_TRANSIT':
        return {
          label: 'In Transit',
          color: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          icon: Truck,
        };
      case 'DELIVERED':
      case 'COMPLETED':
        return {
          label: 'Delivered',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: 'bg-rose-50 text-rose-800 border-rose-300',
          icon: AlertCircle,
        };
      default:
        return {
          label: status,
          color: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: Package,
        };
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'PENDING') return ord.status === 'PENDING' || ord.status === 'CONFIRMED';
    if (activeFilter === 'ACCEPTED') return ord.status === 'ACCEPTED' || ord.status === 'PICKUP_VERIFIED';
    if (activeFilter === 'IN_TRANSIT') return ord.status === 'IN_TRANSIT';
    if (activeFilter === 'DELIVERED') return ord.status === 'DELIVERED' || ord.status === 'COMPLETED';
    return true;
  });

  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter((o) => ['PENDING', 'ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT'].includes(o.status)).length;
  const completedOrdersCount = orders.filter((o) => ['DELIVERED', 'COMPLETED'].includes(o.status)).length;
  const totalEscrowAmount = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-agri-dark via-emerald-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-emerald-800/30">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400 mb-1">
              <ShoppingBag className="w-4 h-4" />
              <span>Consumer Order Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              My Produce <span className="text-emerald-300">Orders & Tracking</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Track buy requests sent to farmers, inspect escrow payment security, and monitor real-time delivery timelines.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalOrdersCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">Direct farm purchases</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-amber-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-900">{activeOrdersCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">Pending / In-Transit</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-900">{completedOrdersCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">Delivered to location</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-indigo-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Escrow Value</span>
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-950">₹{totalEscrowAmount.toLocaleString()}</div>
            <p className="text-[11px] text-slate-500 mt-1">Protected in Escrow</p>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {[
            { id: 'ALL', label: `All Orders (${orders.length})` },
            { id: 'PENDING', label: 'Pending Approval' },
            { id: 'ACCEPTED', label: 'Accepted by Farmer' },
            { id: 'IN_TRANSIT', label: 'In Transit' },
            { id: 'DELIVERED', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-agri-dark text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
            <p className="text-sm font-bold text-slate-700">Loading your farm orders...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-black text-slate-900">No Orders Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeFilter === 'ALL'
                  ? "You haven't placed any direct produce orders with farmers yet."
                  : `No orders match the selected filter "${activeFilter}".`}
              </p>
            </div>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-extrabold text-xs shadow-agri-sm hover:shadow-agri-md transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Browse Farmer Marketplace</span>
            </Link>
          </div>
        )}

        {/* Orders List Cards */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const badge = getStatusBadge(order.status);
              const BadgeIcon = badge.icon;
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all overflow-hidden space-y-6 p-6"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-slate-400">Order ID</span>
                        <span className="text-base font-extrabold text-slate-900">{order.orderNumber}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Placed on {formattedDate}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${badge.color}`}
                      >
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>

                      {/* Escrow Status Badge */}
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>KisanSetu Escrow Secured</span>
                      </span>
                    </div>
                  </div>

                  {/* Crop Items & Farmer Info */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Items Purchased (lg:col-span-7) */}
                    <div className="lg:col-span-7 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Produce Purchased</h4>
                      {order.items?.map((item, idx) => {
                        const listingImg = item.listing?.images?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80';

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/60 gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={listingImg}
                                alt={item.cropName}
                                className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                              />
                              <div>
                                <h5 className="text-sm font-black text-slate-900">{item.cropName}</h5>
                                <p className="text-xs text-slate-500 font-semibold">
                                  {item.quantityKg} kg × ₹{item.pricePerKg}/kg
                                </p>
                                {item.batchId && (
                                  <Link
                                    to={`/trace/${item.batchId}`}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 mt-1"
                                  >
                                    <span>Batch #{item.batchId} Traceability</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-400 block">Subtotal</span>
                              <span className="text-sm font-black text-slate-900">₹{item.subtotal?.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Farmer Details Box (lg:col-span-5) */}
                    <div className="lg:col-span-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                        <span className="text-xs font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                          <User className="w-4 h-4 text-emerald-700" />
                          Farmer Information
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-900">
                          Direct Producer
                        </span>
                      </div>

                      {order.items?.[0]?.farmer ? (
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Farmer Name:</span>
                            <span className="font-bold text-slate-900">{order.items[0].farmer.name || 'Verified Farmer'}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600" /> Contact Phone:
                            </span>
                            <a
                              href={`tel:${order.items[0].farmer.phone}`}
                              className="font-bold text-emerald-800 hover:underline"
                            >
                              {order.items[0].farmer.phone || '+91 98765 43210'}
                            </a>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-600" /> Location:
                            </span>
                            <span className="font-bold text-slate-900">
                              {order.items[0].farmer.address?.city || order.items[0].farmer.profileDetails?.location?.district || 'Karnal'},{' '}
                              {order.items[0].farmer.address?.state || 'Haryana'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600 font-medium italic">
                          Verified KisanSetu Partner Farmer
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Progress Stepper Timeline */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Order Progress Timeline</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      {/* Step 1: Order Placed */}
                      <div className="p-3 bg-white rounded-xl border border-emerald-300 shadow-2xs space-y-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs font-bold">
                          ✓
                        </div>
                        <p className="text-xs font-extrabold text-slate-900">1. Placed & Escrow</p>
                        <p className="text-[10px] text-emerald-700 font-medium">Payment Secured</p>
                      </div>

                      {/* Step 2: Farmer Accepted */}
                      <div
                        className={`p-3 rounded-xl border space-y-1 ${
                          ['ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(order.status)
                            ? 'bg-white border-emerald-300 shadow-2xs'
                            : 'bg-slate-100 border-slate-200 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                            ['ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(order.status)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-300 text-slate-600'
                          }`}
                        >
                          {['ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(order.status) ? '✓' : '2'}
                        </div>
                        <p className="text-xs font-extrabold text-slate-900">2. Farmer Acceptance</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {['ACCEPTED', 'PICKUP_VERIFIED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(order.status)
                            ? 'Confirmed & Packed'
                            : 'Pending Confirmation'}
                        </p>
                      </div>

                      {/* Step 3: In Transit */}
                      <div
                        className={`p-3 rounded-xl border space-y-1 ${
                          ['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(order.status)
                            ? 'bg-white border-emerald-300 shadow-2xs'
                            : 'bg-slate-100 border-slate-200 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                            ['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(order.status)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-300 text-slate-600'
                          }`}
                        >
                          {['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(order.status) ? '✓' : '3'}
                        </div>
                        <p className="text-xs font-extrabold text-slate-900">3. Logistics Transit</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(order.status)
                            ? 'On the way'
                            : 'Awaiting Pickup'}
                        </p>
                      </div>

                      {/* Step 4: Delivered */}
                      <div
                        className={`p-3 rounded-xl border space-y-1 ${
                          ['DELIVERED', 'COMPLETED'].includes(order.status)
                            ? 'bg-white border-emerald-300 shadow-2xs'
                            : 'bg-slate-100 border-slate-200 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                            ['DELIVERED', 'COMPLETED'].includes(order.status)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-300 text-slate-600'
                          }`}
                        >
                          {['DELIVERED', 'COMPLETED'].includes(order.status) ? '✓' : '4'}
                        </div>
                        <p className="text-xs font-extrabold text-slate-900">4. Delivered & Done</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {['DELIVERED', 'COMPLETED'].includes(order.status) ? 'Escrow Released' : 'Destination delivery'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Cost & Delivery Summary */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
                    <div className="text-slate-600">
                      <span className="font-bold">Delivery Address:</span>{' '}
                      {order.deliveryAddress
                        ? `${order.deliveryAddress.street || ''}, ${order.deliveryAddress.city || ''}, ${order.deliveryAddress.state || ''} - ${order.deliveryAddress.pincode || ''}`
                        : 'Default Registered Address'}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 font-bold block">Total Amount Paid</span>
                        <span className="text-lg font-black text-slate-900">₹{order.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ConsumerOrdersPage;
